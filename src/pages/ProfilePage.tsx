import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Camera, Mail, Calendar } from 'lucide-react'

const ProfilePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || ''
  })

  const handleSave = () => {
    // TODO: Implémenter mise à jour profil
    alert('Mise à jour profil - À implémenter')
    setEditing(false)
  }

  const handlePhotoUpload = () => {
    // TODO: Implémenter upload photo
    alert('Upload photo - À implémenter')
  }

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
                <h1 className="text-xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-sm text-gray-600">{userType === 'business' ? 'Entreprise' : 'Client'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Photo de profil */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <button
                onClick={handlePhotoUpload}
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.user_metadata?.full_name || 'Utilisateur'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">
                {userType === 'business' ? 'Compte Entreprise' : 'Compte Client'}
              </p>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{user?.user_metadata?.full_name || 'Non renseigné'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membre depuis
              </label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{new Date(user?.created_at || '').toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
