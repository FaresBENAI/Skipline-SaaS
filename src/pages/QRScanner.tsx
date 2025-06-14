import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Keyboard, Loader2, AlertCircle } from 'lucide-react'

const QRScanner: React.FC = () => {
  const [manualInput, setManualInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const processQRCode = async (qrCode: string) => {
    if (!user) {
      setError('Vous devez être connecté pour scanner un QR code')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (qrCode.startsWith('COMPANY_')) {
        await joinCompanyQueue(qrCode)
      } else {
        setError('QR code non reconnu. Scannez un QR code d\'entreprise valide.')
      }
    } catch (err) {
      console.error('Error processing QR code:', err)
      setError('Erreur lors du traitement du QR code')
    } finally {
      setLoading(false)
    }
  }

  const joinCompanyQueue = async (companyQRCode: string) => {
    try {
      console.log('🔍 Recherche entreprise avec QR:', companyQRCode)
      
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('company_qr_code', companyQRCode)
        .single()

      if (companyError || !company) {
        setError('Entreprise non trouvée avec ce QR code')
        return
      }

      const { data: queues, error: queueError } = await supabase
        .from('queues')
        .select('id, name')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (queueError || !queues || queues.length === 0) {
        setError(`Aucune file active pour ${company.name}`)
        return
      }

      const queue = queues[0]

      const { data: existingEntry } = await supabase
        .from('queue_entries')
        .select('id')
        .eq('queue_id', queue.id)
        .eq('user_id', user.id)
        .in('status', ['waiting', 'called'])
        .single()

      if (existingEntry) {
        setError('Vous êtes déjà dans cette file d\'attente')
        return
      }

      const { count } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('queue_id', queue.id)
        .in('status', ['waiting', 'called'])

      const position = (count || 0) + 1

      const { error: insertError } = await supabase
        .from('queue_entries')
        .insert({
          queue_id: queue.id,
          user_id: user.id,
          position: position,
          status: 'waiting'
        })

      if (insertError) {
        setError('Erreur lors de l\'ajout à la file')
        return
      }

      setSuccess(`✅ Vous avez rejoint "${queue.name}" chez ${company.name}. Position: ${position}`)
      
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            message: `Vous avez rejoint la file "${queue.name}" chez ${company.name}. Position: ${position}` 
          }
        })
      }, 3000)

    } catch (err) {
      console.error('Erreur joinCompanyQueue:', err)
      setError('Erreur technique lors de l\'ajout à la file')
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    await processQRCode(manualInput.trim())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <h1 className="text-xl font-bold text-gray-800">Scanner QR Code</h1>
          <div className="w-16"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Keyboard className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Saisir le QR code de l'entreprise
              </h2>
              <p className="text-gray-600 text-sm">
                Entrez le code QR affiché par l'entreprise
              </p>
            </div>
            
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code QR Entreprise
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="COMPANY_A1B2C3D4_1234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !manualInput.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Traitement...
                  </>
                ) : (
                  'Rejoindre la file'
                )}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm font-medium">{success}</p>
            <p className="text-green-600 text-xs mt-1">Redirection vers votre dashboard...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRScanner
