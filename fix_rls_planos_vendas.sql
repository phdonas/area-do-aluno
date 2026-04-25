-- ==============================================================================
-- REPARO ESTRUTURAL E DE RLS: VINCULAÇÃO DE PLANOS E CURSOS
-- ==============================================================================

-- 1. ADICIONAR COLUNAS DE PREÇO (Caso não existam)
ALTER TABLE public.planos_cursos 
ADD COLUMN IF NOT EXISTS valor_venda NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_original NUMERIC(10,2) DEFAULT 0;

-- 2. GARANTIR CHAVE PRIMÁRIA COMPOSTA (Essencial para o UPSERT do código funcionar)
DO $$ 
BEGIN
    -- Tenta remover restrições existentes para garantir a PK correta
    ALTER TABLE public.planos_cursos DROP CONSTRAINT IF EXISTS planos_cursos_pkey;
    ALTER TABLE public.planos_cursos ADD PRIMARY KEY (curso_id, plano_id);
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'Chave primária já configurada ou erro ao ajustar.';
END $$;

-- 3. TABELA: public.planos
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin_Manage_Planos" ON public.planos;
CREATE POLICY "Admin_Manage_Planos" ON public.planos FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public_Select_Planos" ON public.planos;
CREATE POLICY "Public_Select_Planos" ON public.planos FOR SELECT USING (ativo = true OR public.is_admin());


-- 4. TABELA: public.planos_cursos
ALTER TABLE public.planos_cursos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public_Select_Planos_Cursos" ON public.planos_cursos;
CREATE POLICY "Public_Select_Planos_Cursos" ON public.planos_cursos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin_All_Planos_Cursos" ON public.planos_cursos;
CREATE POLICY "Admin_All_Planos_Cursos" ON public.planos_cursos FOR ALL USING (public.is_admin());

-- FIM DO REPARO.
