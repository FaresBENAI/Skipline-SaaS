import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Building2, QrCode, Plus, Clock, LogOut, CheckCircle, Eye } from 'lucide-react'
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

const BusinessDashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [queues, setQueues] = useState<Queue[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateQueue, setShowCreateQueue] = useState(false)
  const [companyQrUrl, setCompanyQrUrl] = useState<string>('')
  const [showQrModal, setShowQrModal] = useState(false)
  const [queueForm, setQueueForm] = useState({ name: '' })
  const baseUrl = window.location.origin

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
        generateMissingQR()
      }
    }
  }, [company])

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id)

      if (error) {
        console.error('Erreur récupération entreprise:', error.message)
        return
      }

      const companyData = data && data.length > 0 ? data[0] : null
      setCompany(companyData)
    } catch (error) {
      console.error('Erreur fetchCompany:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMissingQR = async () => {
    if (!company) return
    
    try {
      const qrCode = `COMPANY_${company.id.replace(/-/g, '').substring(0, 8).toUpperCase()}_${Date.now()}`
      
      const { data, error } = await supabase
        .from('companies')
        .update({ company_qr_code: qrCode })
        .eq('id', company.id)
        .select()

      if (error) {
        console.error('Erreur génération QR:', error)
        return
      }

      if (data && data.length > 0) {
        setCompany(data[0])
        generateCompanyQR(qrCode)
      }
    } catch (error) {
      console.error('Erreur generateMissingQR:', error)
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

  const generateCompanyQR = async (qrCode: string) => {
    if (!qrCode) return

    try {
      const companyCode = qrCode.replace('COMPANY_', '').split('_')[0]
      const qrContent = `${baseUrl}/join/${companyCode}`

      const qrUrl = await QRCodeLib.toDataURL(qrContent, {
        width: 400,
        margin: 2,
        color: {
          dark: '#059669',
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
        .insert([{ name: queueForm.name, company_id: company.id }])
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

  const handleQueueClick = (queue: Queue) => {
    alert(`TEST: Clic sur ${queue.name}`)
    navigate(`/business/queue/${queue.id}`)
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
          <button onClick={signOut} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Déconnexion
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
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-sm text-gray-600">Dashboard de gestion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-green-800 font-semibold">Entreprise créée avec succès !</h3>
                <p className="text-green-700 text-sm">{company.name} • Files: {queues.length}</p>
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
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Files d'attente ({queues.length})</h2>
                <button
                  onClick={() => setShowCreateQueue(true)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {queues.map((queue) => (
                  <button
                    key={queue.id}
                    onClick={() => handleQueueClick(queue)}
                    className="w-full p-4 rounded-lg border-2 cursor-pointer transition-colors border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-left"
                  >
                    <h3 className="font-semibold text-gray-900">{queue.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">🟢 Active • Cliquez pour gérer</p>
                  </button>
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

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <QrCode className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mode Test</h3>
                <p className="text-gray-600 mb-6">Cliquez sur une file pour tester</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">QR Code SkipLine</h3>
              <button onClick={() => setShowQrModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ✕
              </button>
            </div>
            <div className="text-center">
              {companyQrUrl && <img src={companyQrUrl} alt="QR Code" className="w-64 mx-auto" />}
            </div>
          </div>
        </div>
      )}

      {showCreateQueue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nouvelle file d'attente</h3>
            <form onSubmit={createQueue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la file *</label>
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
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
