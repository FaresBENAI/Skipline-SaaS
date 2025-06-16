import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  QrCode, 
  ArrowLeft, 
  Users, 
  Building2,
  Home,
  LogIn
} from 'lucide-react'
import QRScannerModal from '../components/QRScannerModal'

const QRScanner = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showScanner, setShowScanner] = useState(false)

  const handleBackNavigation = () => {
    if (user) {
      const userType = user.user_metadata?.user_type
      if (userType === 'business') {
        navigate('/business')
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBackNavigation}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {user ? (
                <>
                  <ArrowLeft className="w-5 h-5" />
                  <span>Mon Dashboard</span>
                </>
              ) : (
                <>
                  <Home className="w-5 h-5" />
                  <span>Accueil SkipLine</span>
                </>
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <QrCode className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Scanner QR</span>
            </div>

            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Scanner un QR Code
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scannez le QR code d'une entreprise pour rejoindre sa file d'attente 
            ou découvrir ses services.
          </p>
        </div>

        {/* Options de scan */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Option 1: Scanner entreprise */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                QR Code Entreprise
              </h3>
              <p className="text-gray-600 mb-6">
                Scannez le QR code affiché par une entreprise pour rejoindre 
                ses files d'attente et services.
              </p>
              <button
                onClick={() => setShowScanner(true)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <QrCode className="w-5 h-5" />
                <span>Scanner QR Entreprise</span>
              </button>
            </div>
          </div>

          {/* Option 2: Informations */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Accès Visiteur
              </h3>
              <p className="text-gray-600 mb-6">
                Pas besoin de compte ! Scannez et inscrivez-vous directement 
                avec juste votre email ou téléphone.
              </p>
              {!user && (
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Créer un compte</span>
                </button>
              )}
              {user && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✅ Connecté : {user.user_metadata?.full_name || user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            🚀 Comment ça marche ?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Scannez</h4>
              <p className="text-gray-600 text-sm">
                Pointez votre caméra vers le QR code de l'entreprise
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Choisissez</h4>
              <p className="text-gray-600 text-sm">
                Sélectionnez la file d'attente qui vous intéresse
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Attendez</h4>
              <p className="text-gray-600 text-sm">
                Recevez votre position et temps estimé en temps réel
              </p>
            </div>
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Prêt à scanner votre premier QR code ?
          </p>
          <button
            onClick={() => setShowScanner(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2 mx-auto"
          >
            <QrCode className="w-6 h-6" />
            <span>Commencer le scan</span>
          </button>
        </div>
      </div>

      {/* Scanner Modal */}
      <QRScannerModal 
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        userType="client"
      />
    </div>
  )
}

export default QRScanner
