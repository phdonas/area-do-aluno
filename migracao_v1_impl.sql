-- ==============================================================================
-- MIGRACAO V1: IMPLEMENTACAO ESTRUTURAL (PHD Coins, Perfil e PDI)
-- ALINHAMENTO COM ANTIGRAVITY_Implementacao_V1.md e Schema v5.3
-- ==============================================================================

-- 1. AJUSTES NA TABELA DE USUÁRIOS (public.usuarios)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS papel TEXT DEFAULT 'aluno'
  CHECK (papel IN ('aluno', 'admin', 'staff', 'visitante'));

-- Sincroniza is_admin com papel admin
UPDATE public.usuarios SET papel = 'admin' WHERE is_admin = TRUE;

ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS notificacao_horario_preferido TIME;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS streak_dias INT DEFAULT 0;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS phd_coins_total INT DEFAULT 0;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS phd_nivel INT DEFAULT 1;

-- Campos de Perfil Expandido (Momento 2)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS segmento_mercado TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS tamanho_empresa TEXT 
  CHECK (tamanho_empresa IN ('1-10', '11-50', '51-200', '201-500', '500+'));
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS experiencia_anos INT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS endereco JSONB;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS perfil_completo_momento2 BOOLEAN DEFAULT FALSE;

-- 2. AJUSTES NA TABELA DE CONVITES (Suplementar para rastreabilidade)
ALTER TABLE public.convites_matricula ADD COLUMN IF NOT EXISTS aceito_em TIMESTAMPTZ;
ALTER TABLE public.convites_matricula ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES public.usuarios(id);

-- 3. AJUSTES NO PROGRESSO DAS AULAS
ALTER TABLE public.progresso_aulas ADD COLUMN IF NOT EXISTS posicao_s INT DEFAULT 0;

-- 4. CURSOS E MATERIAIS_ANEXOS: VITRINE
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS destaque_vitrine BOOLEAN DEFAULT FALSE;
ALTER TABLE public.materiais_anexos ADD COLUMN IF NOT EXISTS destaque_vitrine BOOLEAN DEFAULT FALSE;

-- 5. PDI: METAS (Sincronização de status)
-- Verifica se a tabela metas_aluno existe antes de tentar alterar, se não, cria a estrutura básica
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'metas_aluno') THEN
        ALTER TABLE public.metas_aluno ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativa'
          CHECK (status IN ('ativa', 'avancando', 'estagnada', 'concluida'));
        ALTER TABLE public.metas_aluno ADD COLUMN IF NOT EXISTS ultima_atualizacao TIMESTAMPTZ DEFAULT NOW();
        ALTER TABLE public.metas_aluno ADD COLUMN IF NOT EXISTS semanas_estagnada INT DEFAULT 0;
    END IF;
END $$;

-- 6. FEEDBACK DO PROFESSOR
-- Verifica e ajusta quiz_respostas e notas_aluno
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_respostas') THEN
        ALTER TABLE public.quiz_respostas ADD COLUMN IF NOT EXISTS feedback_professor TEXT;
        ALTER TABLE public.quiz_respostas ADD COLUMN IF NOT EXISTS feedback_em TIMESTAMPTZ;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notas_aluno') THEN
        ALTER TABLE public.notas_aluno ADD COLUMN IF NOT EXISTS feedback_professor TEXT;
        ALTER TABLE public.notas_aluno ADD COLUMN IF NOT EXISTS feedback_em TIMESTAMPTZ;
    END IF;
END $$;

-- 7. NOVAS TABELAS: GAMIFICAÇÃO, LEADS E NOTIFICAÇÕES

-- Tabela de Notificações (Necessária para o fluxo de feedback)
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL, -- 'feedback_professor', 'badge_conquistado', 'conquista_coins'
  mensagem    TEXT NOT NULL,
  lida        BOOLEAN DEFAULT FALSE,
  link        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Log de PHD Coins
CREATE TABLE IF NOT EXISTS public.phd_coins_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  evento      TEXT NOT NULL,
  coins       INT NOT NULL,
  referencia_id UUID, 
  referencia_tipo TEXT, -- 'aula', 'curso', 'quiz', 'pdi', 'indicacao'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Badges Conquistados
CREATE TABLE IF NOT EXISTS public.badges_aluno (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  badge_key       TEXT NOT NULL, 
  badge_nome      TEXT NOT NULL,
  conquistado_em  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, badge_key)
);

