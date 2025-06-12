import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Building2, Clock, QrCode, Bell, BarChart3 } from 'lucide-react'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SkipLine
                </span>
              </div>
            </div>

            {/* Boutons d'authentification */}
            <div className="flex items-center space-x-4">
              <Link
                to="/auth"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/auth"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Finies les{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                files d'attente
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              SkipLine révolutionne votre expérience client. Scannez, attendez à distance, 
              et profitez de votre temps libre pendant que nous gérons votre place dans la file.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/auth"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center group"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold transition-colors">
                Voir la démo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0 min</div>
                <div className="text-sm text-gray-600">d'attente physique</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">temps libre</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Instant</div>
                <div className="text-sm text-gray-600">notifications</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features pour les clients */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">Pour les clients</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Votre temps est précieux
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plus jamais d'attente debout. Scannez votre QR code unique et laissez SkipLine 
              gérer votre place pendant que vous profitez de votre temps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Code unique</h3>
              <p className="text-gray-600">
                Un seul QR code personnel pour toutes vos files d'attente
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Suivi en temps réel</h3>
              <p className="text-gray-600">
                Connaissez votre position exacte et le temps d'attente estimé
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Notifications smart</h3>
              <p className="text-gray-600">
                Recevez des alertes quand c'est bientôt votre tour
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features pour les entreprises */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span className="text-purple-600 font-medium">Pour les entreprises</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Optimisez votre service client
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Réduisez les tensions, améliorez l'expérience client et gagnez en efficacité 
              avec notre système de gestion intelligent des files d'attente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Scan simple</h3>
              <p className="text-gray-600">
                Scannez le QR code des clients pour les ajouter instantanément
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion intuitive</h3>
              <p className="text-gray-600">
                Interface simple pour gérer plusieurs files simultanément
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics avancées</h3>
              <p className="text-gray-600">
                Statistiques détaillées pour optimiser votre service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Prêt à révolutionner vos files d'attente ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez les entreprises qui ont déjà adopté SkipLine et offrent 
            une expérience client exceptionnelle.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 group"
          >
            Commencer maintenant
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">SkipLine</span>
            </div>
            <p className="text-gray-400">
              © 2024 SkipLine. Révolutionnons ensemble l'expérience d'attente.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
