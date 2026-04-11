-- TABELA DE CONFIGURAÇÃO DO CERTIFICADO (Templates)
CREATE TABLE IF NOT EXISTS public.certificados_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    template_url TEXT NOT NULL,
    elements JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(curso_id)
);

-- TABELA DE CERTIFICADOS EMITIDOS
CREATE TABLE IF NOT EXISTS public.certificados_emitidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    config_id UUID NOT NULL REFERENCES public.certificados_config(id) ON DELETE SET NULL,
    codigo_verificacao TEXT UNIQUE NOT NULL,
    data_emissao TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- HABILITAR RLS
ALTER TABLE public.certificados_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados_emitidos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: ADMIN PODE TUDO (Simplificado para usar createAdminClient)
DROP POLICY IF EXISTS "Admin full access certificados_config" ON public.certificados_config;
CREATE POLICY "Admin full access certificados_config" ON public.certificados_config
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access certificados_emitidos" ON public.certificados_emitidos;
CREATE POLICY "Admin full access certificados_emitidos" ON public.certificados_emitidos
    FOR ALL USING (true) WITH CHECK (true);

-- POLÍTICAS: ALUNO PODE VER SEUS PRÓPRIOS CERTIFICADOS
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificados_emitidos;
CREATE POLICY "Users can view their own certificates" ON public.certificados_emitidos
    FOR SELECT USING (auth.uid() = usuario_id);

-- QUALQUER UM PODE VER CONFIG PARA RENDERIZAR
DROP POLICY IF EXISTS "Public view certificate configs" ON public.certificados_config;
CREATE POLICY "Public view certificate configs" ON public.certificados_config
    FOR SELECT USING (true);
