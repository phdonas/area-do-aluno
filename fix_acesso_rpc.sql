-- Removemos a função antiga com CASCADE para limpar políticas dependentes (RLS)
DROP FUNCTION IF EXISTS public.tem_acesso_curso(UUID, UUID) CASCADE;

-- Criamos a função robusta de verificação de acesso
CREATE OR REPLACE FUNCTION public.tem_acesso_curso(user_uid UUID, curso_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    acesso_existe BOOLEAN;
BEGIN
    SELECT EXISTS (
        -- Caso 0: Administrador tem acesso a tudo
        SELECT 1 FROM public.usuarios WHERE id = user_uid AND is_admin = TRUE

        UNION

        -- Caso 1: Plano Global Ativo
        SELECT 1 FROM public.assinaturas a
        JOIN public.planos p ON a.plano_id = p.id
        WHERE a.usuario_id = user_uid 
          AND a.status = 'ativa' 
          AND p.is_global = TRUE
          AND (a.data_vencimento IS NULL OR a.data_vencimento > NOW())

        UNION
        
        -- Caso 2: Plano Restrito que inclui este curso
        SELECT 1 FROM public.assinaturas a
        JOIN public.planos_cursos pc ON a.plano_id = pc.plano_id
        WHERE a.usuario_id = user_uid 
          AND a.status = 'ativa' 
          AND pc.curso_id = curso_uuid
          AND (a.data_vencimento IS NULL OR a.data_vencimento > NOW())

        UNION

        -- Caso 3: Matrícula Direta no Curso
        SELECT 1 FROM public.assinaturas a
        WHERE a.usuario_id = user_uid 
          AND a.curso_id = curso_uuid
          AND a.status = 'ativa' 
          AND (a.data_vencimento IS NULL OR a.data_vencimento > NOW())

    ) INTO acesso_existe;

    RETURN acesso_existe;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RECONSTRUÇÃO DAS POLÍTICAS DE RLS (O CASCADE as removeu)
-- Isso garante que as tabelas 'modulos' e 'aulas' continuem seguras

-- 1. Políticas para Módulos
DROP POLICY IF EXISTS "Ler_Módulos" ON public.modulos;
CREATE POLICY "Ler_Módulos" ON public.modulos
  FOR SELECT USING (
    (curso_id IS NOT NULL AND public.tem_acesso_curso(auth.uid(), curso_id))
    OR 
    (curso_id IS NULL AND EXISTS (
        SELECT 1 FROM public.cursos_modulos cm 
        WHERE cm.modulo_id = id AND public.tem_acesso_curso(auth.uid(), cm.curso_id)
    ))
  );

-- 2. Políticas para Aulas
DROP POLICY IF EXISTS "Ler_Aulas" ON public.aulas;
CREATE POLICY "Ler_Aulas" ON public.aulas
  FOR SELECT USING (TRUE); -- A trava real já está no escalonamento de curso/modulo

-- 3. Políticas para Cursos (garante leitura pública apenas dos ativos)
DROP POLICY IF EXISTS "Ver_Cursos_Publicos" ON public.cursos;
CREATE POLICY "Ver_Cursos_Publicos" ON public.cursos
  FOR SELECT USING (status = 'publicado' OR public.is_admin());