-- Leads de Nutrição (Vitrine)
CREATE TABLE IF NOT EXISTS public.leads_nurturing (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materiais_anexos(id) ON DELETE SET NULL,
  canal       TEXT DEFAULT 'vitrine',
  email_enviado BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Diagnósticos de Trilha
CREATE TABLE IF NOT EXISTS public.diagnosticos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id        UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  curso_id          UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  tipo              TEXT DEFAULT 'estatico' CHECK (tipo IN ('estatico', 'ia')),
  perfil_resultado  JSONB DEFAULT '{}'::jsonb,
  trilha_recomendada TEXT,
  regra_aplicada    TEXT, 
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Trilhas Estáticas
CREATE TABLE IF NOT EXISTS public.trilhas_estaticas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo             TEXT,
  pilar_slug        TEXT,
  segmento          TEXT,
  trilha_descricao  TEXT NOT NULL,
  cursos_sugeridos  UUID[], 
  ativo             BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRIGGERS E FUNÇÕES DE AUTOMAÇÃO

-- Trigger: Atualizar coins e nível no perfil do usuário
CREATE OR REPLACE FUNCTION public.atualizar_coins_e_nivel()
RETURNS TRIGGER AS $$
DECLARE
  novo_total INT;
  novo_nivel INT;
BEGIN
  SELECT COALESCE(SUM(coins), 0) INTO novo_total
  FROM public.phd_coins_log WHERE usuario_id = NEW.usuario_id;

  novo_nivel := CASE
    WHEN novo_total >= 10000 THEN 5
    WHEN novo_total >= 4000  THEN 4
    WHEN novo_total >= 1500  THEN 3
    WHEN novo_total >= 1000  THEN 2
    ELSE 1
  END;

  UPDATE public.usuarios 
  SET phd_coins_total = novo_total, phd_nivel = novo_nivel
  WHERE id = NEW.usuario_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_atualizar_coins ON public.phd_coins_log;
CREATE TRIGGER trigger_atualizar_coins
  AFTER INSERT ON public.phd_coins_log
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_coins_e_nivel();

-- Trigger: Conceder coins automaticamente ao concluir aula e badge inicial
CREATE OR REPLACE FUNCTION public.coins_ao_concluir_aula()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se a aula foi marcada como concluída AGORA
  IF NEW.concluida = TRUE AND (OLD.concluida IS NULL OR OLD.concluida = FALSE) THEN
    
    -- Se for a PRIMEIRA aula concluída do aluno em toda a plataforma
    IF NOT EXISTS (
      SELECT 1 FROM public.progresso_aulas 
      WHERE usuario_id = NEW.usuario_id AND concluida = TRUE AND aula_id != NEW.aula_id
    ) THEN
      -- Log de coins para primeira aula
      INSERT INTO public.phd_coins_log (usuario_id, evento, coins, referencia_id, referencia_tipo)
      VALUES (NEW.usuario_id, 'primeira_aula', 10, NEW.aula_id, 'aula');
      
      -- Badge Primeiros Passos
      INSERT INTO public.badges_aluno (usuario_id, badge_key, badge_nome)
      VALUES (NEW.usuario_id, 'primeiros_passos', 'Primeiros Passos')
      ON CONFLICT DO NOTHING;
    ELSE
      -- Log de coins para aula comum
      INSERT INTO public.phd_coins_log (usuario_id, evento, coins, referencia_id, referencia_tipo)
      VALUES (NEW.usuario_id, 'aula_concluida', 5, NEW.aula_id, 'aula');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_coins_aula ON public.progresso_aulas;
CREATE TRIGGER trigger_coins_aula
  AFTER UPDATE ON public.progresso_aulas
  FOR EACH ROW EXECUTE FUNCTION public.coins_ao_concluir_aula();

-- 9. SEGURANÇA (RLS)
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phd_coins_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges_aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_nurturing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trilhas_estaticas ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Própria
CREATE POLICY "usuario_ve_proprias_notificacoes" ON public.notificacoes FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprios_coins" ON public.phd_coins_log FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprios_badges" ON public.badges_aluno FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprios_diagnosticos" ON public.diagnosticos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "todos_veem_trilhas_ativas" ON public.trilhas_estaticas FOR SELECT USING (ativo = TRUE);

-- Política para Admin
CREATE POLICY "admin_gerencia_tudo_v1" ON public.trilhas_estaticas FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND papel IN ('admin', 'staff')));
