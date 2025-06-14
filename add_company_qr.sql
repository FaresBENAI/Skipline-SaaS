-- Ajouter la colonne QR code aux entreprises
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS company_qr_code TEXT UNIQUE;

-- Générer un QR code pour votre entreprise existante
UPDATE public.companies 
SET company_qr_code = 'COMPANY_' || 
                      UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)) || 
                      '_' || 
                      EXTRACT(EPOCH FROM NOW())::bigint
WHERE company_qr_code IS NULL;

-- Vérifier que ça a marché
SELECT name, company_qr_code FROM public.companies;
