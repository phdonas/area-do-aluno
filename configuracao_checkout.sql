-- Tabela para centralizar os textos de marketing do checkout
CREATE TABLE IF NOT EXISTS public.configuracoes_checkout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE DEFAULT 'default',
    badge_topo TEXT DEFAULT 'Acesso Elite • Vitalício',
    tagline_topo TEXT DEFAULT 'Altamente Recomendado',
    texto_intro TEXT DEFAULT 'Prepare-se para uma transformação profunda. Você está prestes a ingressar na elite do conhecimento técnico com o ecossistema PH Donassolo.',
    beneficio_1_titulo TEXT DEFAULT 'Certificado Gold',
    beneficio_1_desc TEXT DEFAULT 'Válido em todo território nacional',
    beneficio_2_titulo TEXT DEFAULT 'Acesso Imediato',
    beneficio_2_desc TEXT DEFAULT 'Login liberado após a confirmação',
    beneficio_3_titulo TEXT DEFAULT 'Update Contínuo',
    beneficio_3_desc TEXT DEFAULT 'Novas aulas inclusas sem custos',
    beneficio_4_titulo TEXT DEFAULT 'Suporte VIP',
    beneficio_4_desc TEXT DEFAULT 'Tire dúvidas direto com o mestre',
    checkout_card_tagline TEXT DEFAULT 'Sua jornada começa aqui',
    texto_seguranca TEXT DEFAULT 'Seus dados são criptografados de ponta a ponta via SSL de 256 bits. Transação processada pelo Mercado Pago.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_checkout ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver e editar
CREATE POLICY "Acesso completo para admins" ON public.configuracoes_checkout
    USING (EXISTS (SELECT 1 FROM public.usuarios WHERE email = auth.email() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.usuarios WHERE email = auth.email() AND role = 'admin'));

-- Inserir valor padrão se não existir
INSERT INTO public.configuracoes_checkout (key) 
VALUES ('default') 
ON CONFLICT (key) DO NOTHING;
