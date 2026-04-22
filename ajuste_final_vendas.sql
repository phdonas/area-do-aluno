-- ==============================================================================
-- SCHEMA AJUSTE FINAL: VENDAS E CUPONS (v5.3)
-- ALINHAMENTO COM O CÓDIGO FONTE (Área do Aluno)
-- ==============================================================================

-- 1. TABELA DE CUPONS (Alinhada com src/lib/cupons.ts)
CREATE TABLE IF NOT EXISTS public.cupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          TEXT UNIQUE NOT NULL,
  tipo            TEXT NOT NULL CHECK (tipo IN ('porcentagem', 'valor_fixo')),
  valor           NUMERIC(10,2) NOT NULL,
  validade_inicio TIMESTAMPTZ DEFAULT NOW(),
  validade_fim    TIMESTAMPTZ,
  limite_uso      INTEGER,
  uso_atual       INTEGER DEFAULT 0,
  ativo           BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE CONVITES (Alinhada com Webhook e InviteModal)
CREATE TABLE IF NOT EXISTS public.convites_matricula (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token           UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  curso_id        UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  plano_tipo      TEXT DEFAULT 'gratuito', 
  origem          TEXT NOT NULL,           
  usado           BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE LOGS DE MATRÍCULA (Histórico de Vendas)
CREATE TABLE IF NOT EXISTS public.logs_matriculas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  email         TEXT,
  evento        TEXT NOT NULL, -- 'MATRICULA_DIRETA', 'VENDA_NOVO_ALUNO_CONVITE', 'CHECKOUT_PREFERENCIA_GERADA'
  curso_id      UUID REFERENCES public.cursos(id),
  origem        TEXT,          -- 'WEBHOOK_MP', 'ADMIN_MANUAL'
  detalhes      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUNÇÃO RPC: INCREMENTAR USO DO CUPOM
CREATE OR REPLACE FUNCTION public.incrementar_uso_cupom(cupom_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.cupons
  SET uso_atual = uso_atual + 1
  WHERE id = cupom_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. SEGURANÇA (RLS)
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites_matricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_matriculas ENABLE ROW LEVEL SECURITY;

-- Permissões para Admins
CREATE POLICY "Admins_Manage_Cupons_v2" ON public.cupons FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins_Manage_Convites_v2" ON public.convites_matricula FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins_Manage_Logs_v2" ON public.logs_matriculas FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND is_admin = TRUE));

-- Permissão para o Sistema (Leitura de cupons no checkout)
CREATE POLICY "Public_Read_Cupons_Ativos" ON public.cupons FOR SELECT 
  USING (ativo = TRUE AND (validade_fim IS NULL OR validade_fim > NOW()));

-- 6. INDEXAÇÃO PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_cupons_codigo ON public.cupons(codigo);
CREATE INDEX IF NOT EXISTS idx_convites_token ON public.convites_matricula(token);
CREATE INDEX IF NOT EXISTS idx_convites_email ON public.convites_matricula(email);
