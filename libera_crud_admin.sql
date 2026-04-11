-- Você ativou as tabelas no Supabase mas a Segurança das linhas (RLS) 
-- só permite leitura. Precisamos criar as Políticas de Escrita para o Admin!

ALTER TABLE public.pilares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_anexos ENABLE ROW LEVEL SECURITY;

-- Garante que ALUNOS também possam ver pilares (estava faltando no script base)
DROP POLICY IF EXISTS "Ver_Pilares" ON public.pilares;
CREATE POLICY "Ver_Pilares" ON public.pilares FOR SELECT USING (TRUE);

-- AS POLÍTICAS DE GESTÃO DO ADMIN:
CREATE POLICY "Admin_Crud_Pilares" ON public.pilares FOR ALL USING (public.is_admin());
CREATE POLICY "Admin_Crud_Modulos" ON public.modulos FOR ALL USING (public.is_admin());
CREATE POLICY "Admin_Crud_Aulas" ON public.aulas FOR ALL USING (public.is_admin());
CREATE POLICY "Admin_Crud_Materiais" ON public.materiais_anexos FOR ALL USING (public.is_admin());
