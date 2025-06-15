import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Camera,
  Bell,
  QrCode
} from 'lucide-react'

interface UserMenuProps {
  userType: 'client' | 'business'
}

const UserMenu = ({ userType }: UserMenuProps) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = userType === 'client' ? [
    { icon: User, label: 'Dashboard', path: '/dashboard' },
    { icon: QrCode, label: 'Scanner QR', action: 'scanner' },
    { icon: User, label: 'Mon Profil', path: '/profile' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Paramètres', path: '/settings' }
  ] : [
    { icon: User, label: 'Dashboard', path: '/business' },
    { icon: QrCode, label: 'Scanner Client', action: 'scanner' },
    { icon: User, label: 'Mon Profil', path: '/business/profile' },
    { icon: Bell, label: 'Notifications', path: '/business/notifications' },
    { icon: Settings, label: 'Paramètres', path: '/business/settings' }
  ]

  const handleMenuClick = (item: any) => {
    if (item.action === 'scanner') {
      // Émettez un événement pour ouvrir le scanner
      window.dispatchEvent(new CustomEvent('openScanner'))
    } else if (item.path) {
      navigate(item.path)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-500">
            {userType === 'client' ? 'Client' : 'Entreprise'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* En-tête du menu */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Items du menu */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-4 h-4 text-gray-400" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Section photo de profil */}
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={() => {
                // TODO: Implémenter upload photo
                alert('Upload photo - À implémenter')
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-4 h-4 text-gray-400" />
              <span>Changer la photo</span>
            </button>
          </div>

          {/* Déconnexion */}
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
