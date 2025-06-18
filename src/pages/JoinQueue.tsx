import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { NotificationService } from '../services/notificationService'
import { Building2, Users, Clock, Mail, Phone, User, Loader2, CheckCircle, AlertCircle, Home, ArrowLeft } from 'lucide-react'

interface Company {
  id: string
  name: string
  description: string | null
}

interface Queue {
  id: string
  name: string
  description: string | null
  estimated_time_per_person: number
  current_waiting: number
}

const JoinQueue: React.FC = () => {
  const { companyCode } = useParams<{ companyCode: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [company, setCompany] = useState<Company | null>(null)
  const [queues, setQueues] = useState<Queue[]>([])
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Formulaire visiteur
  const [guestForm, setGuestForm] = useState({
    email: '',
    phone: '',
    name: ''
  })

  useEffect(() => {
    if (companyCode) {
      fetchCompanyAndQueues()
    }
  }, [companyCode])

  const fetchCompanyAndQueues = async () => {
    try {
      console.log('🔍 Recherche entreprise avec code:', companyCode)
      
      // CORRECTION: Chercher avec LIKE pour correspondre au format COMPANY_ABC123_timestamp
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, description')
        .like('company_qr_code', `COMPANY_${companyCode}_%`)
        .eq('is_active', true)
        .single()

      if (companyError || !companyData) {
        console.error('Erreur recherche entreprise:', companyError)
        setError('Entreprise non trouvée ou inactive')
        return
      }

      setCompany(companyData)

      const { data: queuesData, error: queuesError } = await supabase
        .from('queues')
        .select('id, name, description, estimated_time_per_person')
        .eq('company_id', companyData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (queuesError) {
        setError('Erreur lors de la récupération des files')
        return
      }

      const queuesWithCounts = await Promise.all(
        (queuesData || []).map(async (queue) => {
          const { count } = await supabase
            .from('queue_entries')
            .select('*', { count: 'exact', head: true })
            .eq('queue_id', queue.id)
            .in('status', ['waiting', 'called'])

          return {
            ...queue,
            current_waiting: count || 0
          }
        })
      )

      setQueues(queuesWithCounts)

    } catch (err) {
      console.error('Erreur fetchCompanyAndQueues:', err)
      setError('Erreur technique')
    } finally {
      setLoading(false)
    }
  }

  const joinQueue = async () => {
    if (!selectedQueue || !company) return

    if (!user && !guestForm.email && !guestForm.phone) {
      setError('Veuillez fournir votre email ou téléphone')
      return
    }

    setJoining(true)
    setError('')

    try {
      console.log('🎯 Début ajout à la file...')

      // Calculer la position
      const { count } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('queue_id', selectedQueue.id)
        .in('status', ['waiting', 'called'])

      const position = (count || 0) + 1
      const estimatedWait = position * selectedQueue.estimated_time_per_person

      console.log('📍 Position calculée:', position)

      if (user) {
        // Utilisateur connecté - insertion normale
        const { error: insertError } = await supabase
          .from('queue_entries')
          .insert({
            queue_id: selectedQueue.id,
            user_id: user.id,
            position: position,
            status: 'waiting',
            estimated_time: estimatedWait
          })

        if (insertError) {
          console.error('❌ Erreur insertion utilisateur:', insertError)
          throw new Error(`Erreur DB: ${insertError.message}`)
        }

        console.log('✅ Utilisateur ajouté à la file')

        // Notification pour utilisateur connecté
        try {
          await NotificationService.notifyQueueJoined(
            user.id,
            user.email || '',
            user.user_metadata?.full_name || 'Client',
            company.name,
            selectedQueue.name,
            position,
            estimatedWait
          )
          console.log('📧 Notification envoyée')
        } catch (notifError) {
          console.error('⚠️ Erreur notification:', notifError)
        }

      } else {
        // Visiteur non-connecté - créer un profil temporaire
        console.log('👤 Création profil visiteur...')
        
        const { data: tempProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email: guestForm.email || null,
            phone: guestForm.phone || null,
            full_name: guestForm.name || 'Visiteur',
            user_type: 'client'
          })
          .select()
          .single()

        if (profileError) {
          console.error('❌ Erreur création profil:', profileError)
          throw new Error(`Erreur profil: ${profileError.message}`)
        }

        console.log('✅ Profil visiteur créé:', tempProfile.id)

        // Ajouter à la file avec l'ID du profil temporaire
        const { error: insertError } = await supabase
          .from('queue_entries')
          .insert({
            queue_id: selectedQueue.id,
            user_id: tempProfile.id,
            position: position,
            status: 'waiting',
            estimated_time: estimatedWait
          })

        if (insertError) {
          console.error('❌ Erreur insertion visiteur:', insertError)
          throw new Error(`Erreur ajout file: ${insertError.message}`)
        }

        console.log('✅ Visiteur ajouté à la file')

        // Notification pour visiteur
        if (guestForm.email) {
          try {
            await NotificationService.notifyQueueJoined(
              tempProfile.id,
              guestForm.email,
              guestForm.name || 'Visiteur',
              company.name,
              selectedQueue.name,
              position,
              estimatedWait,
              guestForm.phone || undefined
            )
            console.log('📧 Notification visiteur envoyée')
          } catch (notifError) {
            console.error('⚠️ Erreur notification visiteur:', notifError)
          }
        }
      }

      setSuccess(`�� Parfait ! Vous êtes en position ${position} dans la file "${selectedQueue.name}". Temps d'attente estimé: ${estimatedWait} minutes.`)

    } catch (err: any) {
      console.error('❌ Erreur joinQueue:', err)
      setError(err.message || 'Erreur technique lors de l\'ajout')
    } finally {
      setJoining(false)
    }
  }

  const handleNavigation = () => {
    if (user) {
      const userType = user.user_metadata?.user_type
      if (userType === 'business') {
        navigate('/business')
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des files d'attente...</p>
        </div>
      </div>
    )
  }

  if (error && !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Entreprise introuvable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Debug:</strong> Code recherché: {companyCode}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <Home className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header avec bouton navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleNavigation}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {user ? (
              <>
                <ArrowLeft className="w-5 h-5" />
                <span>Mon Dashboard</span>
              </>
            ) : (
              <>
                <Home className="w-5 h-5" />
                <span>Accueil SkipLine</span>
              </>
            )}
          </button>
          
          {user && (
            <div className="text-sm text-gray-600">
              Connecté : {user.user_metadata?.full_name || user.email}
            </div>
          )}
        </div>

        {/* En-tête Entreprise */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{company?.name}</h1>
            {company?.description && (
              <p className="text-gray-600">{company.description}</p>
            )}
            <div className="mt-4 text-sm text-blue-600 font-medium">
              🎯 Choisissez votre file d'attente
            </div>
          </div>
        </div>

        {/* Sélection File */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Files d'attente disponibles</h2>
          
          {queues.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune file d'attente active pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queues.map((queue) => (
                <div
                  key={queue.id}
                  onClick={() => setSelectedQueue(queue)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedQueue?.id === queue.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{queue.name}</h3>
                      {queue.description && (
                        <p className="text-gray-600 text-sm mb-2">{queue.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {queue.current_waiting} en attente
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          ~{queue.current_waiting * queue.estimated_time_per_person} min
                        </span>
                      </div>
                    </div>
                    {selectedQueue?.id === queue.id && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulaire Visiteur */}
        {selectedQueue && !user && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Vos informations de contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">ou</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet (optionnel)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={guestForm.name}
                    onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-green-600 font-medium">{success}</p>
            {!user && (
              <div className="mt-4 space-y-2">
                <p className="text-green-600 text-sm">
                  💡 Conseil: Créez un compte SkipLine pour un suivi plus facile de vos files !
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  Créer un compte
                </button>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={handleNavigation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2"
              >
                {user ? (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour au Dashboard</span>
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4" />
                    <span>Découvrir SkipLine</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bouton Rejoindre */}
        {selectedQueue && !success && (
          <button
            onClick={joinQueue}
            disabled={joining || (!user && !guestForm.email && !guestForm.phone)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {joining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              `Rejoindre "${selectedQueue.name}"`
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default JoinQueue
