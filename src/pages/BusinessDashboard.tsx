import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  Building2, 
  QrCode, 
  Plus, 
  Clock,
  CheckCircle,
  Download,
  Copy,
  Eye,
  ExternalLink
} from 'lucide-react'
import QRCodeLib from 'qrcode'
import UserMenu from '../components/UserMenu'
import QRScannerModal from '../components/QRScannerModal'

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
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [queues, setQueues] = useState<Queue[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateQueue, setShowCreateQueue] = useState(false)
  const [companyQrUrl, setCompanyQrUrl] = useState<string>('')
  const [showQrModal, setShowQrModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [queueForm, setQueueForm] = useState({ name: '' })

  useEffect(() => {
    if (user) {
      fetchCompany()
    }

    const handleOpenScanner = () => setShowScanner(true)
    window.addEventListener('openScanner', handleOpenScanner)
    
    return () => window.removeEventListener('openScanner', handleOpenScanner)
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
      const qrContent = `${window.location.origin}/join/${companyCode}`

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
    navigate(`/business/queue/${queue.id}`)
  }

  const copyQrUrl = () => {
    if (!company?.company_qr_code) return
    
    const companyCode = company.company_qr_code.replace('COMPANY_', '').split('_')[0]
    const url = `${window.location.origin}/join/${companyCode}`
    
    navigator.clipboard.writeText(url)
    alert('URL copiée dans le presse-papiers !')
  }

  const downloadQR = () => {
    if (companyQrUrl && company) {
      const link = document.createElement('a')
      link.download = `qr-${company.name}-inscription.png`
      link.href = companyQrUrl
      link.click()
    }
  }

  const testQrUrl = () => {
    if (company?.company_qr_code) {
      const companyCode = company.company_qr_code.replace('COMPANY_', '').split('_')[0]
      const testUrl = `${window.location.origin}/join/${companyCode}`
      window.open(testUrl, '_blank')
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
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Recharger
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
            
            <UserMenu userType="business" />
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
            <div className="flex space-x-3">
              <button
                onClick={() => setShowQrModal(true)}
                className="bg-white border-2 border-green-200 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>QR Entreprise</span>
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Scanner Client</span>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sélectionnez une file pour la gérer
                </h3>
                <p className="text-gray-600 mb-6">
                  Cliquez sur une file à gauche pour voir sa gestion détaillée
                </p>
                {queues.length === 0 && (
                  <button
                    onClick={() => setShowCreateQueue(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Créer une file
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">QR Code d'Inscription</h3>
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
                  <div className="p-6 rounded-xl border-2 border-green-200 bg-green-50 mb-4">
                    <img
                      src={companyQrUrl}
                      alt="QR Code Inscription"
                      className="w-full max-w-xs mx-auto"
                    />
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{company.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">QR Code pour inscription clients</p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-1">URL de destination :</p>
                    <p className="text-xs font-mono text-gray-800 break-all">
                      {window.location.origin}/join/{company.company_qr_code?.replace('COMPANY_', '').split('_')[0]}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      onClick={copyQrUrl}
                      className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copier</span>
                    </button>
                    <button
                      onClick={downloadQR}
                      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger</span>
                    </button>
                    <button
                      onClick={testQrUrl}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Tester</span>
                    </button>
                  </div>

                  <div className="rounded-lg p-4 bg-green-50">
                    <p className="text-sm text-green-800">
                      <strong>💡 Comment utiliser :</strong><br />
                      Affichez ce QR code dans votre établissement. Les clients le scannent 
                      avec leur téléphone et sont dirigés vers la page d'inscription à vos files d'attente !
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

      {/* Scanner Modal */}
      <QRScannerModal 
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        userType="business"
      />
    </div>
  )
}

export default BusinessDashboard
