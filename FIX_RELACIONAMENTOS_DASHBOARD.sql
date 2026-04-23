
-- ==============================================================================
-- FIX_RELACIONAMENTOS_DASHBOARD.sql
-- Objetivo: Conectar as tabelas (Foreign Keys) para que as queries do Dashboard funcionem
-- ==============================================================================

-- 1. CONECTAR ASSINATURAS -> CURSOS
-- O erro PGRST200 acontecia porque esta chave não existia
ALTER TABLE public.assinaturas 
DROP CONSTRAINT IF EXISTS assinaturas_curso_id_fkey;

ALTER TABLE public.assinaturas
ADD CONSTRAINT assinaturas_curso_id_fkey 
FOREIGN KEY (curso_id) 
REFERENCES public.cursos(id) 
ON DELETE SET NULL;

-- 2. CONECTAR ASSINATURAS -> PLANOS
ALTER TABLE public.assinaturas 
DROP CONSTRAINT IF EXISTS assinaturas_plano_id_fkey;

ALTER TABLE public.assinaturas
ADD CONSTRAINT assinaturas_plano_id_fkey 
FOREIGN KEY (plano_id) 
REFERENCES public.planos(id) 
ON DELETE SET NULL;

-- 3. CONECTAR PROGRESSO -> AULAS
ALTER TABLE public.progresso_aulas
DROP CONSTRAINT IF EXISTS progresso_aulas_aula_id_fkey;

ALTER TABLE public.progresso_aulas
ADD CONSTRAINT progresso_aulas_aula_id_fkey 
FOREIGN KEY (aula_id) 
REFERENCES public.aulas(id) 
ON DELETE CASCADE;

-- 4. CONECTAR PROGRESSO -> CURSOS
-- Adiciona a FK apenas se a coluna curso_id existir na tabela de progresso
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='progresso_aulas' AND column_name='curso_id') THEN
        ALTER TABLE public.progresso_aulas DROP CONSTRAINT IF EXISTS progresso_aulas_curso_id_fkey;
        ALTER TABLE public.progresso_aulas ADD CONSTRAINT progresso_aulas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. CONECTAR CURSOS -> PILARES (Importante para o Gráfico Radar)
ALTER TABLE public.cursos_pilares
DROP CONSTRAINT IF EXISTS cursos_pilares_curso_id_fkey;
ALTER TABLE public.cursos_pilares
ADD CONSTRAINT cursos_pilares_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;

ALTER TABLE public.cursos_pilares
DROP CONSTRAINT IF EXISTS cursos_pilares_pilar_id_fkey;
ALTER TABLE public.cursos_pilares
ADD CONSTRAINT cursos_pilares_pilar_id_fkey FOREIGN KEY (pilar_id) REFERENCES public.pilares(id) ON DELETE CASCADE;
