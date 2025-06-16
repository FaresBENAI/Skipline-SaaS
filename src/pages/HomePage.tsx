import { useNavigate } from 'react-router-dom'
import { QrCode, Users, Building2, ArrowRight, Zap, Shield, Clock } from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()

  // Logo SVG moderne pour SkipLine
  const SkipLineLogo = () => (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-indigo-600">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          {/* QR Code stylisé avec effet de mouvement */}
          <rect x="2" y="2" width="6" height="6" fill="url(#logoGradient)" rx="1" />
          <rect x="2" y="24" width="6" height="6" fill="url(#logoGradient)" rx="1" />
          <rect x="24" y="2" width="6" height="6" fill="url(#logoGradient)" rx="1" />
          
          {/* Flèche "skip" dynamique */}
          <path d="M12 8 L20 8 L18 6 M20 8 L18 10" stroke="url(#logoGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M12 16 L20 16 L18 14 M20 16 L18 18" stroke="url(#logoGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M12 24 L20 24 L18 22 M20 24 L18 26" stroke="url(#logoGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Points de connexion */}
          <circle cx="10" cy="8" r="1" fill="#6366f1" />
          <circle cx="10" cy="16" r="1" fill="#6366f1" />
          <circle cx="10" cy="24" r="1" fill="#6366f1" />
        </svg>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
        SkipLine
      </span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header épuré */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <SkipLineLogo />
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/auth')}
                className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section modernisé */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-8">
              <Zap className="w-4 h-4 mr-1" />
              Révolution des files d'attente
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 sm:text-6xl lg:text-7xl">
            Transformez vos
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              files d'attente
            </span>
          </h1>
          
          <p className="mt-8 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            SkipLine révolutionne l'expérience d'attente avec un système QR intelligent. 
            Deux workflows flexibles pour s'adapter à chaque business.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => navigate('/auth')}
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <span>Créer mon entreprise</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/join/demo')}
              className="group border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 flex items-center space-x-2"
            >
              <QrCode className="h-5 w-5" />
              <span>Tester la démo</span>
            </button>
          </div>
        </div>

        {/* Features Section repensée */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Pourquoi choisir SkipLine ?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Une solution complète qui s'adapte à votre façon de travailler
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-indigo-200">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <QrCode className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Double Workflow</h3>
                <p className="text-slate-600 leading-relaxed">
                  Clients scannent votre QR OU vous scannez le leur. 
                  Adaptez-vous à chaque situation business.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-green-200">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Accès Universal</h3>
                <p className="text-slate-600 leading-relaxed">
                  Avec ou sans compte, vos clients peuvent rejoindre vos files. 
                  Zéro friction, maximum de conversion.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-amber-200">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <Building2 className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Contrôle Total</h3>
                <p className="text-slate-600 leading-relaxed">
                  Dashboard temps réel, analytics avancés, 
                  gestion multi-files. Tout ce dont vous avez besoin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section avantages supplémentaires */}
        <div className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl text-white mb-20">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">
              L'avenir des files d'attente est là
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <Clock className="h-10 w-10 text-indigo-400 mb-4" />
                <h3 className="font-semibold mb-2">Temps réel</h3>
                <p className="text-slate-300 text-sm">Suivi instantané des positions</p>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="h-10 w-10 text-green-400 mb-4" />
                <h3 className="font-semibold mb-2">Sécurisé</h3>
                <p className="text-slate-300 text-sm">Données protégées et conformes</p>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="h-10 w-10 text-purple-400 mb-4" />
                <h3 className="font-semibold mb-2">Performance</h3>
                <p className="text-slate-300 text-sm">Architecture scalable et rapide</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
