-- ==============================================================================
-- FLAG "LMS LIBERADO" — controla se a Área do Aluno exibe login ou "Em Breve"
-- Executar manualmente no Supabase SQL Editor.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.configuracoes_sistema (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.configuracoes_sistema (chave, valor, descricao)
VALUES ('lms_liberado', 'false', 'Controla se a Área do Aluno está liberada para acesso público ou exibe a página em breve')
ON CONFLICT (chave) DO NOTHING;

-- RLS: leitura pública (server component lê sem autenticação), escrita restrita a admins
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public_Select_Configuracoes_Sistema" ON public.configuracoes_sistema;
CREATE POLICY "Public_Select_Configuracoes_Sistema"
ON public.configuracoes_sistema FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin_Update_Configuracoes_Sistema" ON public.configuracoes_sistema;
CREATE POLICY "Admin_Update_Configuracoes_Sistema"
ON public.configuracoes_sistema FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());
