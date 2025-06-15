-- Créer le bucket pour les avatars (si pas déjà fait)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre l'upload des avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre la lecture publique des avatars
CREATE POLICY "Public can view avatars" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- Politique pour permettre la mise à jour de leur propre avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects 
FOR UPDATE WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
