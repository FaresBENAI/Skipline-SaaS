import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, QrCode, RotateCw } from 'lucide-react'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  userType: 'client' | 'business'
}

const QRScannerModal = ({ isOpen, onClose, userType }: QRScannerModalProps) => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
      setDebugInfo('🎥 Démarrage caméra...')
      
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
        setDebugInfo('📸 Caméra prête, scan en cours...')
        startQRDetection()
      }
      
    } catch (err: any) {
      console.error('Erreur accès caméra:', err)
      setError(`Erreur caméra: ${err.message}`)
    }
  }

  const startQRDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    // Test support BarcodeDetector
    const hasBarcode = 'BarcodeDetector' in window
    setDebugInfo(`🔍 Scan actif (BarcodeDetector: ${hasBarcode ? '✅' : '❌'})`)
    
    scanIntervalRef.current = setInterval(() => {
      scanForQRCode()
    }, 500)
  }

  const scanForQRCode = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code']
        })

        barcodeDetector.detect(canvas)
          .then((barcodes: any[]) => {
            if (barcodes.length > 0) {
              const qrData = barcodes[0].rawValue
              console.log('🎯 QR détecté via BarcodeDetector:', qrData)
              setDebugInfo(`✅ QR trouvé: ${qrData.substring(0, 20)}...`)
              handleScanResult(qrData)
            }
          })
          .catch((error: any) => {
            console.log('Erreur BarcodeDetector:', error)
          })
      } else {
        // Fallback: analyse basique
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        analyzeImageData(imageData)
      }
    } catch (error) {
      console.log('Erreur scan QR:', error)
    }
  }

  const analyzeImageData = (imageData: ImageData) => {
    const data = imageData.data
    let darkPixels = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (r + g + b) / 3
      
      if (brightness < 128) {
        darkPixels++
      }
    }
    
    const ratio = darkPixels / (data.length / 4)
    
    if (ratio > 0.1 && ratio < 0.7) {
      console.log('🔍 Pattern possible détecté (fallback), ratio:', ratio)
      setDebugInfo(`🔍 Pattern détecté: ${(ratio * 100).toFixed(1)}%`)
    }
  }

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
    setDebugInfo('')
  }

  const switchCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment')
  }

  const handleManualInput = () => {
    const qrContent = prompt('Entrez le contenu du QR Code (ex: SKIPLINE_USER_123):')
    if (qrContent) {
      console.log('🔍 QR saisi manuellement:', qrContent)
      setDebugInfo(`✅ Manuel: ${qrContent}`)
      handleScanResult(qrContent)
    }
  }

  const handleScanResult = (data: string) => {
    console.log('🎯 QR Code traité:', data)
    console.log('👤 Type utilisateur:', userType)
    
    try {
      stopCamera()
      onClose()

      if (userType === 'client') {
        // Client scanne QR entreprise
        if (data.startsWith('http') && data.includes('/join/')) {
          const path = data.replace(/^.*?(\/join\/.*)$/, '$1')
          console.log('🏢 Navigation vers:', path)
          navigate(path)
        } else if (data.includes('/join/')) {
          console.log('🏢 Navigation vers:', data)
          navigate(data)
        } else {
          alert('❌ QR Code entreprise non reconnu')
        }
      } else {
        // Entreprise scanne QR client
        if (data.startsWith('SKIPLINE_USER_')) {
          const userId = data.replace('SKIPLINE_USER_', '')
          const profilePath = `/client/${userId}`
          console.log('👤 Navigation vers profil client:', profilePath)
          navigate(profilePath)
        } else if (data.startsWith('QR_')) {
          const parts = data.split('_')
          if (parts.length >= 2) {
            const userId = parts[1]
            const profilePath = `/client/${userId}`
            console.log('👤 Navigation vers profil client (format DB):', profilePath)
            navigate(profilePath)
          } else {
            alert('❌ Format QR invalide')
          }
        } else {
          alert('❌ QR Code client non reconnu. Format attendu: SKIPLINE_USER_XXX ou QR_XXX')
          console.log('❌ Données reçues:', data)
        }
      }
      
    } catch (err) {
      console.error('💥 Erreur traitement QR:', err)
      setError('Erreur lors du traitement du QR code')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        <canvas ref={canvasRef} className="hidden" />
        
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

        <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-0.5 bg-blue-500 animate-pulse"></div>
                  </div>
                )}
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

          {/* Debug info overlay */}
          {debugInfo && (
            <div className="absolute top-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded">
              {debugInfo}
            </div>
          )}
        </div>

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
            {isScanning && (
              <p className="text-xs text-green-600 mt-1">🔍 Scan en cours...</p>
            )}
            {debugInfo && (
              <p className="text-xs text-blue-600 mt-1">{debugInfo}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScannerModal
