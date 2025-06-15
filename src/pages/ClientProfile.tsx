import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  User, 
  ArrowLeft, 
  Plus,
  Clock,
  Building2
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  qr_code: string | null
}

interface Queue {
  id: string
  name: string
  company_id: string
  is_active: boolean
}

interface Company {
  id: string
  name: string
  owner_id: string
}

const ClientProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [clientProfile, setClientProfile] = useState<UserProfile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [queues, setQueues] = useState<Queue[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToQueue, setAddingToQueue] = useState<string | null>(null)

  useEffect(() => {
    if (userId && user) {
      fetchClientProfile()
      fetchCompanyAndQueues()
    }
  }, [userId, user])

  const fetchClientProfile = async () => {
    try {
      console.log('🔍 Recherche client avec ID:', userId)
      
      // Chercher dans la table profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Erreur récupération profil:', error)
        
        // Créer un profil temporaire pour le test avec le bon format QR
        const tempProfile: UserProfile = {
          id: userId as string,
          email: `test_${userId}@example.com`,
          full_name: `Client Test ${userId}`,
          created_at: new Date().toISOString(),
          qr_code: `SKIPLINE_USER_${userId}`
        }
        setClientProfile(tempProfile)
        return
      }

      console.log('✅ Client trouvé:', data)
      setClientProfile(data)
    } catch (error) {
      console.error('💥 Erreur fetchClientProfile:', error)
      
      // Profil temporaire pour debug
      const tempProfile: UserProfile = {
        id: userId as string,
        email: `test_${userId}@example.com`,
        full_name: `Client Test ${userId}`,
        created_at: new Date().toISOString(),
        qr_code: `SKIPLINE_USER_${userId}`
      }
      setClientProfile(tempProfile)
    }
  }

  const fetchCompanyAndQueues = async () => {
    try {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id)
        .single()

      if (companyError || !companyData) {
        console.error('❌ Erreur récupération entreprise:', companyError)
        alert('Vous devez être connecté en tant qu\'entreprise')
        navigate('/business')
        return
      }

      setCompany(companyData)

      const { data: queuesData, error: queuesError } = await supabase
        .from('queues')
        .select('*')
        .eq('company_id', companyData.id)
        .eq('is_active', true)

      if (queuesError) {
        console.error('❌ Erreur récupération files:', queuesError)
        return
      }

      setQueues(queuesData || [])
    } catch (error) {
      console.error('💥 Erreur fetchCompanyAndQueues:', error)
    } finally {
      setLoading(false)
    }
  }

  const addClientToQueue = async (queueId: string) => {
    if (!clientProfile || !company) return

    setAddingToQueue(queueId)

    try {
      // Vérifier si déjà dans la file
      const { data: existingEntry } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('queue_id', queueId)
        .eq('user_id', clientProfile.id)
        .in('status', ['waiting', 'called'])
        .single()

      if (existingEntry) {
        alert('Ce client est déjà dans cette file d\'attente !')
        setAddingToQueue(null)
        return
      }

      // Récupérer la dernière position
      const { data: lastPosition, error: positionError } = await supabase
        .from('queue_entries')
        .select('position')
        .eq('queue_id', queueId)
        .order('position', { ascending: false })
        .limit(1)

      if (positionError) {
        console.error('❌ Erreur récupération position:', positionError)
        throw positionError
      }

      const newPosition = (lastPosition?.[0]?.position || 0) + 1

      // Ajouter à la file
      const { error } = await supabase
        .from('queue_entries')
        .insert([
          {
            queue_id: queueId,
            user_id: clientProfile.id,
            position: newPosition,
            status: 'waiting'
          }
        ])

      if (error) throw error

      const selectedQueue = queues.find(q => q.id === queueId)
      alert(`✅ ${clientProfile.full_name || clientProfile.email} ajouté à la file "${selectedQueue?.name}" en position ${newPosition}`)
      
      navigate(`/business/queue/${queueId}`)

    } catch (error) {
      console.error('💥 Erreur ajout client à la file:', error)
      alert('Erreur lors de l\'ajout du client à la file')
    } finally {
      setAddingToQueue(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil client...</p>
        </div>
      </div>
    )
  }

  if (!clientProfile || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Profil client non trouvé</p>
          <p className="text-sm text-gray-600 mt-2">ID recherché: {userId}</p>
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
                <h1 className="text-xl font-bold text-gray-900">Fiche Client</h1>
                <p className="text-sm text-gray-600">{company.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {clientProfile.full_name || 'Client sans nom'}
              </h2>
              <p className="text-gray-600">{clientProfile.email}</p>
              <p className="text-sm text-gray-500">
                Client depuis {new Date(clientProfile.created_at).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-xs text-gray-400">
                QR: {clientProfile.qr_code || `SKIPLINE_USER_${clientProfile.id.substring(0, 8)}`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Ajouter à une file d'attente
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>{company.name}</span>
            </div>
          </div>

          {queues.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucune file disponible</h4>
              <p className="text-gray-600">
                Créez d'abord des files d'attente dans votre dashboard entreprise
              </p>
              <button
                onClick={() => navigate('/business')}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Aller au dashboard
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {queues.map((queue) => (
                <div
                  key={queue.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{queue.name}</h4>
                    <p className="text-sm text-gray-600">File d'attente active</p>
                  </div>
                  <button
                    onClick={() => addClientToQueue(queue.id)}
                    disabled={addingToQueue === queue.id}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToQueue === queue.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Ajout...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Ajouter</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Comment ça marche :</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Sélectionnez la file d'attente appropriée</li>
              <li>Le client sera automatiquement ajouté en dernière position</li>
              <li>Il recevra une notification sur son dashboard</li>
              <li>Vous pourrez le gérer depuis la page de gestion de file</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientProfile
