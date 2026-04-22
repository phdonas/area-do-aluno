-- ==============================================================================
-- DINAMIZAÇÃO DA VITRINE E CATÁLOGO: TABELA DE PILARES
-- ==============================================================================

-- 1. Criação da tabela de Pilares
CREATE TABLE IF NOT EXISTS public.pilares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  nome        TEXT NOT NULL,
  subtitulo   TEXT,
  icone       TEXT DEFAULT 'Zap', -- Nome do ícone Lucide
  ordem       INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Inserção dos 4 Pilares Iniciais (para não quebrar a UI atual)
INSERT INTO public.pilares (slug, nome, subtitulo, icone, ordem)
VALUES 
  ('metodologia', 'Metodologia PHD', 'A base científica para resultados exponenciais.', 'Brain', 1),
  ('estrategia', 'Estratégia de Mercado', 'Posicionamento e diferenciação competitiva.', 'Target', 2),
  ('ecoinovacao', 'Ecoinovação', 'Sustentabilidade como motor de novos negócios.', 'Leaf', 3),
  ('lideranca', 'Liderança 4.0', 'Gestão de pessoas e cultura de alta performance.', 'Users', 4)
ON CONFLICT (slug) DO NOTHING;

-- 3. Vincular Cursos aos Pilares (se ainda não houver a coluna pilar_id como UUID)
-- Primeiro verificamos se pilar_id já existe e seu tipo
DO $$ 
BEGIN
    -- Se a coluna pilar_id for TEXT (slug), vamos mantê-la ou migrar. 
    -- Para simplicidade e performance, usaremos o slug como chave estrangeira ou apenas texto.
    -- Vamos garantir que a coluna existe na tabela cursos.
    IF NOT EXISTS (SELECT FROM geo_columns WHERE table_name = 'cursos' AND column_name = 'pilar_slug') THEN
        ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS pilar_slug TEXT;
    END IF;
END $$;

-- 4. Habilitar RLS e Políticas
ALTER TABLE public.pilares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leitura_publica_pilares" ON public.pilares 
  FOR SELECT USING (true);

CREATE POLICY "admin_gerencia_pilares" ON public.pilares 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND papel IN ('admin', 'staff')));
