
-- ==============================================================================
-- PATCH_CONSOLIDADO_V1.sql
-- Objetivo: Sincronizar banco de dados clonado com as necessidades do código.
-- Data: 2026-04-23
-- ==============================================================================

-- 1. SINCRONIZAÇÃO DE ESTRUTURA
-- Adiciona a coluna 'tipo' na tabela modulos se ela não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modulos' AND column_name='tipo') THEN
        ALTER TABLE public.modulos ADD COLUMN tipo TEXT DEFAULT 'video';
    END IF;
END $$;

-- 2. CAMADA DE COMPATIBILIDADE DE USUÁRIOS
-- Cria uma VIEW 'profiles' que aponta para 'usuarios' para suportar código legado
CREATE OR REPLACE VIEW public.profiles AS 
SELECT * FROM public.usuarios;

-- Garante permissões de leitura na View
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 3. RESTAURAÇÃO DA FUNÇÃO DO PLAYER (get_modulos_curso)
-- Versão robusta que suporta vínculos diretos e via tabela de junção (cursos_modulos)
CREATE OR REPLACE FUNCTION public.get_modulos_curso(p_curso_id uuid) 
RETURNS TABLE (
  id uuid, 
  titulo text, 
  descricao text, 
  tipo text, 
  ui_layout text, 
  ordem int
) AS $$ 
BEGIN 
  RETURN QUERY 
  SELECT DISTINCT
    m.id, 
    m.titulo, 
    m.descricao, 
    m.tipo, 
    m.ui_layout, 
    COALESCE(cm.ordem, m.ordem)::int
  FROM public.modulos m 
  LEFT JOIN public.cursos_modulos cm ON cm.modulo_id = m.id 
  WHERE m.curso_id = p_curso_id OR cm.curso_id = p_curso_id 
  ORDER BY 6 ASC;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garante permissões de execução na função
GRANT EXECUTE ON FUNCTION public.get_modulos_curso(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_modulos_curso(uuid) TO anon;

-- 4. POLÍTICAS DE SEGURANÇA (RLS) - AUDITORIA E REFORÇO
-- Garante que os usuários autenticados possam ver seus próprios dados via View/Tabela
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.usuarios FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins possuem acesso total" ON public.usuarios;
CREATE POLICY "Admins possuem acesso total" 
ON public.usuarios FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
