
-- PADRONIZAÇÃO DE NOMES DE CHAVES ESTRANGEIRAS (PARA BATER COM O APP)

DO $$ 
BEGIN
    -- 1. AULAS -> MODULOS (A chave direta que o App pede explicitamente)
    ALTER TABLE IF EXISTS public.aulas DROP CONSTRAINT IF EXISTS aulas_modulo_id_fkey;
    ALTER TABLE public.aulas ADD CONSTRAINT aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;

    -- 2. CURSOS_MODULOS (Pivot)
    ALTER TABLE IF EXISTS public.cursos_modulos DROP CONSTRAINT IF EXISTS cursos_modulos_curso_id_fkey;
    ALTER TABLE public.cursos_modulos ADD CONSTRAINT cursos_modulos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;
    
    ALTER TABLE IF EXISTS public.cursos_modulos DROP CONSTRAINT IF EXISTS cursos_modulos_modulo_id_fkey;
    ALTER TABLE public.cursos_modulos ADD CONSTRAINT cursos_modulos_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;

    -- 3. MODULOS_AULAS (Pivot)
    ALTER TABLE IF EXISTS public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_modulo_id_fkey;
    ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;

    ALTER TABLE IF EXISTS public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_aula_id_fkey;
    ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;

    -- 4. CURSOS_PILARES (Pivot)
    ALTER TABLE IF EXISTS public.cursos_pilares DROP CONSTRAINT IF EXISTS cursos_pilares_curso_id_fkey;
    ALTER TABLE public.cursos_pilares ADD CONSTRAINT cursos_pilares_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;

    ALTER TABLE IF EXISTS public.cursos_pilares DROP CONSTRAINT IF EXISTS cursos_pilares_pilar_id_fkey;
    ALTER TABLE public.cursos_pilares ADD CONSTRAINT cursos_pilares_pilar_id_fkey FOREIGN KEY (pilar_id) REFERENCES public.pilares(id) ON DELETE CASCADE;

    -- Recarregar cache
    NOTIFY pgrst, 'reload schema';
END $$;
