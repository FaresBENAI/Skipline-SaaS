import { useAuth } from '../contexts/AuthContext'
import { LogOut, QrCode, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ClientDashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <QrCode className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">SkipLine Client</h1>
                <p className="text-sm text-gray-600">Bienvenue {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/scanner')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <QrCode className="w-4 h-4" />
                <span>Scanner QR</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Prêt à rejoindre une file ?
            </h2>
            <p className="text-gray-600 mb-8">
              Scannez le QR code affiché dans l'établissement pour rejoindre automatiquement la file d'attente.
            </p>
            
            <button
              onClick={() => navigate('/scanner')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 flex items-center space-x-3 mx-auto"
            >
              <QrCode className="w-6 h-6" />
              <span>Scanner QR Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
