import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Bell, Users, CheckCircle, Clock } from 'lucide-react'

interface Queue {
  id: string
  name: string
  company_id: string
  is_active: boolean
}

interface QueueEntry {
  id: string
  position: number
  status: string
  user: {
    full_name: string
    email: string
  }
  created_at: string
}

const QueueManagement = () => {
  // DEBUG: Log du début du composant
  console.log('🔥 QueueManagement component started')
  
  const { queueId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  console.log('🎯 Params:', { queueId, user: !!user })
  
  const [queue, setQueue] = useState<Queue | null>(null)
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 useEffect triggered:', { queueId, user: !!user })
    
    if (!queueId) {
      console.error('❌ Pas de queueId!')
      alert('Erreur: Pas d\'ID de file')
      navigate('/business')
      return
    }
    
    if (!user) {
      console.error('❌ Pas d\'utilisateur!')
      alert('Erreur: Utilisateur non connecté')
      navigate('/business')
      return
    }
    
    fetchQueue()
    fetchQueueEntries()
  }, [queueId, user])

  const fetchQueue = async () => {
    console.log('📋 Fetching queue:', queueId)
    
    try {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('id', queueId)
        .single()

      console.log('📋 Queue response:', { data, error })

      if (error) {
        console.error('❌ Erreur récupération file:', error)
        alert(`Erreur DB: ${error.message}`)
        navigate('/business')
        return
      }

      if (!data) {
        console.error('❌ Aucune file trouvée')
        alert('File non trouvée')
        navigate('/business')
        return
      }

      console.log('✅ File récupérée:', data)
      setQueue(data)
    } catch (error) {
      console.error('💥 Erreur fetchQueue:', error)
      alert(`Erreur critique: ${error}`)
      navigate('/business')
    }
  }

  const fetchQueueEntries = async () => {
    console.log('👥 Fetching queue entries for:', queueId)
    
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .eq('queue_id', queueId)
        .in('status', ['waiting', 'called'])
        .order('position', { ascending: true })

      console.log('👥 Entries response:', { data, error })

      if (error) {
        console.error('❌ Erreur récupération entrées:', error)
        // Ne pas rediriger pour cette erreur, juste afficher vide
        setQueueEntries([])
        setLoading(false)
        return
      }

      console.log('✅ Entrées récupérées:', data?.length || 0)
      setQueueEntries(data || [])
      setLoading(false)
    } catch (error) {
      console.error('💥 Erreur fetchQueueEntries:', error)
      setQueueEntries([])
      setLoading(false)
    }
  }

  const callNext = async () => {
    const nextEntry = queueEntries.find(entry => entry.status === 'waiting')
    if (!nextEntry) return

    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ 
          status: 'called',
          called_at: new Date().toISOString()
        })
        .eq('id', nextEntry.id)

      if (error) throw error

      alert(`📢 ${nextEntry.user.full_name || nextEntry.user.email} appelé(e) !`)
      fetchQueueEntries()
    } catch (error) {
      console.error('Erreur appel client:', error)
    }
  }

  const markServed = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ 
          status: 'served',
          served_at: new Date().toISOString()
        })
        .eq('id', entryId)

      if (error) throw error
      fetchQueueEntries()
    } catch (error) {
      console.error('Erreur marquage servi:', error)
    }
  }

  console.log('🎨 Render state:', { loading, queue: !!queue, queueId })

  if (loading) {
    console.log('⏳ Rendering loading state')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la file...</p>
          <p className="text-xs text-gray-500 mt-2">DEBUG: Queue ID = {queueId}</p>
        </div>
      </div>
    )
  }

  if (!queue) {
    console.log('❌ Rendering not found state')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">File non trouvée</p>
          <p className="text-xs text-gray-500 mt-2">DEBUG: Queue ID = {queueId}</p>
          <button
            onClick={() => {
              console.log('🔙 Retour au dashboard')
              navigate('/business')
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  console.log('✅ Rendering main component')
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  console.log('🔙 Navigate back to business')
                  navigate('/business')
                }}
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
              disabled={queueEntries.filter(e => e.status === 'waiting').length === 0}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Bell className="w-5 h-5" />
              <span>Appeler suivant</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Clients dans la file ({queueEntries.length})
            </h2>
            <div className="text-sm text-gray-500">
              🔧 Mode Debug
            </div>
          </div>
          
          {queueEntries.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun client en attente</h3>
              <p className="text-gray-600">
                Les clients apparaîtront ici quand ils scanneront votre QR code
              </p>
              <p className="text-xs text-gray-500 mt-4">
                DEBUG: Queue ID = {queueId}, Entries loaded = {queueEntries.length}
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
