import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { QrCode, User, Clock, LogOut, RefreshCw, Download } from 'lucide-react'
import QRCodeLib from 'qrcode'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  user_type: string
  qr_code: string | null
  created_at: string
}

const ClientDashboard = () => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [qrLoading, setQrLoading] = useState(false)

  useEffect(() => {
    console.log('🚀 Dashboard démarré, user:', user)
    if (user) {
      fetchProfile()
    }
  }, [user])

  useEffect(() => {
    if (profile?.qr_code) {
      generateQRCode(profile.qr_code)
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      console.log('📡 Récupération profil pour user ID:', user?.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)

      console.log('📊 Réponse Supabase:', { data, error })

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        setError(`Erreur DB: ${error.message}`)
        return
      }
      
      if (!data || data.length === 0) {
        console.error('❌ Aucun profil trouvé')
        setError('Profil introuvable')
        return
      }

      const profileData = data[0]
      console.log('✅ Profil trouvé:', profileData)
      setProfile(profileData)
      
      if (!profileData.qr_code) {
        console.log('⚠️ QR Code manquant, génération...')
        await updateQRCode(profileData.id)
      }
      
    } catch (error) {
      console.error('💥 Erreur catch:', error)
      setError(`Erreur technique: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (qrText: string) => {
    setQrLoading(true)
    try {
      console.log('🎨 Génération QR code visuel pour:', qrText)
      
      const qrUrl = await QRCodeLib.toDataURL(qrText, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e40af', // Bleu foncé
          light: '#ffffff'  // Blanc
        },
        errorCorrectionLevel: 'M'
      })
      
      setQrCodeUrl(qrUrl)
      console.log('✅ QR code généré avec succès')
      
    } catch (error) {
      console.error('❌ Erreur génération QR:', error)
      // Fallback en cas d'erreur
      setQrCodeUrl('')
    } finally {
      setQrLoading(false)
    }
  }

  const updateQRCode = async (profileId: string) => {
    try {
      const timestamp = Date.now()
      const shortId = profileId.replace(/-/g, '').substring(0, 8).toUpperCase()
      const qrCode = `SKIPLINE_${shortId}_${timestamp}`
      
      console.log('🔧 Mise à jour QR code:', qrCode)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ qr_code: qrCode })
        .eq('id', profileId)
        .select()

      if (error) {
        console.error('❌ Erreur mise à jour QR:', error)
        return
      }

      if (data && data.length > 0) {
        console.log('✅ QR Code mis à jour:', data[0])
        setProfile(data[0])
      }
      
    } catch (error) {
      console.error('❌ Erreur updateQRCode:', error)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = `skipline-qr-${profile?.full_name || 'code'}.png`
      link.href = qrCodeUrl
      link.click()
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleRetry = () => {
    setError('')
    setLoading(true)
    fetchProfile()
  }

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  // Écran d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Erreur de connexion</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </button>
            <button
              onClick={handleSignOut}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Déconnexion
            </button>
          </div>
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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Mon Dashboard SkipLine</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="text-green-600 text-xl mr-3">✅</div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Connexion réussie !</h3>
              <p className="text-sm text-green-700">
                Bienvenue {profile?.full_name || profile?.email} • 
                Type: {profile?.user_type} • 
                QR: {profile?.qr_code ? 'Généré' : 'En cours...'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne 1: Profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {profile?.full_name || 'Client SkipLine'}
                </h2>
                <p className="text-gray-600 mb-2">{profile?.email}</p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  👤 Client
                </span>
              </div>
            </div>
          </div>

          {/* Colonne 2-3: QR Code */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                📱 Mon QR Code SkipLine
              </h3>
              
              {profile?.qr_code ? (
                <div className="text-center">
                  {/* QR Code réel */}
                  <div className="inline-block bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-100 mb-6">
                    {qrLoading ? (
                      <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Génération QR...</p>
                        </div>
                      </div>
                    ) : qrCodeUrl ? (
                      <div>
                        <img
                          src={qrCodeUrl}
                          alt="QR Code SkipLine"
                          className="w-64 h-64 mx-auto rounded-xl"
                        />
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm font-semibold text-blue-600">✓ SCANNABLE</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">QR Code indisponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  {qrCodeUrl && (
                    <div className="mb-6">
                      <button
                        onClick={downloadQRCode}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger le QR Code
                      </button>
                    </div>
                  )}
                  
                  {/* Informations */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        📋 Comment l'utiliser ?
                      </h4>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p>• Présentez ce QR code au personnel d'une entreprise partenaire</p>
                        <p>• Ils le scanneront pour vous ajouter à leur file d'attente</p>
                        <p>• Vous recevrez des notifications sur votre position</p>
                        <p>• Plus besoin d'attendre physiquement dans la file !</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 mb-2 font-medium">Code technique :</p>
                      <p className="text-xs font-mono text-gray-800 break-all bg-white p-3 rounded-lg border">
                        {profile.qr_code}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-yellow-600 text-6xl mb-4">⏳</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">QR Code en génération...</h4>
                  <p className="text-gray-600 mb-4">Votre code unique est en cours de création.</p>
                  <button
                    onClick={() => updateQRCode(profile?.id || '')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Forcer la génération
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Files d'attente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">📋 Mes files d'attente</h2>
          
          <div className="text-center py-16">
            <Clock className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Aucune file d'attente active
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vous n'êtes actuellement dans aucune file d'attente. 
              Utilisez votre QR code pour rejoindre une file !
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 max-w-lg mx-auto">
              <p className="text-sm text-purple-800">
                🚀 <strong>Prochaine étape :</strong><br />
                Créons maintenant le dashboard entreprise pour tester le scan de votre QR code !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
