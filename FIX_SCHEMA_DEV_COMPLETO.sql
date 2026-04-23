[ignoring loop detection]
-- ==============================================================================
-- SCRIPT DE SINCRONIZAÇÃO DEFINITIVO V4 (PROD -> DEV)
-- Correção: Flexibilização de Constraints (NOT NULL) e Campos Faltantes
-- ==============================================================================

-- 1. CRIAR TABELAS QUE PODEM NÃO EXISTIR
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    tipo_desconto TEXT NOT NULL CHECK (tipo_desconto IN ('percentual', 'fixo')),
    valor NUMERIC(10,2) NOT NULL,
    validade DATE,
    limite_usos INTEGER,
    usos_atual INTEGER DEFAULT 0,
    curso_id UUID REFERENCES public.cursos(id),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.convites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    curso_id UUID REFERENCES public.cursos(id),
    plano_tipo TEXT DEFAULT 'gratuito', 
    origem TEXT NOT NULL,           
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado')),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    aceito_em TIMESTAMPTZ,
    user_id UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.logs_matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.usuarios(id),
    evento TEXT NOT NULL,
    curso_id UUID REFERENCES public.cursos(id),
    plano_id UUID REFERENCES public.planos(id),
    origem TEXT,
    detalhes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AJUSTES DE COLUNAS E FLEXIBILIZAÇÃO (DROP NOT NULL)
-- ------------------------------------------------------------------------------

-- FERRAMENTAS SAAS: Remover trava de system_prompt e adicionar campos extras
ALTER TABLE public.ferramentas_saas ALTER COLUMN system_prompt DROP NOT NULL;
ALTER TABLE public.ferramentas_saas ADD COLUMN IF NOT EXISTS icone VARCHAR(50);
ALTER TABLE public.ferramentas_saas ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';
ALTER TABLE public.ferramentas_saas ADD COLUMN IF NOT EXISTS url_externa TEXT;
ALTER TABLE public.ferramentas_saas ADD COLUMN IF NOT EXISTS capa_url TEXT;
ALTER TABLE public.ferramentas_saas ADD COLUMN IF NOT EXISTS label_botao TEXT DEFAULT 'Acessar';

-- CURSOS: Flexibilizar campos que podem vir vazios de PROD
ALTER TABLE public.cursos ALTER COLUMN thumb_url DROP NOT NULL;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS objetivos TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS publico_alvo TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS resultados_esperados TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS preco NUMERIC(10,2);
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS formas_pagamento TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS preco_eur NUMERIC(10,2);
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS ementa_resumida TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS pre_requisitos TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS video_vendas_url TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS garantia_dias INTEGER DEFAULT 7;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS professor_id TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS duracao_total_minutos INTEGER DEFAULT 0;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS destaque_vitrine BOOLEAN DEFAULT FALSE;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS is_gratis BOOLEAN DEFAULT FALSE;

-- PILARES
ALTER TABLE public.pilares ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.pilares ADD COLUMN IF NOT EXISTS subtitulo TEXT;
ALTER TABLE public.pilares ADD COLUMN IF NOT EXISTS icone TEXT DEFAULT 'Zap';

-- PLANOS
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS duracao_meses INTEGER DEFAULT 12;

-- MODULOS
ALTER TABLE public.modulos ADD COLUMN IF NOT EXISTS ui_layout VARCHAR(50) DEFAULT 'padrao';

-- AULAS
ALTER TABLE public.aulas ALTER COLUMN video_url DROP NOT NULL;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS duracao_segundos INTEGER DEFAULT 0;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS tipo_conteudo TEXT DEFAULT 'video';
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS questionario_id UUID;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS recurso_id UUID;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS liberacao_dias INTEGER DEFAULT 0;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS is_gratis BOOLEAN DEFAULT FALSE;

-- MATERIAIS ANEXOS
ALTER TABLE public.materiais_anexos ADD COLUMN IF NOT EXISTS is_gratis BOOLEAN DEFAULT FALSE;
ALTER TABLE public.materiais_anexos ADD COLUMN IF NOT EXISTS destaque_vitrine BOOLEAN DEFAULT FALSE;

-- USUÁRIOS
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS origem TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'aluno';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS contato_preferencial TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS senha_temporaria TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS rua TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS pilares_interesse TEXT[];
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'Brasil';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS nif TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS papel TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS notificacao_horario_preferido TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS streak_dias INTEGER DEFAULT 0;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS phd_coins_total INTEGER DEFAULT 0;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS phd_nivel INTEGER DEFAULT 1;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS segmento_mercado TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS tamanho_empresa TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS experiencia_anos INTEGER;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS perfil_completo_momento2 BOOLEAN DEFAULT FALSE;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMPTZ;

-- ASSINATURAS
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS curso_id UUID;
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT;
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS status_pagamento TEXT;
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS valor_pago NUMERIC(10,2);
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS moeda TEXT DEFAULT 'BRL';
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS comprovante_url TEXT;
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS data_pagamento TIMESTAMPTZ;
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS pais_origem TEXT;

-- PROGRESSO AULAS
ALTER TABLE public.progresso_aulas ADD COLUMN IF NOT EXISTS curso_id UUID;
ALTER TABLE public.progresso_aulas ADD COLUMN IF NOT EXISTS posicao_s INTEGER DEFAULT 0;

-- CUPONS
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS validade_inicio DATE;
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS validade_fim DATE;
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS limite_uso INTEGER;
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS uso_atual INTEGER DEFAULT 0;

-- RECURSOS
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='recursos') THEN
        ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS objetivo TEXT;
        ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS quando_usar TEXT;
        ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS como_usar TEXT;
        ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS resultados_esperados TEXT;
    END IF;
END $$;
