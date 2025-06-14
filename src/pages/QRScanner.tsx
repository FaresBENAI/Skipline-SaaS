import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, QrCode, AlertCircle, RotateCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const QRScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
    
    const isHTTPS = window.location.protocol === 'https:';
    
    if (checkMobile && !isHTTPS) {
      setError('HTTPS requis pour la caméra sur mobile');
      setShowPermissionHelp(true);
      return;
    }
    
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError('');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Caméra non supportée par ce navigateur');
        return;
      }

      // Arrêter la caméra précédente si elle existe
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: isMobile ? { exact: facingMode } : 'user',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setIsScanning(true);
      }
      
    } catch (err: any) {
      console.error('Erreur accès caméra:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Permission caméra refusée');
        setShowPermissionHelp(true);
      } else if (err.name === 'NotFoundError') {
        setError('Aucune caméra trouvée');
      } else if (err.name === 'NotSupportedError') {
        setError('Caméra non supportée');
      } else if (err.name === 'OverconstrainedError') {
        // Si caméra arrière pas disponible, essayer frontale
        if (facingMode === 'environment') {
          setFacingMode('user');
        } else {
          setError(`Erreur caméra: ${err.message}`);
        }
      } else {
        setError(`Erreur caméra: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const switchCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };

  const handleManualInput = () => {
    const qrContent = prompt('Entrez le contenu du QR Code :');
    if (qrContent) {
      handleScanResult(qrContent);
    }
  };

  const handleScanResult = (data: string) => {
    console.log('QR Code scanné:', data);
    
    try {
      stopCamera();

      if (data.startsWith('http://') || data.startsWith('https://')) {
        window.location.href = data;
      } else if (data.includes('/join/')) {
        const path = data.replace(/^.*?(\/join\/.*)$/, '$1');
        navigate(path);
      } else if (data.startsWith('SKIPLINE_COMPANY_')) {
        const companyCode = data.replace('SKIPLINE_COMPANY_', '');
        navigate(`/join/${companyCode}`);
      } else if (data.startsWith('SKIPLINE_USER_')) {
        const userId = data.replace('SKIPLINE_USER_', '');
        console.log('QR utilisateur scanné:', userId);
        alert('QR Code utilisateur détecté (fonctionnalité à venir)');
        startCamera();
      } else {
        alert('QR Code non reconnu. Format: SKIPLINE_COMPANY_XXX');
        startCamera();
      }
      
    } catch (err) {
      console.error('Erreur traitement QR:', err);
      setError('Erreur lors du traitement du QR code');
    }
  };

  const goBack = () => {
    stopCamera();
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  if (showPermissionHelp) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Permissions Caméra</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">🔒 Problème détecté</h3>
              <p className="text-sm text-orange-700">{error}</p>
            </div>

            {isMobile && window.location.protocol !== 'https:' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📱 Solution Mobile</h3>
                <p className="text-sm text-blue-700">
                  La caméra nécessite HTTPS sur mobile. Utilisez le test manuel ci-dessous.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={startCamera}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer Caméra
            </button>
            
            <button
              onClick={handleManualInput}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Test Manuel QR
            </button>
            
            <button
              onClick={goBack}
              className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={goBack}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-bold">Scanner QR</h1>
            <p className="text-sm text-white/80">
              {isScanning ? `Caméra ${facingMode === 'environment' ? 'arrière' : 'frontale'}` : 'Initialisation...'}
            </p>
          </div>

          <div className="flex space-x-2">
            {isMobile && (
              <button
                onClick={switchCamera}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Changer de caméra"
              >
                <RotateCw className="h-6 w-6" />
              </button>
            )}
            
            <button
              onClick={handleManualInput}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title="Test manuel"
            >
              <QrCode className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full h-screen">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              
              {isScanning && (
                <div className="absolute inset-0">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute inset-0 bg-black/40">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-transparent border-2 border-transparent rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm p-6">
        <div className="text-center text-white">
          <Camera className="h-8 w-8 mx-auto mb-2 text-blue-400" />
          <p className="text-lg font-medium mb-2">Scanner QR SkipLine</p>
          <p className="text-sm text-white/80 mb-4">
            Placez le QR code dans le cadre
          </p>
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={handleManualInput}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Test Manuel QR
            </button>
            
            {isMobile && (
              <button
                onClick={switchCamera}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <RotateCw className="h-4 w-4" />
                <span>Switch</span>
              </button>
            )}
          </div>
          
          {isMobile && (
            <p className="text-xs text-white/60 mt-3">
              📱 Caméra {facingMode === 'environment' ? 'arrière' : 'frontale'} active
            </p>
          )}
        </div>
      </div>

      {error && !showPermissionHelp && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <div className="bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-lg text-center">
            <p className="font-medium">{error}</p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => {
                  setError('');
                  startCamera();
                }}
                className="flex-1 px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={handleManualInput}
                className="flex-1 px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
              >
                Test Manuel
              </button>
            </div>
          </div>
        </div>
      )}

      {!isScanning && !error && (
        <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Démarrage de la caméra...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScannerPage;
