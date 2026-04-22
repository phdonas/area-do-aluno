-- ==============================================================================
-- FIX FINAL V5.2: SINCRONIZAÇÃO DE ENTREGA E DEDUPLICAÇÃO
-- ==============================================================================

-- 1. Adicionar campo is_free para suportar a Vitrine do Dashboard
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;

-- 2. Refatorar a função de busca de módulos para evitar duplicidade (UNION ALL -> DISTINCT)
-- Prioriza a ordem definida no pivot 'cursos_modulos'
CREATE OR REPLACE FUNCTION get_modulos_curso(p_curso_id UUID)
RETURNS TABLE (
  id UUID,
  titulo VARCHAR(255),
  descricao TEXT,
  ordem INTEGER,
  is_biblioteca BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (m.id)
    m.id, 
    m.titulo, 
    m.descricao, 
    COALESCE(cm.ordem, m.ordem) as ordem,
    (m.curso_id IS NULL OR m.curso_id != p_curso_id) as is_biblioteca
  FROM public.modulos m
  LEFT JOIN public.cursos_modulos cm ON m.id = cm.modulo_id AND cm.curso_id = p_curso_id
  WHERE m.curso_id = p_curso_id OR cm.curso_id = p_curso_id
  ORDER BY m.id, ordem ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Garantir Políticas de RLS para o Fluxo de Cadastro (Novos Alunos)
-- Permite que o sistema (via Admin) ou o processo de signup valide convites

-- Log de Matrículas: Permitir que o AdminClient insira logs
DROP POLICY IF EXISTS "Admins_Manage_Logs_v2" ON public.logs_matriculas;
CREATE POLICY "Admins_Manage_Logs_v2" ON public.logs_matriculas FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND (is_admin = TRUE OR is_staff = TRUE)));

-- 4. Criar Conta do Robô de Sistema (Opcional, mas recomendado para logs)
-- INSERT INTO public.usuarios (id, email, nome, is_admin, is_staff) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'sistema@phdonassolo.com', 'Sistema Vortex', true, true)
-- ON CONFLICT DO NOTHING;

-- 5. Infraestrutura de Comentários e Suporte (Correção de 404 no Player)
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
DROP POLICY IF EXISTS "Alunos podem ver seus próprios comentários" ON public.aula_comentarios;
CREATE POLICY "Alunos podem ver seus próprios comentários" ON public.aula_comentarios FOR SELECT TO authenticated USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Equipe pode ver todos os comentários" ON public.aula_comentarios;
CREATE POLICY "Equipe pode ver todos os comentários" ON public.aula_comentarios FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND (is_admin = true OR is_staff = true)));

DROP POLICY IF EXISTS "Alunos podem criar comentários" ON public.aula_comentarios;
CREATE POLICY "Alunos podem criar comentários" ON public.aula_comentarios FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Alunos podem deletar seus próprios comentários pendentes" ON public.aula_comentarios;
CREATE POLICY "Alunos podem deletar seus próprios comentários pendentes" ON public.aula_comentarios FOR DELETE TO authenticated USING (auth.uid() = usuario_id AND status = 'pendente');

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_comentarios_aula ON public.aula_comentarios(aula_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON public.aula_comentarios(usuario_id);
