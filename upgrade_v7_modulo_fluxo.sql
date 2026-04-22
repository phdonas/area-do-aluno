-- UPGRADE V7: MÓDULOS INTELIGENTES E DETALHES DE FERRAMENTA
-- Este script adiciona suporte a layouts de módulo e detalhes estruturados para ferramentas.

-- 1. Adicionar campo de layout nos Módulos
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modulos' AND column_name='ui_layout') THEN
        ALTER TABLE public.modulos ADD COLUMN ui_layout VARCHAR(50) DEFAULT 'padrao';
        -- Opções: 'padrao' (lista de aulas), 'fluxo' (mapa visual)
    END IF;
END $$;

-- 2. Adicionar campos estruturados na tabela de Recursos (Ferramentas)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='recursos' AND column_name='objetivo') THEN
        ALTER TABLE public.recursos 
        ADD COLUMN objetivo TEXT,
        ADD COLUMN quando_usar TEXT,
        ADD COLUMN como_usar TEXT,
        ADD COLUMN resultados_esperados TEXT;
    END IF;
END $$;

-- 3. Comentários para documentação
COMMENT ON COLUMN public.modulos.ui_layout IS 'Define como o módulo é renderizado no player: padrao (lista) ou fluxo (mapa ferramentas)';
COMMENT ON COLUMN public.recursos.objetivo IS 'Objetivo estratégico da ferramenta';
COMMENT ON COLUMN public.recursos.quando_usar IS 'Indicação de uso (timing)';
COMMENT ON COLUMN public.recursos.como_usar IS 'Passo a passo ou instruções de execução';
COMMENT ON COLUMN public.recursos.resultados_esperados IS 'O que o aluno deve obter ao finalizar';
