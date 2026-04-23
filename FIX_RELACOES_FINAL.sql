
-- CORREÇÃO DEFINITIVA DE RELACIONAMENTOS (FOREIGN KEYS)
-- Este script força os vínculos necessários para o Admin Panel e Dashboard

DO $$ 
BEGIN
    -- 1. CURSOS_MODULOS
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_cursos_modulos_curso') THEN
        ALTER TABLE public.cursos_modulos ADD CONSTRAINT fk_cursos_modulos_curso FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_cursos_modulos_modulo') THEN
        ALTER TABLE public.cursos_modulos ADD CONSTRAINT fk_cursos_modulos_modulo FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;
    END IF;

    -- 2. MODULOS_AULAS
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_modulos_aulas_modulo') THEN
        ALTER TABLE public.modulos_aulas ADD CONSTRAINT fk_modulos_aulas_modulo FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_modulos_aulas_aula') THEN
        ALTER TABLE public.modulos_aulas ADD CONSTRAINT fk_modulos_aulas_aula FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;
    END IF;

    -- 3. MATERIAIS_ANEXOS
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_materiais_anexos_aula') THEN
        ALTER TABLE public.materiais_anexos ADD CONSTRAINT fk_materiais_anexos_aula FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;
    END IF;

    -- 4. BADGES_ALUNO & METAS_ALUNO
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_badges_aluno_usuario') THEN
        ALTER TABLE public.badges_aluno ADD CONSTRAINT fk_badges_aluno_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_metas_aluno_usuario') THEN
        ALTER TABLE public.metas_aluno ADD CONSTRAINT fk_metas_aluno_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    END IF;

END $$;
