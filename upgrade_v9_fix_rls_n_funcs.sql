-- ATUALIZAÇÃO DA FUNÇÃO GET_MODULOS_CURSO (CORRIGIDA)
-- Este script corrige o erro de assinatura da função e garante UI_LAYOUT

-- 1. Remover a função antiga para evitar erro de conflito de retorno
DROP FUNCTION IF EXISTS public.get_modulos_curso(uuid);

-- 2. Recriar a função com a coluna ui_layout incluída
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
  -- Módulos diretos do curso
  SELECT m.id, m.titulo, m.descricao, m.ordem, FALSE as is_biblioteca, m.ui_layout
  FROM public.modulos m
  WHERE m.curso_id = p_curso_id
  
  UNION ALL
  
  -- Módulos puxados da biblioteca (pivot cursos_modulos)
  SELECT m.id, m.titulo, m.descricao, cm.ordem, TRUE as is_biblioteca, m.ui_layout
  FROM public.modulos m
  JOIN public.cursos_modulos cm ON m.id = cm.modulo_id
  WHERE cm.curso_id = p_curso_id
  ORDER BY ordem ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Garantir que o administrador atual tenha permissões corretas na tabela recursos (se necessário)
GRANT ALL ON public.recursos TO authenticated;
GRANT ALL ON public.recursos TO service_role;

-- 4. Garantir que a coluna destaque_vitrine existe (caso o script anterior tenha falhado)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recursos' AND column_name='destaque_vitrine') THEN
        ALTER TABLE public.recursos ADD COLUMN destaque_vitrine BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 5. FORÇAR ATUALIZAÇÃO DO CACHE DO SUPABASE (PostgREST)
-- Isso resolve o erro de "column not found in schema cache"
NOTIFY pgrst, 'reload schema';
