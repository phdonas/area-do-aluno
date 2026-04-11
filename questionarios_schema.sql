-- Tabela Principal de Questionários (Biblioteca)
CREATE TABLE public.questionarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  nota_corte INTEGER DEFAULT 70, -- porcentagem para passar (0 a 100)
  tentativas_permitidas INTEGER DEFAULT 0, -- 0 = ilimitadas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questões do Questionário
CREATE TABLE public.questoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionario_id UUID REFERENCES public.questionarios(id) ON DELETE CASCADE,
  enunciado TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'multipla_escolha', -- 'multipla_escolha', 'verdadeiro_falso'
  explicacao_correcao TEXT, -- Feedback opcional mostrado após responder
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alternativas das Questões
CREATE TABLE public.questoes_alternativas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questao_id UUID REFERENCES public.questoes(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  is_correta BOOLEAN DEFAULT FALSE,
  ordem INTEGER DEFAULT 0
);

-- Ampliando a tabela Aulas para suportar múltiplos tipos de conteúdo
ALTER TABLE public.aulas ADD COLUMN tipo_conteudo VARCHAR(20) DEFAULT 'video'; -- pode ser 'video', 'questionario', 'texto'
ALTER TABLE public.aulas ADD COLUMN questionario_id UUID REFERENCES public.questionarios(id) ON DELETE SET NULL;
