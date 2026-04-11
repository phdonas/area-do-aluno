-- Atualização da Tabela de Usuários para acomodar Origem e Metadados (Tags)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='origem') THEN
        ALTER TABLE public.usuarios ADD COLUMN origem VARCHAR(255) DEFAULT 'direto';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='tags') THEN
        ALTER TABLE public.usuarios ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;
