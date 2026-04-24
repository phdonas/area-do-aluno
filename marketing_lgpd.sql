-- ==============================================================================
-- ATUALIZAÇÃO LGPD E MARKETING: PHDonassolo Área do Aluno
-- ==============================================================================

-- 1. Adicionar colunas na tabela usuarios (Se não existirem)
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS aceita_termos BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aceita_marketing BOOLEAN DEFAULT false;

-- 2. Garantir que a Trigger de criação de usuário transfira esses dados (Opcional, mas recomendado)
-- Se você usa uma trigger como "handle_new_user", você pode recriá-la para pegar do raw_user_meta_data.
-- Caso não use, o código (actions.ts) fará o update manualmente.

-- 3. Atualizar Webhooks (Setup via Painel ou SQL)
-- A criação do Webhook em si é melhor feita no painel do Supabase 
-- em Database -> Webhooks -> Create Webhook, apontando para sua rota /api/webhooks/novo-aluno
