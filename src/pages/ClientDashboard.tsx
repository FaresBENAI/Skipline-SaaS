import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  User, 
  LogOut, 
  Clock, 
  CheckCircle,
  QrCode,
  Copy,
  Download,
  Eye,
  Building2
} from 'lucide-react'
import QRCodeLib from 'qrcode'

interface QueueEntry {
  id: string
  position: number
  status: string
  created_at: string
  queue: {
    name: string
    company: {
      name: string
    }
  }
}

const ClientDashboard = () => {
  const { user, signOut } = useAuth()
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userQrUrl, setUserQrUrl] = useState<string>('')
  const [showQrModal, setShowQrModal] = useState(false)
  const baseUrl = window.location.origin

  useEffect(() => {
    if (user) {
      fetchQueueEntries()
      generateUserQR()
    }
  }, [user])

  const fetchQueueEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select(`
          *,
          queue:queues(
            name,
            company:companies(name)
          )
        `)
        .eq('user_id', user?.id)
        .in('status', ['waiting', 'called'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur récupération files:', error)
        return
      }

      setQueueEntries(data || [])
    } catch (error) {
      console.error('Erreur fetchQueueEntries:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateUserQR = async () => {
    if (!user) return

    try {
      // QR Code qui mène vers le profil client avec ses infos
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
    alert('Code client copié dans le presse-papiers !')
  }

  const downloadQR = () => {
    if (userQrUrl && user) {
      const link = document.createElement('a')
      link.download = `qr-client-${user.email.split('@')[0]}.png`
      link.href = userQrUrl
      link.click()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {user?.user_metadata?.full_name || 'Mon Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">Client SkipLine</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <QrCode className="w-4 h-4" />
                <span>Mon QR Code</span>
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
        {/* Section QR Code prominente */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <QrCode className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-blue-900 font-bold text-lg">Votre QR Code Client</h3>
                <p className="text-blue-700 text-sm">
                  Présentez ce code aux entreprises pour vous inscrire rapidement dans leurs files d'attente
                </p>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowQrModal(true)}
                className="bg-white border-2 border-blue-200 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-50 flex items-center space-x-2 font-medium"
              >
                <Eye className="w-5 h-5" />
                <span>Afficher mon QR</span>
              </button>
              <p className="text-xs text-blue-600 mt-2">👆 Cliquez pour voir votre code</p>
            </div>
          </div>
        </div>

        {/* Mes files d'attente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Mes files d'attente ({queueEntries.length})</h2>
            <div className="text-sm text-gray-500">
              ⏱️ Actualisation en temps réel
            </div>
          </div>

          {queueEntries.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune file d'attente</h3>
              <p className="text-gray-600 mb-6">
                Vous n'êtes actuellement dans aucune file d'attente
              </p>
              <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                <h4 className="font-semibold text-blue-900 mb-3">🚀 Comment ça marche :</h4>
                <ol className="text-sm text-blue-800 space-y-2 text-left list-decimal list-inside">
                  <li>Cliquez sur <strong>"Mon QR Code"</strong> en haut</li>
                  <li>Présentez votre QR code à l'entreprise</li>
                  <li>Ils le scannent et vous ajoutent à leur file</li>
                  <li>Vous apparaissez ici automatiquement !</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {queueEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    entry.status === 'called'
                      ? 'border-yellow-300 bg-yellow-50 shadow-lg'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${
                          entry.status === 'called' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          #{entry.position}
                        </div>
                        <div className="text-xs text-gray-600">Position</div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {entry.queue.name}
                        </h3>
                        <p className="text-gray-600">{entry.queue.company.name}</p>
                        <p className="text-sm text-gray-500">
                          Inscrit à {new Date(entry.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      {entry.status === 'waiting' && (
                        <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">En attente</span>
                        </div>
                      )}
                      {entry.status === 'called' && (
                        <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">🔔 C'est votre tour !</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {entry.status === 'called' && (
                    <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                      <p className="text-yellow-800 font-semibold text-center">
                        📢 Vous êtes appelé ! Présentez-vous au comptoir de {entry.queue.company.name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal QR Code Client */}
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
                      alt="Mon QR Code"
                      className="w-full max-w-xs mx-auto"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      {user?.user_metadata?.full_name || user?.email}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">QR Code de votre profil client</p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-1">Code technique :</p>
                    <p className="text-xs font-mono text-gray-800 break-all">
                      SKIPLINE_USER_{user?.id}
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
                      Présentez ce QR code aux entreprises partenaires SkipLine. 
                      Ils le scannent pour accéder à votre fiche et vous ajouter 
                      rapidement à la file d'attente de votre choix !
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
    </div>
  )
}

export default ClientDashboard
