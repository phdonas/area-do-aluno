-- ==============================================================================
-- FASE 1: INFRAESTRUTURA FINANCEIRA E PAGAMENTOS DIRETOS
-- ==============================================================================

-- 1. CONFIGURAÇÕES FINANCEIRAS
CREATE TABLE IF NOT EXISTS public.configuracoes_financeiras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave_pix_br VARCHAR(255),
    banco_nome_br VARCHAR(100),
    favorecido_br VARCHAR(255),
    
    mbway_telemovel_pt VARCHAR(20),
    iban_pt VARCHAR(50),
    favorecido_pt VARCHAR(255),
    
    email_notificacao_admin VARCHAR(255) DEFAULT 'admin@phdonassolo.com',
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Dados Iniciais
INSERT INTO public.configuracoes_financeiras (chave_pix_br, favorecido_br, mbway_telemovel_pt, favorecido_pt)
SELECT 'sua-chave-pix@aqui.com', 'Paulo Donassolo', '+351 999 999 999', 'Paulo Donassolo'
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes_financeiras);


-- 2. EVOLUÇÃO DA TABELA DE ASSINATURAS
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assinaturas' AND column_name='metodo_pagamento') THEN
        ALTER TABLE public.assinaturas ADD COLUMN metodo_pagamento VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assinaturas' AND column_name='status_pagamento') THEN
        ALTER TABLE public.assinaturas ADD COLUMN status_pagamento VARCHAR(20) DEFAULT 'pendente';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assinaturas' AND column_name='valor_pago') THEN
        ALTER TABLE public.assinaturas ADD COLUMN valor_pago NUMERIC(10, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assinaturas' AND column_name='moeda') THEN
        ALTER TABLE public.assinaturas ADD COLUMN moeda VARCHAR(5) DEFAULT 'BRL';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assinaturas' AND column_name='comprovante_url') THEN
        ALTER TABLE public.assinaturas ADD COLUMN comprovante_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assinaturas' AND column_name='data_pagamento') THEN
        ALTER TABLE public.assinaturas ADD COLUMN data_pagamento TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assinaturas' AND column_name='pais_origem') THEN
        ALTER TABLE public.assinaturas ADD COLUMN pais_origem VARCHAR(5) DEFAULT 'BR';
    END IF;
END $$;


-- 3. FUNÇÃO PARA APROVAÇÃO FINANCEIRA
CREATE OR REPLACE FUNCTION public.aprovar_assinatura_manual(p_assinatura_id UUID, p_admin_id UUID)
RETURNS VOID AS $$
DECLARE
    v_curso_id UUID;
    v_plano_id UUID;
    v_duracao INTEGER;
    v_vencimento TIMESTAMPTZ;
BEGIN
    -- 1. Verifica se usuário é admin
    IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = p_admin_id AND is_admin = TRUE) THEN
        RAISE EXCEPTION 'Acesso negado: Somente administradores podem aprovar pagamentos.';
    END IF;

    -- 2. Busca dados da assinatura e duração do plano
    SELECT a.curso_id, a.plano_id, COALESCE(p.duracao_meses, 12)
    INTO v_curso_id, v_plano_id, v_duracao
    FROM public.assinaturas a
    JOIN public.planos p ON a.plano_id = p.id
    WHERE a.id = p_assinatura_id;

    -- 3. Calcula vencimento (0 = vitalício)
    IF v_duracao = 0 THEN
        v_vencimento := '9999-12-31 23:59:59';
    ELSE
        v_vencimento := NOW() + (v_duracao || ' months')::interval;
    END IF;

    -- 4. Atualiza a assinatura
    UPDATE public.assinaturas
    SET 
        status = 'ativa',
        status_pagamento = 'pago',
        data_inicio = NOW(),
        data_vencimento = v_vencimento,
        data_pagamento = NOW(),
        updated_at = NOW()
    WHERE id = p_assinatura_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
