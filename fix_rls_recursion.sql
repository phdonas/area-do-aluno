-- 1. Remover a política defeituosa
DROP POLICY IF EXISTS "Admins_Select_AllUsers" ON public.usuarios;

-- 2. Criar uma Função Segura (Security Definer) que bypassa o RLS para checar admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Security definer permite rodar com privilégios de bypass RLS
  SELECT is_admin INTO v_is_admin FROM public.usuarios WHERE id = auth.uid();
  RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar a política Administrativa dos usuários usando a nova função
CREATE POLICY "Admins_Select_AllUsers" ON public.usuarios
  FOR SELECT USING (public.is_admin());

-- 4. Vamos também corrigir nas políticas de cursos e planos para otimizar a velocidade e evitar novos erros:
DROP POLICY IF EXISTS "Admins_Crud_Cursos" ON public.cursos;
CREATE POLICY "Admins_Crud_Cursos" ON public.cursos
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins_Crud_Planos" ON public.planos;
CREATE POLICY "Admins_Crud_Planos" ON public.planos
  FOR ALL USING (public.is_admin());
