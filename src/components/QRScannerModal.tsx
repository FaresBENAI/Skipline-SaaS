import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { X, QrCode, RotateCw } from 'lucide-react'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  userType: 'client' | 'business'
}

const QRScannerModal = ({ isOpen, onClose, userType }: QRScannerModalProps) => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [isOpen, facingMode])

  const startCamera = async () => {
    try {
      setError('')
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Caméra non supportée par ce navigateur')
        return
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setIsScanning(true)
      }
      
    } catch (err: any) {
      console.error('Erreur accès caméra:', err)
      setError(`Erreur caméra: ${err.message}`)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const switchCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment')
  }

  const handleManualInput = () => {
    const qrContent = prompt('Entrez le contenu du QR Code :')
    if (qrContent) {
      handleScanResult(qrContent)
    }
  }

  const handleScanResult = (data: string) => {
    console.log('QR Code scanné:', data)
    
    try {
      stopCamera()
      onClose()

      if (userType === 'client') {
        // Client scanne QR entreprise
        if (data.startsWith('http') && data.includes('/join/')) {
          const path = data.replace(/^.*?(\/join\/.*)$/, '$1')
          navigate(path)
        } else if (data.includes('/join/')) {
          navigate(data)
        } else {
          alert('QR Code non reconnu pour client')
        }
      } else {
        // Entreprise scanne QR client
        if (data.startsWith('SKIPLINE_USER_')) {
          const userId = data.replace('SKIPLINE_USER_', '')
          navigate(`/client/${userId}`)
        } else {
          alert('QR Code client non reconnu')
        }
      }
      
    } catch (err) {
      console.error('Erreur traitement QR:', err)
      setError('Erreur lors du traitement du QR code')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            Scanner QR {userType === 'client' ? 'Entreprise' : 'Client'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scanner */}
        <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          
          {/* Overlay de scan */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              </div>
            </div>

            <div className="absolute inset-0 bg-black/40">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-transparent border-2 border-transparent rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"></div>
              </div>
            </div>
          </div>

          {!isScanning && !error && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Démarrage caméra...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <p className="font-medium mb-2">{error}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contrôles */}
        <div className="p-4 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              {userType === 'client' 
                ? 'Scannez le QR code de l\'entreprise' 
                : 'Scannez le QR code du client'
              }
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleManualInput}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Test Manuel</span>
            </button>
            
            <button
              onClick={switchCamera}
              className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Caméra {facingMode === 'environment' ? 'arrière' : 'frontale'} active
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScannerModal
