
-- ==============================================================================
-- FIX_FINAL_ACESSO_ADMIN.sql (v2 - Corrigido Erro de Parâmetros)
-- Objetivo: Resolver o erro 'is_admin() does not exist' e liberar acesso ao Painel
-- ==============================================================================

-- 1. LIMPAR FUNÇÕES ANTIGAS PARA EVITAR CONFLITO DE PARÂMETROS (HINT: Use DROP FUNCTION...)
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.tem_acesso_curso(uuid, uuid) CASCADE;

-- 2. CRIAR/REPARAR FUNÇÃO IS_ADMIN (SECURITY DEFINER permite ler usuarios sem erro de RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    SELECT (is_admin = TRUE OR role = 'admin') INTO v_is_admin 
    FROM public.usuarios 
    WHERE id = auth.uid();
    
    RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. GARANTIR QUE SEU USUÁRIO TENHA TODOS OS PRIVILÉGIOS NO BANCO
UPDATE public.usuarios 
SET 
  is_admin = TRUE, 
  is_staff = TRUE, 
  role = 'admin',
  status = 'ativo'
WHERE email = 'admin@phdonassolo.com';

-- 4. CRIAR FUNÇÃO DE VERIFICAÇÃO DE ACESSO (VITAL PARA AS AULAS APARECEREM)
-- Nota: Usando nomes de parâmetros p_user_id e p_curso_id para consistência
CREATE OR REPLACE FUNCTION public.tem_acesso_curso(p_user_id UUID, p_curso_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        -- Caso 0: Admin ou Staff tem acesso total
        SELECT 1 FROM public.usuarios 
        WHERE id = p_user_id AND (is_admin = TRUE OR is_staff = TRUE OR role = 'admin')
        
        UNION
        
        -- Caso 1: Assinatura Ativa (Curso ou Plano)
        SELECT 1 FROM public.assinaturas
        WHERE usuario_id = p_user_id 
          AND (curso_id = p_curso_id OR plano_id IS NOT NULL)
          AND status IN ('ativa', 'ativo', 'Ativa', 'Ativo')
          AND (data_vencimento IS NULL OR data_vencimento > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. REFORÇAR RLS NA TABELA DE USUÁRIOS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select_own_profile" ON public.usuarios;
CREATE POLICY "Select_own_profile" ON public.usuarios
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Update_own_profile" ON public.usuarios;
CREATE POLICY "Update_own_profile" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- 6. DAR PERMISSÕES DE EXECUÇÃO AOS USUÁRIOS LOGADOS
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.tem_acesso_curso(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tem_acesso_curso(UUID, UUID) TO service_role;

-- 7. GARANTIR COLUNA FULL_NAME (Necessária para o Layout do Next.js)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='full_name') THEN
        ALTER TABLE public.usuarios ADD COLUMN full_name VARCHAR(255);
    END IF;
END $$;

UPDATE public.usuarios SET full_name = nome WHERE (full_name IS NULL OR full_name = '') AND nome IS NOT NULL;
