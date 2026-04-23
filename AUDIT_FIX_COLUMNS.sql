-- SCRIPT DE SINCRONIA GERADO POR AUDIT REAL

-- Ajustes para a tabela: pilares
-- Coluna encontrada: id
-- Coluna encontrada: nome
-- Coluna encontrada: cor_badge
-- Coluna encontrada: ordem
-- Coluna encontrada: slug
-- Coluna encontrada: subtitulo
-- Coluna encontrada: icone

-- Ajustes para a tabela: planos
-- Coluna encontrada: id
-- Coluna encontrada: nome
-- Coluna encontrada: descricao
-- Coluna encontrada: preco_mensal
-- Coluna encontrada: preco_anual
-- Coluna encontrada: is_global
-- Coluna encontrada: ativo
-- Coluna encontrada: created_at
-- Coluna encontrada: updated_at
-- Coluna encontrada: duracao_meses
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS duracao_meses INTEGER;

-- Ajustes para a tabela: cursos
-- Coluna encontrada: id
-- Coluna encontrada: titulo
-- Coluna encontrada: slug
-- Coluna encontrada: descricao
-- Coluna encontrada: thumb_url
-- Coluna encontrada: status
-- Coluna encontrada: created_at
-- Coluna encontrada: updated_at
-- Coluna encontrada: pilar_id
-- Coluna encontrada: objetivos
-- Coluna encontrada: publico_alvo
-- Coluna encontrada: resultados_esperados
-- Coluna encontrada: preco
-- Coluna encontrada: formas_pagamento
-- Coluna encontrada: preco_eur
-- Coluna encontrada: ementa_resumida
-- Coluna encontrada: pre_requisitos
-- Coluna encontrada: video_vendas_url
-- Coluna encontrada: garantia_dias
-- Coluna encontrada: faq
-- Coluna encontrada: professor_id
-- Coluna encontrada: duracao_total_minutos
-- Coluna encontrada: destaque_vitrine
-- Coluna encontrada: is_free
-- Coluna encontrada: is_gratis
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS objetivos TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS publico_alvo TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS resultados_esperados TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS preco NUMERIC(10,2);
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS formas_pagamento TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS preco_eur NUMERIC(10,2);
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS ementa_resumida TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS pre_requisitos TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS video_vendas_url TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS garantia_dias INTEGER;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS faq JSONB;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS professor_id TEXT;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS duracao_total_minutos INTEGER;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS destaque_vitrine BOOLEAN;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS is_free BOOLEAN;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS is_gratis BOOLEAN;

-- Ajustes para a tabela: planos_cursos
-- Coluna encontrada: plano_id
-- Coluna encontrada: curso_id

-- Ajustes para a tabela: modulos
-- Coluna encontrada: id
-- Coluna encontrada: curso_id
-- Coluna encontrada: titulo
-- Coluna encontrada: descricao
-- Coluna encontrada: ordem
-- Coluna encontrada: created_at
-- Coluna encontrada: updated_at
-- Coluna encontrada: ui_layout

-- Ajustes para a tabela: aulas
-- Coluna encontrada: id
-- Coluna encontrada: modulo_id
-- Coluna encontrada: titulo
-- Coluna encontrada: slug
-- Coluna encontrada: descricao
-- Coluna encontrada: video_url
-- Coluna encontrada: duracao_segundos
-- Coluna encontrada: ordem
-- Coluna encontrada: created_at
-- Coluna encontrada: updated_at
-- Coluna encontrada: tipo_conteudo
-- Coluna encontrada: questionario_id
-- Coluna encontrada: recurso_id
-- Coluna encontrada: liberacao_dias
-- Coluna encontrada: is_gratis
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS duracao_segundos INTEGER;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS tipo_conteudo TEXT;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS questionario_id UUID;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS recurso_id UUID;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS liberacao_dias INTEGER;
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS is_gratis BOOLEAN;

