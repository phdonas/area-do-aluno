
-- FAXINA E VINCULAÇÃO FORÇADA DE RELACIONAMENTOS (APP STANDARD)

DO $$ 
BEGIN
    -- 1. Limpeza de Órfãos (Para evitar erro de Constraint)
    DELETE FROM public.cursos_modulos WHERE curso_id NOT IN (SELECT id FROM public.cursos);
    DELETE FROM public.cursos_modulos WHERE modulo_id NOT IN (SELECT id FROM public.modulos);
    DELETE FROM public.modulos_aulas WHERE modulo_id NOT IN (SELECT id FROM public.modulos);
    DELETE FROM public.modulos_aulas WHERE aula_id NOT IN (SELECT id FROM public.aulas);
    DELETE FROM public.aulas WHERE modulo_id IS NOT NULL AND modulo_id NOT IN (SELECT id FROM public.modulos);

    -- 2. CURSOS_MODULOS
    ALTER TABLE IF EXISTS public.cursos_modulos DROP CONSTRAINT IF EXISTS cursos_modulos_curso_id_fkey;
    ALTER TABLE public.cursos_modulos ADD CONSTRAINT cursos_modulos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;
    ALTER TABLE IF EXISTS public.cursos_modulos DROP CONSTRAINT IF EXISTS cursos_modulos_modulo_id_fkey;
    ALTER TABLE public.cursos_modulos ADD CONSTRAINT cursos_modulos_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;

    -- 3. MODULOS_AULAS
    ALTER TABLE IF EXISTS public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_modulo_id_fkey;
    ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;
    ALTER TABLE IF EXISTS public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_aula_id_fkey;
    ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;

    -- 4. AULAS -> MODULOS (A dica específica do App)
    ALTER TABLE IF EXISTS public.aulas DROP CONSTRAINT IF EXISTS aulas_modulo_id_fkey;
    ALTER TABLE public.aulas ADD CONSTRAINT aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE SET NULL;

    -- 5. MATERIAIS_ANEXOS
    ALTER TABLE IF EXISTS public.materiais_anexos DROP CONSTRAINT IF EXISTS materiais_anexos_aula_id_fkey;
    ALTER TABLE public.materiais_anexos ADD CONSTRAINT materiais_anexos_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;

    -- Recarregar cache
    NOTIFY pgrst, 'reload schema';
END $$;
