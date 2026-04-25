-- ==============================================================================
-- SCHEMA_CONSOLIDADO_FINAL.sql
-- Objetivo: Clone integral (Estrutura + Lógica + Segurança) da Produção para Dev
-- Gerado em: 2026-04-23T11:18:37.728Z
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. ESTRUTURA DAS TABELAS (44 TABELAS)

-- Gerado em: 2026-04-23T11:11:10.348Z

CREATE TABLE IF NOT EXISTS public.aulas (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  descricao TEXT,
  video_url TEXT,
  duracao_segundos INTEGER,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  tipo_conteudo TEXT,
  questionario_id UUID,
  recurso_id UUID,
  liberacao_dias INTEGER,
  is_gratis BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.trilhas_estaticas (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo TEXT,
  pilar_slug TEXT,
  segmento TEXT,
  trilha_descricao TEXT NOT NULL,
  cursos_sugeridos UUID,
  ativo BOOLEAN,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.configuracoes_checkout (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT,
  badge_topo TEXT,
  tagline_topo TEXT,
  texto_intro TEXT,
  beneficio_1_titulo TEXT,
  beneficio_1_desc TEXT,
  beneficio_2_titulo TEXT,
  beneficio_2_desc TEXT,
  beneficio_3_titulo TEXT,
  beneficio_3_desc TEXT,
  beneficio_4_titulo TEXT,
  beneficio_4_desc TEXT,
  checkout_card_tagline TEXT,
  texto_seguranca TEXT,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.simuladores_roleplay (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  descricao TEXT,
  cenario TEXT NOT NULL,
  persona_ia TEXT NOT NULL,
  status TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.pilares (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cor_badge TEXT,
  ordem INTEGER,
  slug TEXT,
  subtitulo TEXT,
  icone TEXT
);

CREATE TABLE IF NOT EXISTS public.modulos_aulas (
  modulo_id UUID NOT NULL,
  aula_id UUID NOT NULL,
  ordem INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.revisoes_aula (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  aula_id UUID,
  intervalo INTEGER,
  repeticao INTEGER,
  efactor TEXT,
  proxima_revisao TIMESTAMPTZ,
  ultima_revisao TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.logs_matriculas (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  evento TEXT NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  plano_id UUID REFERENCES public.planos(id) ON DELETE SET NULL,
  origem TEXT,
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.logs_transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
    plano_id UUID REFERENCES public.planos(id) ON DELETE SET NULL,
    provider TEXT NOT NULL, -- 'stripe', 'mercado_pago', 'manual'
    external_id TEXT, -- ID da sessão ou transação no provedor
    status_anterior TEXT,
    status_novo TEXT,
    valor_total DECIMAL(10,2),
    moeda TEXT,
    payload_bruto JSONB,
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.ferramentas_saas (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  system_prompt TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  url_externa TEXT,
  capa_url TEXT,
  label_botao TEXT
);

CREATE TABLE IF NOT EXISTS public.phd_coins_log (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  evento TEXT NOT NULL,
  coins INTEGER NOT NULL,
  referencia_id UUID,
  referencia_tipo TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.metas_aluno (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT,
  ultima_atualizacao TIMESTAMPTZ,
  semanas_estagnada INTEGER,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.modulos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID,
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  ui_layout TEXT,
  tipo TEXT DEFAULT 'video'
);

CREATE TABLE IF NOT EXISTS public.simulacoes_mensagens (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id UUID,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.progresso_aulas (
  usuario_id UUID NOT NULL,
  aula_id UUID NOT NULL,
  concluida BOOLEAN,
  tempo_assistido INTEGER,
  ultima_visualizacao TIMESTAMPTZ,
  curso_id UUID NOT NULL,
  posicao_s INTEGER
);

CREATE TABLE IF NOT EXISTS public.convites_matricula (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL,
  email TEXT NOT NULL,
  curso_id UUID,
  plano_tipo TEXT,
  origem TEXT NOT NULL,
  usado BOOLEAN,
  created_at TIMESTAMPTZ,
  aceito_em TIMESTAMPTZ,
  usuario_id UUID
);

CREATE TABLE IF NOT EXISTS public.planos_cursos (
  plano_id UUID NOT NULL REFERENCES public.planos(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  valor_venda DECIMAL(10,2),
  valor_original DECIMAL(10,2),
  valor_venda_eur DECIMAL(10,2),
  valor_original_eur DECIMAL(10,2),
  valor_venda_usd DECIMAL(10,2),
  valor_original_usd DECIMAL(10,2),
  stripe_price_id_brl TEXT,
  stripe_price_id_eur TEXT,
  stripe_price_id_usd TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (plano_id, curso_id)
);

CREATE TABLE IF NOT EXISTS public.certificados_config (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL,
  template_url TEXT NOT NULL,
  elements JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.planos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_mensal TEXT,
  preco_anual TEXT,
  is_global BOOLEAN,
  ativo BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  duracao_meses INTEGER
);

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN,
  link TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cursos_modulos (
  curso_id UUID NOT NULL,
  modulo_id UUID NOT NULL,
  ordem INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.simulacoes_historico (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  simulador_id UUID,
  score INTEGER,
  feedback_ia TEXT,
  iniciada_em TIMESTAMPTZ,
  finalizada_em TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.prefixos_limpeza (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  prefixo TEXT NOT NULL,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT,
  is_admin BOOLEAN,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  origem TEXT,
  tags JSONB,
  role TEXT,
  whatsapp TEXT,
  contato_preferencial TEXT,
  is_staff BOOLEAN,
  senha_temporaria BOOLEAN,
  cep TEXT,
  rua TEXT,
  numero TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  pilares_interesse TEXT,
  pais TEXT,
  nif TEXT,
  papel TEXT,
  notificacao_horario_preferido TEXT,
  streak_dias INTEGER,
  phd_coins_total INTEGER,
  phd_nivel INTEGER,
  segmento_mercado TEXT,
  cargo TEXT,
  tamanho_empresa TEXT,
  experiencia_anos INTEGER,
  endereco JSONB,
  perfil_completo_momento2 BOOLEAN,
  full_name TEXT,
  ultimo_acesso TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.logs_uso_ia (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  rota TEXT,
  tokens_usados INTEGER,
  modelo TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.questoes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  questionario_id UUID,
  enunciado TEXT NOT NULL,
  tipo TEXT,
  explicacao_correcao TEXT,
  ordem INTEGER,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.leads_nurturing (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  material_id UUID,
  canal TEXT,
  email_enviado BOOLEAN,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.certificados_emitidos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  curso_id UUID NOT NULL,
  config_id UUID NOT NULL,
  codigo_verificacao TEXT NOT NULL,
  data_emissao TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.insights (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  aula_id UUID,
  curso_id UUID,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.diagnosticos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  curso_id UUID,
  tipo TEXT,
  perfil_resultado JSONB,
  trilha_recomendada TEXT,
  regra_aplicada TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.aula_comentarios (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  resposta TEXT,
  respondido_por UUID,
  respondido_em TIMESTAMPTZ,
  status TEXT
);

CREATE TABLE IF NOT EXISTS public.materiais_anexos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID,
  arquivo_url TEXT NOT NULL,
  tipo TEXT,
  titulo TEXT NOT NULL,
  is_gratis BOOLEAN,
  destaque_vitrine BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.revisao_sm2 (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  aula_id UUID,
  intervalo INTEGER,
  repeticoes INTEGER,
  ease_factor TEXT,
  proxima_revisao TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cursos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  descricao TEXT,
  thumb_url TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  pilar_id UUID,
  objetivos TEXT,
  publico_alvo TEXT,
  resultados_esperados TEXT,
  preco TEXT,
  formas_pagamento TEXT,
  preco_eur TEXT,
  ementa_resumida TEXT,
  pre_requisitos TEXT,
  video_vendas_url TEXT,
  garantia_dias INTEGER,
  faq JSONB,
  professor_id UUID,
  duracao_total_minutos INTEGER,
  destaque_vitrine BOOLEAN,
  is_free BOOLEAN,
  is_gratis BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.convites (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL,
  email TEXT NOT NULL,
  curso_id UUID,
  plano_tipo TEXT,
  origem TEXT NOT NULL,
  status TEXT,
  expires_at TIMESTAMPTZ,
  aceito_em TIMESTAMPTZ,
  user_id UUID,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cursos_pilares (
  curso_id UUID NOT NULL,
  pilar_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS public.questoes_alternativas (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  questao_id UUID,
  texto TEXT NOT NULL,
  is_correta BOOLEAN,
  ordem INTEGER,
  explicacao TEXT
);

CREATE TABLE IF NOT EXISTS public.cupons (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  valor TEXT NOT NULL,
  validade_inicio TIMESTAMPTZ NOT NULL,
  validade_fim TIMESTAMPTZ,
  limite_uso INTEGER,
  uso_atual INTEGER,
  ativo BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public.assinaturas (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  plano_id UUID,
  status TEXT,
  mp_preapproval_id TEXT,
  data_inicio TIMESTAMPTZ,
  data_vencimento TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  curso_id UUID,
  metodo_pagamento TEXT,
  status_pagamento TEXT,
  valor_pago DECIMAL(10,2),
  moeda TEXT,
  comprovante_url TEXT,
  data_pagamento TIMESTAMPTZ,
  pais_origem TEXT
);

CREATE TABLE IF NOT EXISTS public.aulas_materiais (
  aula_id UUID NOT NULL,
  material_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS public.recursos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  thumb_url TEXT,
  arquivo_url TEXT NOT NULL,
  tipo TEXT,
  abertura_tipo TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  objetivo TEXT,
  quando_usar TEXT,
  como_usar TEXT,
  resultados_esperados TEXT,
  destaque_vitrine BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.badges_aluno (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  badge_key TEXT NOT NULL,
  badge_nome TEXT NOT NULL,
  conquistado_em TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.professores (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  biografia TEXT,
  avatar_url TEXT,
  links JSONB,
  created_at TIMESTAMPTZ,
  video_url TEXT,
  site_url TEXT
);

CREATE TABLE IF NOT EXISTS public.questionarios (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  nota_corte INTEGER,
  tentativas_permitidas INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.configuracoes_financeiras (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  chave_pix_br TEXT,
  banco_nome_br TEXT,
  favorecido_br TEXT,
  mbway_telemovel_pt TEXT,
  iban_pt TEXT,
  favorecido_pt TEXT,
  email_notificacao_admin TEXT,
  atualizado_em TIMESTAMPTZ
);



-- 3. FUNÇÕES E GATILHOS DE SISTEMA

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, full_name, role, status)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Aluno'), 'student', 'ativo');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho de Sincronização de Usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funções de Acesso
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios 
        WHERE id = auth.uid() 
        AND (is_admin = TRUE OR role = 'admin' OR is_staff = TRUE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.tem_acesso_curso(p_user_id UUID, p_curso_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin sempre tem acesso
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE id = p_user_id AND (is_admin = TRUE OR role = 'admin')) THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.assinaturas
        WHERE usuario_id = p_user_id 
          AND (curso_id = p_curso_id OR plano_id IS NOT NULL)
          AND status IN ('ativa', 'ativo', 'Ativa', 'Ativo')
          AND (data_vencimento IS NULL OR data_vencimento > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função vital para o Dashboard e Player (Versão Corrigida)
CREATE OR REPLACE FUNCTION public.get_modulos_curso(p_curso_id UUID)
RETURNS TABLE (
  id UUID,
  titulo VARCHAR(255),
  descricao TEXT,
  ordem INTEGER,
  is_biblioteca BOOLEAN,
  ui_layout VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  -- Módulos diretos do curso
  SELECT m.id, m.titulo, m.descricao, m.ordem, FALSE as is_biblioteca, m.ui_layout
  FROM public.modulos m
  WHERE m.curso_id = p_curso_id
  
  UNION ALL
  
  -- Módulos puxados da biblioteca (pivot cursos_modulos)
  SELECT m.id, m.titulo, m.descricao, cm.ordem, TRUE as is_biblioteca, m.ui_layout
  FROM public.modulos m
  JOIN public.cursos_modulos cm ON m.id = cm.modulo_id
  WHERE cm.curso_id = p_curso_id
  ORDER BY ordem ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RELACIONAMENTOS (FOREIGN KEYS)
ALTER TABLE public.aulas DROP CONSTRAINT IF EXISTS aulas_modulo_id_fkey;
ALTER TABLE public.aulas ADD CONSTRAINT aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;

ALTER TABLE public.aulas DROP CONSTRAINT IF EXISTS aulas_recurso_id_fkey;
ALTER TABLE public.aulas ADD CONSTRAINT aulas_recurso_id_fkey FOREIGN KEY (recurso_id) REFERENCES public.recursos(id) ON DELETE CASCADE;

ALTER TABLE public.aulas DROP CONSTRAINT IF EXISTS aulas_questionario_id_fkey;
ALTER TABLE public.aulas ADD CONSTRAINT aulas_questionario_id_fkey FOREIGN KEY (questionario_id) REFERENCES public.questionarios(id) ON DELETE CASCADE;

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS modulos_curso_id_fkey;
ALTER TABLE public.modulos ADD CONSTRAINT modulos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;

ALTER TABLE public.assinaturas DROP CONSTRAINT IF EXISTS assinaturas_usuario_id_fkey;
ALTER TABLE public.assinaturas ADD CONSTRAINT assinaturas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

ALTER TABLE public.assinaturas DROP CONSTRAINT IF EXISTS assinaturas_curso_id_fkey;
ALTER TABLE public.assinaturas ADD CONSTRAINT assinaturas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;

ALTER TABLE public.assinaturas DROP CONSTRAINT IF EXISTS assinaturas_plano_id_fkey;
ALTER TABLE public.assinaturas ADD CONSTRAINT assinaturas_plano_id_fkey FOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE CASCADE;

ALTER TABLE public.progresso_aulas DROP CONSTRAINT IF EXISTS progresso_aulas_usuario_id_fkey;
ALTER TABLE public.progresso_aulas ADD CONSTRAINT progresso_aulas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

ALTER TABLE public.progresso_aulas DROP CONSTRAINT IF EXISTS progresso_aulas_aula_id_fkey;
ALTER TABLE public.progresso_aulas ADD CONSTRAINT progresso_aulas_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;

ALTER TABLE public.progresso_aulas DROP CONSTRAINT IF EXISTS progresso_aulas_curso_id_fkey;
ALTER TABLE public.progresso_aulas ADD CONSTRAINT progresso_aulas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;

ALTER TABLE public.cursos DROP CONSTRAINT IF EXISTS cursos_pilar_id_fkey;
ALTER TABLE public.cursos ADD CONSTRAINT cursos_pilar_id_fkey FOREIGN KEY (pilar_id) REFERENCES public.pilares(id) ON DELETE CASCADE;

ALTER TABLE public.cursos DROP CONSTRAINT IF EXISTS cursos_professor_id_fkey;
ALTER TABLE public.cursos ADD CONSTRAINT cursos_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professores(id) ON DELETE CASCADE;

ALTER TABLE public.cursos_pilares DROP CONSTRAINT IF EXISTS cursos_pilares_curso_id_fkey;
ALTER TABLE public.cursos_pilares ADD CONSTRAINT cursos_pilares_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;

ALTER TABLE public.cursos_pilares DROP CONSTRAINT IF EXISTS cursos_pilares_pilar_id_fkey;
ALTER TABLE public.cursos_pilares ADD CONSTRAINT cursos_pilares_pilar_id_fkey FOREIGN KEY (pilar_id) REFERENCES public.pilares(id) ON DELETE CASCADE;

ALTER TABLE public.questoes DROP CONSTRAINT IF EXISTS questoes_questionario_id_fkey;
ALTER TABLE public.questoes ADD CONSTRAINT questoes_questionario_id_fkey FOREIGN KEY (questionario_id) REFERENCES public.questionarios(id) ON DELETE CASCADE;

ALTER TABLE public.questoes_alternativas DROP CONSTRAINT IF EXISTS questoes_alternativas_questao_id_fkey;
ALTER TABLE public.questoes_alternativas ADD CONSTRAINT questoes_alternativas_questao_id_fkey FOREIGN KEY (questao_id) REFERENCES public.questoes(id) ON DELETE CASCADE;


-- FUNÇÕES RPC (EXTRAÍDAS)

-- 5. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.usuarios;
CREATE POLICY "Admin_Full_Access" ON public.usuarios FOR ALL TO authenticated USING (public.is_admin());
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.cursos;
CREATE POLICY "Admin_Full_Access" ON public.cursos FOR ALL TO authenticated USING (public.is_admin());
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.assinaturas;
CREATE POLICY "Admin_Full_Access" ON public.assinaturas FOR ALL TO authenticated USING (public.is_admin());
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.modulos;
CREATE POLICY "Admin_Full_Access" ON public.modulos FOR ALL TO authenticated USING (public.is_admin());
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.aulas;
CREATE POLICY "Admin_Full_Access" ON public.aulas FOR ALL TO authenticated USING (public.is_admin());
ALTER TABLE public.progresso_aulas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.progresso_aulas;
CREATE POLICY "Admin_Full_Access" ON public.progresso_aulas FOR ALL TO authenticated USING (public.is_admin());
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.planos;
CREATE POLICY "Admin_Full_Access" ON public.planos FOR ALL TO authenticated USING (public.is_admin());
ALTER TABLE public.pilares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.pilares;
CREATE POLICY "Admin_Full_Access" ON public.pilares FOR ALL TO authenticated USING (public.is_admin());
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.recursos;
CREATE POLICY "Admin_Full_Access" ON public.recursos FOR ALL TO authenticated USING (public.is_admin());
ALTER TABLE public.questionarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin_Full_Access" ON public.questionarios;
CREATE POLICY "Admin_Full_Access" ON public.questionarios FOR ALL TO authenticated USING (public.is_admin());

-- Políticas de Aluno
CREATE POLICY "Users_Read_Own" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Courses_Read_Public" ON public.cursos FOR SELECT USING (status = 'publicado');
CREATE POLICY "Student_Read_Assigned_Modules" ON public.modulos FOR SELECT USING (public.tem_acesso_curso(auth.uid(), curso_id));
CREATE POLICY "Student_Read_Assigned_Lessons" ON public.aulas FOR SELECT USING (EXISTS (SELECT 1 FROM public.modulos WHERE id = modulo_id AND public.tem_acesso_curso(auth.uid(), curso_id)));
CREATE POLICY "Student_Manage_Own_Progress" ON public.progresso_aulas FOR ALL USING (usuario_id = auth.uid());

-- Segurança para Logs de Transações
ALTER TABLE public.logs_transacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gestores podem ver todos os logs" ON public.logs_transacoes;
CREATE POLICY "Gestores podem ver todos os logs" 
ON public.logs_transacoes FOR SELECT 
TO authenticated 
USING ( 
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND (is_staff = true OR is_admin = true)
    )
);

-- 6. CAMADA DE COMPATIBILIDADE LEGADA
-- Criada para suportar códigos que ainda referenciam a tabela 'profiles'
CREATE OR REPLACE VIEW public.profiles AS SELECT * FROM public.usuarios;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