-- Ajustes para a tabela: materiais_anexos
-- Coluna encontrada: id
-- Coluna encontrada: aula_id
-- Coluna encontrada: arquivo_url
-- Coluna encontrada: tipo
-- Coluna encontrada: titulo
-- Coluna encontrada: is_gratis
-- Coluna encontrada: destaque_vitrine

-- Ajustes para a tabela: usuarios
-- Coluna encontrada: id
-- Coluna encontrada: nome
-- Coluna encontrada: email
-- Coluna encontrada: telefone
-- Coluna encontrada: cpf
-- Coluna encontrada: is_admin
-- Coluna encontrada: status
-- Coluna encontrada: created_at
-- Coluna encontrada: updated_at
-- Coluna encontrada: origem
-- Coluna encontrada: tags
-- Coluna encontrada: role
-- Coluna encontrada: whatsapp
-- Coluna encontrada: contato_preferencial
-- Coluna encontrada: is_staff
-- Coluna encontrada: senha_temporaria
-- Coluna encontrada: cep
-- Coluna encontrada: rua
-- Coluna encontrada: numero
-- Coluna encontrada: bairro
-- Coluna encontrada: cidade
-- Coluna encontrada: estado
-- Coluna encontrada: pilares_interesse
-- Coluna encontrada: pais
-- Coluna encontrada: nif
-- Coluna encontrada: papel
-- Coluna encontrada: notificacao_horario_preferido
-- Coluna encontrada: streak_dias
-- Coluna encontrada: phd_coins_total
-- Coluna encontrada: phd_nivel
-- Coluna encontrada: segmento_mercado
-- Coluna encontrada: cargo
-- Coluna encontrada: tamanho_empresa
-- Coluna encontrada: experiencia_anos
-- Coluna encontrada: endereco
-- Coluna encontrada: perfil_completo_momento2
-- Coluna encontrada: full_name
-- Coluna encontrada: ultimo_acesso

-- Ajustes para a tabela: assinaturas
-- Coluna encontrada: id
-- Coluna encontrada: usuario_id
-- Coluna encontrada: plano_id
-- Coluna encontrada: status
-- Coluna encontrada: mp_preapproval_id
-- Coluna encontrada: data_inicio
-- Coluna encontrada: data_vencimento
-- Coluna encontrada: metadata
-- Coluna encontrada: created_at
-- Coluna encontrada: updated_at
-- Coluna encontrada: curso_id
-- Coluna encontrada: metodo_pagamento
-- Coluna encontrada: status_pagamento
-- Coluna encontrada: valor_pago
-- Coluna encontrada: moeda
-- Coluna encontrada: comprovante_url
-- Coluna encontrada: data_pagamento
-- Coluna encontrada: pais_origem

-- Ajustes para a tabela: progresso_aulas
-- Coluna encontrada: usuario_id
-- Coluna encontrada: aula_id
-- Coluna encontrada: concluida
-- Coluna encontrada: tempo_assistido
-- Coluna encontrada: ultima_visualizacao
-- Coluna encontrada: curso_id
-- Coluna encontrada: posicao_s

-- Ajustes para a tabela: cupons
-- Coluna encontrada: id
-- Coluna encontrada: codigo
-- Coluna encontrada: tipo
-- Coluna encontrada: valor
-- Coluna encontrada: validade_inicio
-- Coluna encontrada: validade_fim
-- Coluna encontrada: limite_uso
-- Coluna encontrada: uso_atual
-- Coluna encontrada: ativo
-- Coluna encontrada: created_at

-- Ajustes para a tabela: logs_matriculas
-- Coluna encontrada: id
-- Coluna encontrada: usuario_id
-- Coluna encontrada: admin_id
-- Coluna encontrada: evento
-- Coluna encontrada: curso_id
-- Coluna encontrada: plano_id
-- Coluna encontrada: origem
-- Coluna encontrada: detalhes
-- Coluna encontrada: created_at

