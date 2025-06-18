import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { NotificationService } from '../services/notificationService'
import { ArrowLeft, Bell, Users, CheckCircle, Clock } from 'lucide-react'

interface Queue {
  id: string
  name: string
  company_id: string
  is_active: boolean
  companies?: {
    name: string
  }
}

interface QueueEntry {
  id: string
  position: number
  status: string
  user: {
    full_name: string
    email: string
    phone?: string
  }
  created_at: string
}

const QueueManagement = () => {
  const { queueId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [queue, setQueue] = useState<Queue | null>(null)
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [calling, setCalling] = useState(false)

  useEffect(() => {
    if (queueId && user) {
      fetchQueue()
      fetchQueueEntries()
      
      // Actualisation auto toutes les 10 secondes
      const interval = setInterval(fetchQueueEntries, 10000)
      return () => clearInterval(interval)
    }
  }, [queueId, user])

  const fetchQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('queues')
        .select(`
          *,
          companies(name)
        `)
        .eq('id', queueId)
        .single()

      if (error || !data) {
        console.error('Erreur récupération file:', error)
        navigate('/business')
        return
      }

      setQueue(data)
    } catch (error) {
      console.error('Erreur fetchQueue:', error)
      navigate('/business')
    }
  }

  const fetchQueueEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select(`
          *,
          user:profiles(full_name, email, phone)
        `)
        .eq('queue_id', queueId)
        .in('status', ['waiting', 'called'])
        .order('position', { ascending: true })

      if (error) {
        console.error('Erreur récupération entrées:', error)
        setQueueEntries([])
      } else {
        setQueueEntries(data || [])
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Erreur fetchQueueEntries:', error)
      setQueueEntries([])
      setLoading(false)
    }
  }

  const callNext = async () => {
    const nextEntry = queueEntries.find(entry => entry.status === 'waiting')
    if (!nextEntry) {
      alert('Aucun client en attente')
      return
    }

    setCalling(true)
    
    try {
      console.log('🔄 Début appel client:', {
        entryId: nextEntry.id,
        userName: nextEntry.user?.full_name,
        userEmail: nextEntry.user?.email,
        queueId: queueId
      })
      
      // Étape 1: Mettre à jour le statut vers 'called'
      console.log('📝 Mise à jour statut...')
      const { data: updateData, error: updateError } = await supabase
        .from('queue_entries')
        .update({ 
          status: 'called'
        })
        .eq('id', nextEntry.id)
        .select()

      console.log('📝 Résultat mise à jour:', { updateData, updateError })

      if (updateError) {
        console.error('❌ Erreur UPDATE:', updateError)
        throw new Error(`Erreur DB: ${updateError.message || 'Inconnue'}`)
      }

      console.log('✅ Statut mis à jour vers "called"')

      // Étape 2: Notification (optionnelle)
      if (nextEntry.user?.email && queue?.companies?.name) {
        try {
          console.log('📧 Tentative notification...')
          
          const notifResult = await NotificationService.notifyQueueCalled(
            nextEntry.id,
            nextEntry.user.email,
            nextEntry.user.full_name || 'Client',
            queue.companies.name,
            queue.name,
            nextEntry.user.phone
          )
          
          console.log('✅ Notification résultat:', notifResult)
        } catch (notifError) {
          console.error('⚠️ Erreur notification (non bloquante):', notifError)
          // Ne pas faire échouer le processus pour la notification
        }
      } else {
        console.log('⚠️ Notification non envoyée:', {
          hasEmail: !!nextEntry.user?.email,
          hasCompanyName: !!queue?.companies?.name
        })
      }

      // Étape 3: Succès
      alert(`📢 ${nextEntry.user?.full_name || nextEntry.user?.email || 'Client'} appelé(e) !`)
      await fetchQueueEntries() // Recharger la liste
      
    } catch (error) {
      console.error('❌ ERREUR COMPLÈTE:', error)
      console.error('❌ ERREUR TYPE:', typeof error)
      console.error('❌ ERREUR STACK:', error)
      
      let errorMessage = 'Erreur inconnue'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error)
      }
      
      alert('ERREUR DÉTAILLÉE: ' + errorMessage)
    } finally {
      setCalling(false)
    }
  }

  const markServed = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ 
          status: 'served'
        })
        .eq('id', entryId)

      if (error) throw error
      fetchQueueEntries()
    } catch (error) {
      console.error('Erreur marquage servi:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      alert('Erreur lors du marquage: ' + errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la file...</p>
        </div>
      </div>
    )
  }

  if (!queue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">File non trouvée</p>
          <button
            onClick={() => navigate('/business')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/business')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{queue.name}</h1>
                <p className="text-sm text-gray-600">Gestion de la file d'attente</p>
              </div>
            </div>
            <button
              onClick={callNext}
              disabled={queueEntries.filter(e => e.status === 'waiting').length === 0 || calling}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bell className="w-5 h-5" />
              <span>{calling ? 'Appel en cours...' : 'Appeler suivant'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {queueEntries.filter(e => e.status === 'waiting').length}
            </div>
            <div className="text-gray-600">En attente</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {queueEntries.filter(e => e.status === 'called').length}
            </div>
            <div className="text-gray-600">Appelés</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {queueEntries.length}
            </div>
            <div className="text-gray-600">Total actuel</div>
          </div>
        </div>

        {/* Liste des clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Clients dans la file ({queueEntries.length})
            </h2>
            <div className="text-sm text-gray-500">
              ⏱️ Actualisation automatique
            </div>
          </div>
          
          {queueEntries.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun client en attente</h3>
              <p className="text-gray-600">
                Les clients apparaîtront ici quand ils scanneront votre QR code
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {queueEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                    entry.status === 'called' 
                      ? 'border-yellow-300 bg-yellow-50 shadow-md' 
                      : index === 0 && entry.status === 'waiting'
                      ? 'border-blue-300 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        entry.status === 'called' ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        #{entry.position}
                      </div>
                      {index === 0 && entry.status === 'waiting' && (
                        <div className="text-xs text-blue-600 font-medium">SUIVANT</div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {entry.user?.full_name || 'Client sans nom'}
                      </h4>
                      <p className="text-gray-600">{entry.user?.email || 'Email non disponible'}</p>
                      <p className="text-sm text-gray-500">
                        Arrivé à {new Date(entry.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {entry.status === 'waiting' && (
                      <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4 inline mr-1" />
                        En attente
                      </span>
                    )}
                    {entry.status === 'called' && (
                      <>
                        <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                          <Bell className="w-4 h-4 inline mr-1" />
                          Appelé
                        </span>
                        <button
                          onClick={() => markServed(entry.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Marquer servi</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QueueManagement
