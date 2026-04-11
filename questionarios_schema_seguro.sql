-- 1. Criação das Tabelas de Questionários (Ignorar se já existem, mas se não existem ele cria)
CREATE TABLE IF NOT EXISTS public.questionarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  nota_corte INTEGER DEFAULT 70,
  tentativas_permitidas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionario_id UUID REFERENCES public.questionarios(id) ON DELETE CASCADE,
  enunciado TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'multipla_escolha',
  explicacao_correcao TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questoes_alternativas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questao_id UUID REFERENCES public.questoes(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  is_correta BOOLEAN DEFAULT FALSE,
  ordem INTEGER DEFAULT 0
);

-- 2. Atualizar as Aulas (Usando DO block para evitar erro se a coluna já existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aulas' AND column_name='tipo_conteudo') THEN
        ALTER TABLE public.aulas ADD COLUMN tipo_conteudo VARCHAR(20) DEFAULT 'video';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aulas' AND column_name='questionario_id') THEN
        ALTER TABLE public.aulas ADD COLUMN questionario_id UUID REFERENCES public.questionarios(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Habilitar Segurança (RLS) para as Tabelas
ALTER TABLE public.questionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes_alternativas ENABLE ROW LEVEL SECURITY;

-- 4. Criar as Políticas de Leitura para Alunos (Todos logados)
DROP POLICY IF EXISTS "Ver_Questionarios" ON public.questionarios;
CREATE POLICY "Ver_Questionarios" ON public.questionarios FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Ver_Questoes" ON public.questoes;
CREATE POLICY "Ver_Questoes" ON public.questoes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Ver_Alternativas" ON public.questoes_alternativas;
CREATE POLICY "Ver_Alternativas" ON public.questoes_alternativas FOR SELECT USING (TRUE);

-- 5. Criar as Políticas de Escrita para o Administrador (Painel Gestor)
DROP POLICY IF EXISTS "Admin_Crud_Questionarios" ON public.questionarios;
CREATE POLICY "Admin_Crud_Questionarios" ON public.questionarios FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin_Crud_Questoes" ON public.questoes;
CREATE POLICY "Admin_Crud_Questoes" ON public.questoes FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin_Crud_Alternativas" ON public.questoes_alternativas;
CREATE POLICY "Admin_Crud_Alternativas" ON public.questoes_alternativas FOR ALL USING (public.is_admin());
