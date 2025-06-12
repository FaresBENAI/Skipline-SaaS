import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Building2, 
  Users, 
  QrCode, 
  Plus, 
  Clock,
  Bell,
  LogOut,
  AlertCircle,
  CheckCircle,
  Wifi,
  User
} from 'lucide-react'

interface Company {
  id: string
  name: string
  description: string | null
  owner_id: string
  is_active: boolean
  created_at: string
}

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

const BusinessDashboard = () => {
  const { user, signOut } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [queues, setQueues] = useState<Queue[]>([])
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null)
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateQueue, setShowCreateQueue] = useState(false)
  const [manualQr, setManualQr] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [profileStatus, setProfileStatus] = useState<string>('')
  
  // Formulaires
  const [companyForm, setCompanyForm] = useState({ name: '', description: '' })
  const [queueForm, setQueueForm] = useState({ name: '' })

  useEffect(() => {
    console.log('🚀 BusinessDashboard démarré')
    if (user) {
      checkAndCreateProfile()
    }
  }, [user])

  useEffect(() => {
    if (company) {
      fetchQueues()
    }
  }, [company])

  useEffect(() => {
    if (selectedQueue) {
      fetchQueueEntries()
    }
  }, [selectedQueue])

  const checkAndCreateProfile = async () => {
    try {
      console.log('👤 Vérification profil pour user:', user?.id)
      
      // Vérifier si le profil existe
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)

      console.log('📊 Profil existant:', { data: existingProfile, error: checkError })

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erreur vérification profil:', checkError)
        setProfileStatus(`❌ Erreur vérification: ${checkError.message}`)
        return
      }

      // Si pas de profil, le créer
      if (!existingProfile || existingProfile.length === 0) {
        console.log('🛠️ Création du profil manquant...')
        setProfileStatus('🔧 Création du profil en cours...')
        
        const qrCode = `SKIPLINE_${user?.id?.replace(/-/g, '').substring(0, 8).toUpperCase()}_${Date.now()}`
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user?.id,
              email: user?.email!,
              full_name: user?.user_metadata?.full_name || null,
              user_type: user?.user_metadata?.user_type || 'business',
              qr_code: qrCode
            }
          ])
          .select()

        if (createError) {
          console.error('❌ Erreur création profil:', createError)
          setProfileStatus(`❌ Erreur création profil: ${createError.message}`)
          setError(`Impossible de créer le profil: ${createError.message}`)
          return
        }

        console.log('✅ Profil créé:', newProfile)
        setProfileStatus('✅ Profil créé avec succès')
      } else {
        console.log('✅ Profil existant trouvé')
        setProfileStatus('✅ Profil existant')
      }

      // Maintenant chercher l'entreprise
      await fetchCompany()

    } catch (error) {
      console.error('💥 Erreur checkAndCreateProfile:', error)
      setProfileStatus(`💥 Erreur: ${error}`)
      setError(`Erreur profil: ${error}`)
    }
  }

  const fetchCompany = async () => {
    try {
      console.log('🏢 Recherche entreprise pour user:', user?.id)
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id)

      console.log('📊 Réponse companies:', { data, error })

      if (error) {
        console.error('❌ Erreur récupération entreprise:', error)
        setError(`Erreur recherche entreprise: ${error.message}`)
        return
      }

      const companyData = data && data.length > 0 ? data[0] : null
      console.log('🏢 Entreprise trouvée:', companyData)
      setCompany(companyData)
      
    } catch (error) {
      console.error('💥 Erreur fetchCompany:', error)
      setError(`Erreur: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchQueues = async () => {
    if (!company) return

    try {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('company_id', company.id)

      if (error) {
        console.error('❌ Erreur récupération files:', error)
        return
      }

      setQueues(data || [])
    } catch (error) {
      console.error('💥 Erreur fetchQueues:', error)
    }
  }

  const fetchQueueEntries = async () => {
    if (!selectedQueue) return

    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .eq('queue_id', selectedQueue.id)
        .in('status', ['waiting', 'called'])
        .order('position', { ascending: true })

      if (error) {
        console.error('Erreur récupération entrées:', error)
        return
      }

      setQueueEntries(data || [])
    } catch (error) {
      console.error('Erreur fetchQueueEntries:', error)
    }
  }

  const createCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🛠️ Début création entreprise')
    
    if (!companyForm.name.trim()) {
      setError('Le nom de l\'entreprise est requis')
      return
    }

    setCreating(true)
    setError('')
    
    try {
      // Vérifier encore une fois que le profil existe
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id)
        .single()

      if (!profileCheck) {
        setError('Profil manquant. Rechargez la page.')
        return
      }

      const companyData = {
        name: companyForm.name.trim(),
        description: companyForm.description.trim() || null,
        owner_id: user?.id
      }
      
      console.log('📤 Création entreprise:', companyData)
      
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()

      console.log('📨 Réponse création:', { data, error })

      if (error) {
        console.error('❌ Erreur création entreprise:', error)
        
        let errorMessage = 'Erreur inconnue'
        
        if (error.message.includes('foreign key')) {
          errorMessage = 'Erreur de profil utilisateur. Rechargez la page et réessayez.'
        } else if (error.message.includes('duplicate')) {
          errorMessage = 'Une entreprise existe déjà pour cet utilisateur.'
        } else {
          errorMessage = error.message
        }
        
        setError(errorMessage)
        return
      }

      if (!data || data.length === 0) {
        setError('Aucune donnée retournée')
        return
      }

      console.log('✅ Entreprise créée:', data[0])
      setCompany(data[0])
      setCompanyForm({ name: '', description: '' })
      
    } catch (error: any) {
      console.error('💥 Erreur catch:', error)
      setError(error.message || error.toString())
    } finally {
      setCreating(false)
    }
  }

  const createQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!company) return

    try {
      const { data, error } = await supabase
        .from('queues')
        .insert([
          {
            name: queueForm.name,
            company_id: company.id
          }
        ])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setQueues([...queues, data[0]])
        setShowCreateQueue(false)
        setQueueForm({ name: '' })
      }
    } catch (error) {
      console.error('Erreur création file:', error)
      alert('Erreur lors de la création de la file')
    }
  }

  const addToQueue = async (qrCode: string) => {
    if (!selectedQueue) {
      alert('Veuillez sélectionner une file d\'attente')
      return
    }

    if (!qrCode.trim()) {
      alert('Code QR vide')
      return
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name, email, user_type')
        .eq('qr_code', qrCode.trim())
        .eq('user_type', 'client')
        .single()

      if (userError || !userData) {
        alert('QR Code invalide ou utilisateur non trouvé')
        return
      }

      const { data: existingEntry } = await supabase
        .from('queue_entries')
        .select('id')
        .eq('queue_id', selectedQueue.id)
        .eq('user_id', userData.id)
        .in('status', ['waiting', 'called'])
        .maybeSingle()

      if (existingEntry) {
        alert(`${userData.full_name || userData.email} est déjà dans cette file d'attente`)
        return
      }

      const { data: lastEntry } = await supabase
        .from('queue_entries')
        .select('position')
        .eq('queue_id', selectedQueue.id)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle()

      const newPosition = (lastEntry?.position || 0) + 1

      const { error: insertError } = await supabase
        .from('queue_entries')
        .insert([
          {
            queue_id: selectedQueue.id,
            user_id: userData.id,
            position: newPosition,
            status: 'waiting'
          }
        ])

      if (insertError) throw insertError

      alert(`✅ ${userData.full_name || userData.email} ajouté(e) à la position ${newPosition}`)
      
      fetchQueueEntries()
      setManualQr('')

    } catch (error) {
      console.error('Erreur ajout à la file:', error)
      alert('Erreur lors de l\'ajout à la file d\'attente')
    }
  }

  const callNext = async () => {
    if (!selectedQueue || queueEntries.length === 0) return

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initialisation...</p>
          <p className="mt-2 text-sm text-gray-500">{profileStatus}</p>
        </div>
      </div>
    )
  }

  // Pas d'entreprise créée
  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Dashboard Entreprise</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
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

        <div className="max-w-2xl mx-auto px-4 py-16">
          {/* Status profil */}
          <div className={`border rounded-lg p-4 mb-6 ${
            profileStatus.includes('✅') 
              ? 'bg-green-50 border-green-200' 
              : profileStatus.includes('🔧')
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              <p className="text-sm font-medium">{profileStatus}</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <Building2 className="w-20 h-20 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Créez votre entreprise
            </h2>
            <p className="text-gray-600">
              Votre profil est configuré. Créez maintenant votre entreprise !
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={createCompany} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Restaurant Le Gourmet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description de votre entreprise..."
                  rows={4}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-red-800 font-medium">Erreur de création</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={creating || !companyForm.name.trim() || !profileStatus.includes('✅')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </span>
                ) : (
                  'Créer mon entreprise'
                )}
              </button>

              {!profileStatus.includes('✅') && (
                <p className="text-sm text-yellow-600 text-center">
                  ⏳ En attente de la configuration du profil...
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Interface principale avec entreprise
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-sm text-gray-600">Dashboard de gestion</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <h3 className="text-green-800 font-semibold">Entreprise créée avec succès !</h3>
              <p className="text-green-700 text-sm">
                {company.name} • Créée le {new Date(company.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Files d'attente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Files d'attente</h2>
                <button
                  onClick={() => setShowCreateQueue(true)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {queues.map((queue) => (
                  <div
                    key={queue.id}
                    onClick={() => setSelectedQueue(queue)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedQueue?.id === queue.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{queue.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">🟢 Active</p>
                  </div>
                ))}

                {queues.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune file créée</p>
                    <button
                      onClick={() => setShowCreateQueue(true)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Créer la première file
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gestion file */}
          <div className="lg:col-span-2">
            {selectedQueue ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">{selectedQueue.name}</h2>

                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">
                      �� Ajouter un client via son code QR :
                    </h4>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={manualQr}
                        onChange={(e) => setManualQr(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Collez le code QR du client ici..."
                      />
                      <button
                        onClick={() => addToQueue(manualQr)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Ajouter
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Le client doit vous montrer son QR code depuis son dashboard
                    </p>
                  </div>

                  <button
                    onClick={callNext}
                    disabled={queueEntries.filter(e => e.status === 'waiting').length === 0}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Appeler suivant</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Clients ({queueEntries.length})</h3>
                  
                  {queueEntries.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun client dans la file</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Utilisez le champ ci-dessus pour ajouter des clients
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {queueEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            entry.status === 'called' 
                              ? 'border-yellow-200 bg-yellow-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-lg font-bold text-blue-600">#{entry.position}</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {entry.user.full_name || entry.user.email}
                              </h4>
                              <p className="text-sm text-gray-600">{entry.user.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {entry.status === 'waiting' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                En attente
                              </span>
                            )}
                            {entry.status === 'called' && (
                              <>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  Appelé
                                </span>
                                <button
                                  onClick={() => markServed(entry.id)}
                                  className="text-green-600 hover:text-green-700 text-sm"
                                >
                                  Marquer servi
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
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <QrCode className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Créez votre première file d'attente
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Commencez par créer une file pour organiser vos clients
                  </p>
                  <button
                    onClick={() => setShowCreateQueue(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Créer une file
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal création file */}
      {showCreateQueue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nouvelle file d'attente</h3>
            
            <form onSubmit={createQueue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la file *
                </label>
                <input
                  type="text"
                  value={queueForm.name}
                  onChange={(e) => setQueueForm({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Service principal"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateQueue(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessDashboard
