
-- TABELA DE PREFIXOS DE LIMPEZA
CREATE TABLE IF NOT EXISTS public.prefixos_limpeza (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prefixo TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA DE ASSINATURAS
CREATE TABLE IF NOT EXISTS public.assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    plano_id UUID REFERENCES public.planos(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'ativa',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA DE PROGRESSO
CREATE TABLE IF NOT EXISTS public.progresso_aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    concluida BOOLEAN DEFAULT FALSE,
    ultima_visualizacao TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, aula_id, curso_id)
);

-- TABELA DE BADGES
CREATE TABLE IF NOT EXISTS public.badges_aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    conquistado_em TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA DE METAS (PDI)
CREATE TABLE IF NOT EXISTS public.metas_aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    prazo DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA DE RELAÇÃO CURSO-PILAR (Para o Radar)
CREATE TABLE IF NOT EXISTS public.cursos_pilares (
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    pilar_id UUID REFERENCES public.pilares(id) ON DELETE CASCADE,
    PRIMARY KEY (curso_id, pilar_id)
);

-- POPULAR DADOS BÁSICOS
INSERT INTO public.prefixos_limpeza (prefixo) VALUES ('Módulo:'), ('Aula:'), ('Curso:') ON CONFLICT DO NOTHING;
