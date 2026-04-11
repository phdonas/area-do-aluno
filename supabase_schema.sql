-- ==============================================================================
-- SCHEMA SUPABASE: PHDonassolo Área do Aluno (v5.2)
-- ==============================================================================
-- DICA DE EXECUÇÃO: Cole este script no SQL Editor do Supabase e execute.
-- Recomenda-se executar por blocos se o SQL Editor relatar timeout.

-- 1. EXTENSÕES
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Para o Coach IA (RAG)

-- 2. FUNÇÕES ÚTEIS E TRIGGERS GERAIS
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. MÓDULO: USUÁRIOS E PERFIS
-- ==============================================================================
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14) UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'ativo', -- ativo, bloqueado
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Criação automática do perfil após o login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Aluno'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. MÓDULO: PLANOS E ASSINATURAS (Mercado Pago / Checkout)
-- ==============================================================================
CREATE TABLE public.planos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco_mensal NUMERIC(10, 2),
  preco_anual NUMERIC(10, 2),
  is_global BOOLEAN DEFAULT FALSE, -- Se true, acesso a toda a plataforma
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.cursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- ASCII apenas, sem acentos
  descricao TEXT,
  thumb_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'rascunho', -- publicado, rascunho
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relação N:N para saber quais cursos um plano restrito libera
CREATE TABLE public.planos_cursos (
  plano_id UUID REFERENCES public.planos(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  PRIMARY KEY(plano_id, curso_id)
);

CREATE TABLE public.assinaturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  plano_id UUID REFERENCES public.planos(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'pendente', -- ativa, inativa, cancelada, pendente
  mp_preapproval_id VARCHAR(100), -- ID de assinatura no Mercado Pago
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  data_vencimento TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. ACESSO E CONTEÚDO (Catálogo)
-- ==============================================================================

-- Tabela Pilares de Vendas/Ecossistema
CREATE TABLE public.pilares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  cor_badge VARCHAR(50),
  ordem INTEGER DEFAULT 0
);

-- Associação de cursos com pilares direta (legado) ou library (N:N)
ALTER TABLE public.cursos ADD COLUMN pilar_id UUID REFERENCES public.pilares(id) ON DELETE SET NULL;

CREATE TABLE public.cursos_pilares (
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  pilar_id UUID REFERENCES public.pilares(id) ON DELETE CASCADE,
  PRIMARY KEY (curso_id, pilar_id)
);

CREATE TABLE public.modulos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE, -- NULL = biblioteca
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.cursos_modulos (
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  PRIMARY KEY (curso_id, modulo_id)
);

CREATE TABLE public.aulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE, -- NULL = biblioteca
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  descricao TEXT,
  video_url VARCHAR(500), 
  duracao_minutos INTEGER DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.modulos_aulas (
  modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE,
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  PRIMARY KEY (modulo_id, aula_id)
);

CREATE TABLE public.materiais_anexos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE, -- NULL = biblioteca
  titulo VARCHAR(255) NOT NULL,
  arquivo_url VARCHAR(500) NOT NULL,
  tipo VARCHAR(50)
);

CREATE TABLE public.aulas_materiais (
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materiais_anexos(id) ON DELETE CASCADE,
  PRIMARY KEY (aula_id, material_id)
);


-- 6. PROGRESSO E ESPAÇADA (SM-2)
-- ==============================================================================
CREATE TABLE public.progresso_aulas (
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
  concluida BOOLEAN DEFAULT FALSE,
  tempo_assistido INTEGER DEFAULT 0, -- Em segundos
  ultima_visualizacao TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(usuario_id, aula_id)
);

CREATE TABLE public.revisao_sm2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
  intervalo INTEGER DEFAULT 1, -- em dias
  repeticoes INTEGER DEFAULT 0,
  ease_factor NUMERIC(5, 2) DEFAULT 2.5,
  proxima_revisao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 7. SIMULADORES E FERRAMENTAS SaaS IA
-- ==============================================================================
CREATE TABLE public.ferramentas_saas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  system_prompt TEXT NOT NULL, -- Prompt mestre estrutural
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.simuladores_roleplay (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  cenario TEXT NOT NULL,
  persona_ia TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.simulacoes_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  simulador_id UUID REFERENCES public.simuladores_roleplay(id) ON DELETE CASCADE,
  score INTEGER,
  feedback_ia TEXT,
  iniciada_em TIMESTAMPTZ DEFAULT NOW(),
  finalizada_em TIMESTAMPTZ
);

CREATE TABLE public.simulacoes_mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id UUID REFERENCES public.simulacoes_historico(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.logs_uso_ia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  rota VARCHAR(255),
  tokens_usados INTEGER,
  modelo VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 8. CORE FUNCTION: tem_acesso_curso
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.tem_acesso_curso(p_user_id UUID, p_curso_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- 1. Verifica se usuário é admin
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE id = p_user_id AND is_admin = TRUE) THEN
    RETURN TRUE;
  END IF;

  -- 2. Verifica se o usuário tem uma assinatura ATIVA de plano GLOBAL
  IF EXISTS (
    SELECT 1 FROM public.assinaturas a
    JOIN public.planos p ON a.plano_id = p.id
    WHERE a.usuario_id = p_user_id
    AND a.status = 'ativa'
    AND p.is_global = TRUE
  ) THEN
    RETURN TRUE;
  END IF;

  -- 3. Verifica se o usuário tem assinatura ATIVA que inclui este CURSO específico
  SELECT count(*) INTO v_count
    FROM public.assinaturas a
    JOIN public.planos_cursos pc ON a.plano_id = pc.plano_id
    WHERE a.usuario_id = p_user_id
    AND a.status = 'ativa'
    AND pc.curso_id = p_curso_id;
    
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 9. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- AVISO: Habilitar RLS em todas as tabelas e forçar políticas

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_aulas ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Usuários

-- O próprio usuário pode ver e editar seu perfil
CREATE POLICY "Select_own_profile" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Update_own_profile" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver todos os usuários
CREATE POLICY "Admins_Select_AllUsers" ON public.usuarios
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- POLÍTICAS: Catálogo e Conteúdo

-- Todos podem LER pilares, cursos e planos (Catálogo Público) se estiverem publicados/ativos
CREATE POLICY "Ver_Cursos_Publicos" ON public.cursos
  FOR SELECT USING (status = 'publicado');

CREATE POLICY "Ver_Planos_Ativos" ON public.planos
  FOR SELECT USING (ativo = TRUE);

CREATE POLICY "Ver_Pilares" ON public.pilares
  FOR SELECT USING (TRUE);

-- Apenas Admin escreve no catálogo
CREATE POLICY "Admins_Crud_Cursos" ON public.cursos
  FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admins_Crud_Planos" ON public.planos
  FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND is_admin = TRUE));

-- Aulas e Módulos: Usuário logado só vê se tiver acesso ao curso respectivo.
-- (No frontend chamaremos a rpc/função tem_acesso_curso diretamente ou através da rota RLS abaixo)
CREATE POLICY "Ler_Módulos" ON public.modulos
  FOR SELECT USING (
    public.tem_acesso_curso(auth.uid(), curso_id)
  );

CREATE POLICY "Ler_Aulas" ON public.aulas
  FOR SELECT USING (
    -- Pega o curso do modulo da aula
    public.tem_acesso_curso(auth.uid(), (SELECT curso_id FROM public.modulos WHERE id = modulo_id))
  );

-- POLÍTICAS: Progresso do aluno
CREATE POLICY "Gerenciar_Proprio_Progresso" ON public.progresso_aulas
  FOR ALL USING (usuario_id = auth.uid());
