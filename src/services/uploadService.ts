import { supabase } from '../lib/supabase'

export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Le fichier est trop volumineux (max 5MB)')
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image')
    }

    // Générer un nom unique pour le fichier
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    console.log('📤 Upload fichier:', fileName)

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Erreur upload:', uploadError)
      throw new Error(`Erreur d'upload: ${uploadError.message}`)
    }

    console.log('✅ Upload réussi:', uploadData)

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    if (!urlData.publicUrl) {
      throw new Error('Impossible d\'obtenir l\'URL de l\'image')
    }

    console.log('🔗 URL publique:', urlData.publicUrl)

    // Mettre à jour le profil utilisateur
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: urlData.publicUrl
      }
    })

    if (updateError) {
      console.error('❌ Erreur mise à jour profil:', updateError)
      throw new Error(`Erreur mise à jour profil: ${updateError.message}`)
    }

    console.log('✅ Profil mis à jour avec succès')

    return urlData.publicUrl

  } catch (error: any) {
    console.error('💥 Erreur uploadAvatar:', error)
    throw error
  }
}
