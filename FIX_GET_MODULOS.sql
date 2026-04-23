
-- Ajuste da função get_modulos_curso para suportar pivot e ligação direta
CREATE OR REPLACE FUNCTION public.get_modulos_curso(p_curso_id UUID)
RETURNS TABLE (id UUID, titulo TEXT, ordem INTEGER, ui_layout TEXT) AS $$
BEGIN
    RETURN QUERY
    -- Busca módulos ligados via tabela pivot (novo padrão)
    SELECT m.id, m.titulo, cm.ordem, m.ui_layout
    FROM public.modulos m
    JOIN public.cursos_modulos cm ON cm.modulo_id = m.id
    WHERE cm.curso_id = p_curso_id
    
    UNION
    
    -- Busca módulos ligados diretamente (padrão legado)
    SELECT m.id, m.titulo, m.ordem, m.ui_layout
    FROM public.modulos m
    WHERE m.curso_id = p_curso_id
    AND NOT EXISTS (SELECT 1 FROM public.cursos_modulos WHERE modulo_id = m.id AND curso_id = p_curso_id)
    
    ORDER BY ordem ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
