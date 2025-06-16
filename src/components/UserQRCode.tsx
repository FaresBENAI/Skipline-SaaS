import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import QRCodeLib from 'qrcode'
import { QrCode, Copy, Download, User } from 'lucide-react'

const UserQRCode = () => {
  const { user } = useAuth()
  const [userQrUrl, setUserQrUrl] = useState<string>('')
  const [showQrModal, setShowQrModal] = useState(false)

  useEffect(() => {
    if (user) {
      generateUserQR()
    }
  }, [user])

  const generateUserQR = async () => {
    if (!user) return

    try {
      // Format compatible avec le scanner entreprise
      const qrContent = `SKIPLINE_USER_${user.id}`

      const qrUrl = await QRCodeLib.toDataURL(qrContent, {
        width: 400,
        margin: 2,
        color: {
          dark: '#2563eb',
          light: '#ffffff'
        }
      })
      setUserQrUrl(qrUrl)
    } catch (error) {
      console.error('Erreur génération QR utilisateur:', error)
    }
  }

  const copyQrContent = () => {
    const content = `SKIPLINE_USER_${user?.id}`
    navigator.clipboard.writeText(content)
    alert('Code QR copié dans le presse-papiers !')
  }

  const downloadQR = () => {
    if (userQrUrl && user) {
      const link = document.createElement('a')
      link.download = `qr-client-${user.user_metadata?.full_name || user.email}.png`
      link.href = userQrUrl
      link.click()
    }
  }

  if (!user) return null

  return (
    <>
      <button
        onClick={() => setShowQrModal(true)}
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <QrCode className="w-4 h-4" />
        <span>Mon QR Code</span>
      </button>

      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Mon QR Code Client</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              {userQrUrl ? (
                <div>
                  <div className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50 mb-4">
                    <img
                      src={userQrUrl}
                      alt="Mon QR Code Client"
                      className="w-full max-w-xs mx-auto"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      {user.user_metadata?.full_name || user.email}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">QR Code pour inscription en file</p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-1">Contenu du QR Code :</p>
                    <p className="text-xs font-mono text-gray-800 break-all">
                      SKIPLINE_USER_{user.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={copyQrContent}
                      className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copier Code</span>
                    </button>
                    <button
                      onClick={downloadQR}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger</span>
                    </button>
                  </div>

                  <div className="rounded-lg p-4 bg-blue-50">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Comment utiliser :</strong><br />
                      Montrez ce QR code aux entreprises pour qu'elles vous ajoutent 
                      rapidement à leurs files d'attente ! Plus besoin de donner vos informations.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Génération de votre QR code...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserQRCode
