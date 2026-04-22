-- Adicionando suporte a destaque na vitrine para recursos/ferramentas
ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS destaque_vitrine BOOLEAN DEFAULT FALSE;
