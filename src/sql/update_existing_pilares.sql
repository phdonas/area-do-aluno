-- ==============================================================================
-- EXPANSÃO DA TABELA PILARES EXISTENTE (EVITANDO DUPLICAÇÃO)
-- ==============================================================================

-- 1. Adicionando colunas de marketing à tabela existente
ALTER TABLE public.pilares ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.pilares ADD COLUMN IF NOT EXISTS subtitulo TEXT;
ALTER TABLE public.pilares ADD COLUMN IF NOT EXISTS icone TEXT DEFAULT 'Zap';

-- 2. Criar índice único no slug para garantir integridade (opcional mas recomendado)
-- Vamos rodar em um bloco DO para evitar erro se já existir um índice único
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'pilares' AND indexname = 'pilares_slug_key'
    ) THEN
        CREATE UNIQUE INDEX pilares_slug_key ON public.pilares (slug);
    END IF;
END $$;

-- 3. Atualizar slugs existentes baseados no nome (apenas se estiverem nulos)
UPDATE public.pilares 
SET slug = lower(regexp_replace(nome, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;
