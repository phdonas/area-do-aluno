-- ==============================================================================
-- MIGRACAO_TOTAL_BRASIL.sql
-- Objetivo: Recriar a estrutura completa (Schema + Lógica + RLS) em São Paulo
-- ==============================================================================

-- 1. EXTENSÕES INICIAIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. FUNÇÕES DE SUPORTE (Criadas antes das tabelas para uso em Defaults)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABELAS PRINCIPAIS (ESTRUTURA COMPLETA)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_staff BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'student',
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  senha_temporaria BOOLEAN DEFAULT FALSE,
  full_name TEXT,
  ultimo_acesso TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cursos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  thumb_url TEXT,
  status TEXT DEFAULT 'rascunho',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  pilar_id UUID,
  preco TEXT,
  is_gratis BOOLEAN DEFAULT FALSE,
  destaque_vitrine BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.modulos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ui_layout VARCHAR(50) DEFAULT 'video',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recursos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  arquivo_url TEXT NOT NULL,
  tipo TEXT DEFAULT 'simulador',
  abertura_tipo TEXT DEFAULT 'modal',
  status TEXT DEFAULT 'ativo',
  destaque_vitrine BOOLEAN DEFAULT FALSE,
  objetivo TEXT,
  quando_usar TEXT,
  como_usar TEXT,
  resultados_esperados TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questionarios (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  nota_corte INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aulas (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  descricao TEXT,
  video_url TEXT,
  duracao_segundos INTEGER DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  tipo_conteudo TEXT DEFAULT 'video',
  questionario_id UUID REFERENCES public.questionarios(id) ON DELETE SET NULL,
  recurso_id UUID REFERENCES public.recursos(id) ON DELETE SET NULL,
  liberacao_dias INTEGER DEFAULT 0,
  is_gratis BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assinaturas (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ativa',
  data_vencimento TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progresso_aulas (
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  concluida BOOLEAN DEFAULT FALSE,
  posicao_s INTEGER DEFAULT 0,
  ultima_visualizacao TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (usuario_id, aula_id)
);

CREATE TABLE IF NOT EXISTS public.materiais_anexos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  tipo TEXT DEFAULT 'arquivo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUNÇÕES DE LÓGICA (COM SECURITY DEFINER PARA EVITAR QUEBRAS DE RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT (is_admin OR role = 'admin' OR is_staff) INTO v_is_admin 
  FROM public.usuarios WHERE id = auth.uid();
  RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.tem_acesso_curso(p_user_id UUID, p_curso_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.is_admin() THEN RETURN TRUE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.assinaturas
    WHERE usuario_id = p_user_id 
      AND curso_id = p_curso_id
      AND status IN ('ativa', 'ativo', 'Ativa', 'Ativo')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_modulos_curso(p_curso_id UUID)
RETURNS TABLE (
  id UUID,
  titulo VARCHAR(255),
  descricao TEXT,
  ordem INTEGER,
  is_biblioteca BOOLEAN,
  ui_layout VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.titulo::VARCHAR(255), m.descricao, m.ordem, FALSE as is_biblioteca, m.ui_layout::VARCHAR(50)
  FROM public.modulos m
  WHERE m.curso_id = p_curso_id
  ORDER BY m.ordem ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGERS DE SEGURANÇA E AUTOMAÇÃO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, full_name, role, status)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Aluno'), 'student', 'ativo');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. HABILITAR RLS (SEGURANÇA TOTAL)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_anexos ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE ACESSO (O CORE DO SISTEMA)

-- Política Global de Admin
DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admin_Full_Access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Admin_Full_Access" ON public.%I FOR ALL TO authenticated USING (public.is_admin())', t);
  END LOOP;
END $$;

-- Políticas de Aluno
CREATE POLICY "Visualizar_Proprio_Perfil" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Visualizar_Cursos_Ativos" ON public.cursos FOR SELECT USING (status = 'publicado' OR is_gratis = TRUE);
CREATE POLICY "Visualizar_Modulos_Acesso" ON public.modulos FOR SELECT USING (public.tem_acesso_curso(auth.uid(), curso_id));
CREATE POLICY "Visualizar_Aulas_Acesso" ON public.aulas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.modulos WHERE id = modulo_id AND public.tem_acesso_curso(auth.uid(), curso_id))
);
CREATE POLICY "Gerenciar_Proprio_Progresso" ON public.progresso_aulas FOR ALL USING (usuario_id = auth.uid());
CREATE POLICY "Ver_Proprias_Assinaturas" ON public.assinaturas FOR SELECT USING (usuario_id = auth.uid());

-- View de compatibilidade
CREATE OR REPLACE VIEW public.profiles AS SELECT * FROM public.usuarios;

-- Finalização
NOTIFY pgrst, 'reload schema';
