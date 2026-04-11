-- Criação da tabela de comentários/suporte das aulas
CREATE TABLE IF NOT EXISTS public.aula_comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Resposta da Equipe
    resposta TEXT,
    respondido_por UUID REFERENCES public.usuarios(id),
    respondido_em TIMESTAMPTZ,
    
    -- Status
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'respondido', 'arquivado'))
);

-- Ativar RLS
ALTER TABLE public.aula_comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
CREATE POLICY "Alunos podem ver seus próprios comentários"
ON public.aula_comentarios FOR SELECT
TO authenticated
USING (auth.uid() = usuario_id);

CREATE POLICY "Equipe pode ver todos os comentários"
ON public.aula_comentarios FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND (is_admin = true OR is_staff = true)
    )
);

CREATE POLICY "Alunos podem criar comentários"
ON public.aula_comentarios FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Alunos podem deletar seus próprios comentários pendentes"
ON public.aula_comentarios FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id AND status = 'pendente');

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_comentarios_aula ON public.aula_comentarios(aula_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON public.aula_comentarios(usuario_id);
