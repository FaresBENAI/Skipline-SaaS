import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Shield, Smartphone, Globe } from 'lucide-react'

const SettingsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  })

  const userType = user?.user_metadata?.user_type

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(userType === 'business' ? '/business' : '/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-sm text-gray-600">Configuration de votre compte</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Notifications par email</h3>
                  <p className="text-sm text-gray-600">Recevoir les alertes par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Notifications push</h3>
                  <p className="text-sm text-gray-600">Notifications sur votre appareil</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">SMS</h3>
                  <p className="text-sm text-gray-600">Alerts par SMS (bientôt disponible)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer opacity-50">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Sécurité</h2>
            </div>
            
            <div className="space-y-4">
              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Changer le mot de passe</h3>
                <p className="text-sm text-gray-600">Mettre à jour votre mot de passe</p>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Authentification à deux facteurs</h3>
                <p className="text-sm text-gray-600">Sécuriser votre compte (bientôt disponible)</p>
              </button>
            </div>
          </div>

          {/* Préférences */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Préférences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Langue</h3>
                  <p className="text-sm text-gray-600">Français</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Modifier
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Fuseau horaire</h3>
                  <p className="text-sm text-gray-600">Europe/Paris</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Modifier
                </button>
              </div>
            </div>
          </div>

          {/* Actions dangereuses */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-red-900 mb-4">Zone de danger</h2>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Supprimer mon compte
            </button>
            <p className="text-sm text-red-700 mt-2">
              Cette action est irréversible. Toutes vos données seront supprimées.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
