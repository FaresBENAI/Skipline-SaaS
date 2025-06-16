import { useNavigate } from 'react-router-dom'
import { QrCode, Users, Building2, ArrowRight } from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SkipLine</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/auth')}
                className="text-gray-600 hover:text-gray-900"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Révolutionnez vos
            <span className="text-blue-600"> files d'attente</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            SkipLine permet à vos clients de rejoindre vos files d'attente en scannant simplement un QR code.
            Terminé l'attente physique, place à l'expérience digitale !
          </p>
          <div className="mt-10 flex justify-center space-x-6">
            <button
              onClick={() => navigate('/auth')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>Créer mon entreprise</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 flex items-center space-x-2"
            >
              <Users className="h-5 w-5" />
              <span>Créer mon compte</span>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Double Workflow</h3>
            <p className="text-gray-600">Client scanne entreprise OU entreprise scanne client selon vos besoins</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès Universel</h3>
            <p className="text-gray-600">Clients avec ou sans compte peuvent rejoindre vos files</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Building2 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion Centralisée</h3>
            <p className="text-gray-600">Dashboard entreprise pour gérer toutes vos files en temps réel</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
