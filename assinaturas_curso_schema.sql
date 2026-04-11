DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assinaturas' AND column_name='curso_id') THEN
        ALTER TABLE public.assinaturas ADD COLUMN curso_id UUID REFERENCES public.cursos(id) ON DELETE RESTRICT;
    END IF;
    
    -- Relax constraints so a subscription can be EITHER a plan or a course
    ALTER TABLE public.assinaturas ALTER COLUMN plano_id DROP NOT NULL;
    
    -- Constraint to ensure at least one is provided
    ALTER TABLE public.assinaturas DROP CONSTRAINT IF EXISTS assinaturas_product_check;
    ALTER TABLE public.assinaturas ADD CONSTRAINT assinaturas_product_check CHECK (plano_id IS NOT NULL OR curso_id IS NOT NULL);
END $$;
