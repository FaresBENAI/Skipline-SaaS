import { useNavigate } from 'react-router-dom'
import { ArrowRight, Scan, Users, Zap } from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()

  // Logo épuré - juste typographie moderne
  const SkipLineLogo = () => (
    <div className="flex items-center">
      <span className="text-2xl font-light tracking-tight text-gray-900">
        Skip<span className="font-medium">Line</span>
      </span>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header ultra-minimaliste */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <SkipLineLogo />
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/auth')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero ultra-épuré */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="pt-24 pb-20 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 tracking-tight">
            Files d'attente
            <span className="block font-normal text-gray-700 mt-2">
              réinventées
            </span>
          </h1>
          
          <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Système QR intelligent avec double workflow. 
            Simple, efficace, universel.
          </p>

          {/* CTA épuré */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/auth')}
              className="group bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 font-medium"
            >
              <span>Créer mon compte</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/join/demo')}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
            >
              Voir la démo
            </button>
          </div>
        </div>

        {/* Features minimalistes */}
        <div className="py-20 border-t border-gray-100">
          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scan className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Double workflow
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Client scanne entreprise ou entreprise scanne client. 
                Flexibilité totale selon vos besoins.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Accès universel
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Avec ou sans compte, vos clients rejoignent vos files. 
                Aucune barrière, expérience fluide.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Temps réel
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Suivi instantané des positions, notifications automatiques, 
                dashboard centralisé pour tout contrôler.
              </p>
            </div>

          </div>
        </div>

        {/* Section finale épurée */}
        <div className="py-20 text-center border-t border-gray-100">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Prêt à transformer vos files d'attente ?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Rejoignez les entreprises qui ont choisi l'innovation.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium inline-flex items-center space-x-2"
          >
            <span>Commencer maintenant</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </main>

      {/* Footer minimaliste */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 SkipLine. Révolutionnez vos files d'attente.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
