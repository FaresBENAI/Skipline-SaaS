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
  CheckCircle,
  Download,
  Copy,
  Eye
} from 'lucide-react'
import QRCodeLib from 'qrcode'

interface Company {
  id: string
  name: string
  description: string | null  
  owner_id: string
  is_active: boolean
  company_qr_code: string | null
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
  const [companyQrUrl, setCompanyQrUrl] = useState<string>('')
  const [showQrModal, setShowQrModal] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Formulaires
  const [queueForm, setQueueForm] = useState({ name: '' })

  useEffect(() => {
    if (user) {
      fetchCompany()
    }
  }, [user])

  useEffect(() => {
    if (company) {
      fetchQueues()
      if (company.company_qr_code) {
        generateCompanyQR(company.company_qr_code)
      } else {
        // Si pas de QR code, le générer
        generateMissingQR()
      }
    }
  }, [company])

  useEffect(() => {
    if (selectedQueue) {
      fetchQueueEntries()
      const interval = setInterval(fetchQueueEntries, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedQueue])

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id)

      if (error) {
        setError(`Erreur: ${error.message}`)
        return
      }

      const companyData = data && data.length > 0 ? data[0] : null
      console.log('🏢 Entreprise récupérée:', companyData)
      setCompany(companyData)
      
    } catch (error) {
      setError(`Erreur: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const generateMissingQR = async () => {
    if (!company) return
    
    try {
      console.log('🔧 Génération QR manquant pour entreprise:', company.id)
      
      const qrCode = `COMPANY_${company.id.replace(/-/g, '').substring(0, 8).toUpperCase()}_${Date.now()}`
      
      const { data, error } = await supabase
        .from('companies')
        .update({ company_qr_code: qrCode })
        .eq('id', company.id)
        .select()

      if (error) {
        console.error('❌ Erreur génération QR:', error)
        return
      }

      if (data && data.length > 0) {
        console.log('✅ QR généré:', qrCode)
        setCompany(data[0])
        generateCompanyQR(qrCode)
      }
    } catch (error) {
      console.error('💥 Erreur generateMissingQR:', error)
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
        console.error('Erreur récupération files:', error)
        return
      }

      setQueues(data || [])
    } catch (error) {
      console.error('Erreur fetchQueues:', error)
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

  const generateCompanyQR = async (qrCode: string) => {
    try {
      const qrUrl = await QRCodeLib.toDataURL(qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      })
      setCompanyQrUrl(qrUrl)
    } catch (error) {
      console.error('Erreur génération QR entreprise:', error)
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

  const addToQueueByCompanyQR = async (companyQrCode: string, userId: string) => {
    // Cette fonction sera appelée quand un client scanne le QR
    // Pour l'instant, on la garde pour référence
    console.log('Client scan QR:', { companyQrCode, userId })
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

  const copyQrCode = () => {
    if (company?.company_qr_code) {
      navigator.clipboard.writeText(company.company_qr_code)
      alert('Code QR copié dans le presse-papiers !')
    }
  }

  const downloadQR = () => {
    if (companyQrUrl) {
      const link = document.createElement('a')
      link.download = `qr-${company?.name || 'entreprise'}.png`
      link.href = companyQrUrl
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

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur: Entreprise non trouvée</p>
          <button
            onClick={signOut}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Déconnexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec bouton QR */}
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
            <div className="flex items-center space-x-4">
              {/* BOUTON QR ENTREPRISE - TOUJOURS VISIBLE */}
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Entreprise</span>
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
        {/* Success message */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-green-800 font-semibold">Entreprise créée avec succès !</h3>
                <p className="text-green-700 text-sm">
                  {company.name} • QR Code: {company.company_qr_code ? '✅ Généré' : '🔄 Génération...'}
                </p>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowQrModal(true)}
                className="bg-white border-2 border-green-200 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Voir QR</span>
              </button>
              <p className="text-xs text-green-600 mt-1">Pour vos clients</p>
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
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">{selectedQueue.name}</h2>
                    <button
                      onClick={callNext}
                      disabled={queueEntries.filter(e => e.status === 'waiting').length === 0}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Appeler suivant</span>
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2">📱 Comment ajouter des clients :</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Cliquez sur <strong>"QR Entreprise"</strong> en haut</li>
                      <li>Affichez ce QR code aux clients</li>
                      <li>Ils le scannent avec leur app SkipLine</li>
                      <li>Ils apparaissent automatiquement dans cette file !</li>
                    </ol>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {queueEntries.filter(e => e.status === 'waiting').length}
                      </div>
                      <div className="text-sm text-blue-600">En attente</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {queueEntries.filter(e => e.status === 'called').length}
                      </div>
                      <div className="text-sm text-yellow-600">Appelés</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {queueEntries.length}
                      </div>
                      <div className="text-sm text-green-600">Total</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Clients dans la file ({queueEntries.length})
                  </h3>
                  
                  {queueEntries.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun client dans la file</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Les clients apparaîtront ici quand ils scanneront votre QR code
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {queueEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                            entry.status === 'called' 
                              ? 'border-yellow-300 bg-yellow-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-xl font-bold text-blue-600">#{entry.position}</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {entry.user.full_name || entry.user.email}
                              </h4>
                              <p className="text-sm text-gray-600">{entry.user.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {entry.status === 'waiting' && (
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                En attente
                              </span>
                            )}
                            {entry.status === 'called' && (
                              <>
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                  🔔 Appelé
                                </span>
                                <button
                                  onClick={() => markServed(entry.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
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
                    Les clients pourront rejoindre cette file en scannant votre QR code
                  </p>
                  <button
                    onClick={() => setShowCreateQueue(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Créer une file
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal QR Code Entreprise */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">QR Code de votre entreprise</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              {companyQrUrl ? (
                <div>
                  <div className="bg-white p-4 rounded-xl border-2 border-blue-200 mb-4">
                    <img
                      src={companyQrUrl}
                      alt="QR Code Entreprise"
                      className="w-full max-w-xs mx-auto"
                    />
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{company.name}</h4>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-1">Code technique :</p>
                    <p className="text-xs font-mono text-gray-800 break-all">
                      {company.company_qr_code}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={copyQrCode}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copier</span>
                    </button>
                    <button
                      onClick={downloadQR}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger</span>
                    </button>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-green-800">
                      <strong>💡 Comment ça marche :</strong><br />
                      Affichez ce QR code dans votre établissement. Les clients le scannent pour rejoindre automatiquement vos files d'attente !
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Génération du QR code...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
