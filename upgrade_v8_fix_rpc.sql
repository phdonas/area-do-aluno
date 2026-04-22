-- ATUALIZAÇÃO DA FUNÇÃO GET_MODULOS_CURSO PARA INCLUIR UI_LAYOUT
-- Execute este script no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION get_modulos_curso(p_curso_id UUID)
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
  -- 1. Módulos que pertencem apenas a este curso (diretos)
  SELECT m.id, m.titulo, m.descricao, m.ordem, FALSE as is_biblioteca, m.ui_layout
  FROM public.modulos m
  WHERE m.curso_id = p_curso_id
  
  UNION ALL
  
  -- 2. Módulos puxados da biblioteca
  SELECT m.id, m.titulo, m.descricao, cm.ordem, TRUE as is_biblioteca, m.ui_layout
  FROM public.modulos m
  JOIN public.cursos_modulos cm ON m.id = cm.modulo_id
  WHERE cm.curso_id = p_curso_id
  ORDER BY ordem ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
