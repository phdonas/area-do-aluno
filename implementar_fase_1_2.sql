-- FASE 1: Expansão para Multimoedas
ALTER TABLE planos_cursos 
ADD COLUMN IF NOT EXISTS valor_venda_eur DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS valor_original_eur DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS valor_venda_usd DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS valor_original_usd DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stripe_price_id_brl TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id_eur TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id_usd TEXT;

-- FASE 2: Infraestrutura de Logs de Transações
CREATE TABLE IF NOT EXISTS logs_transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    usuario_id UUID REFERENCES auth.users(id),
    curso_id UUID REFERENCES cursos(id),
    plano_id UUID REFERENCES planos(id),
    provider TEXT NOT NULL, -- 'stripe', 'mercado_pago', 'manual'
    external_id TEXT, -- ID da sessão ou transação no provedor
    status_anterior TEXT,
    status_novo TEXT,
    valor_total DECIMAL(10,2),
    moeda TEXT,
    payload_bruto JSONB, -- Payload completo recebido do webhook
    metadata JSONB
);

-- Habilitar RLS para logs (Apenas admins podem ler)
ALTER TABLE logs_transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todos os logs" 
ON logs_transacoes FOR SELECT 
TO authenticated 
USING ( (SELECT is_staff FROM usuarios WHERE id = auth.uid()) = true );
