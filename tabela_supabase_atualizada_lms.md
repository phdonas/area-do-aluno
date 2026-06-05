| table_name                    | column_name                   | data_type                | is_nullable |
| ----------------------------- | ----------------------------- | ------------------------ | ----------- |
| assinaturas                   | id                            | uuid                     | NO          |
| assinaturas                   | usuario_id                    | uuid                     | YES         |
| assinaturas                   | plano_id                      | uuid                     | YES         |
| assinaturas                   | status                        | character varying        | YES         |
| assinaturas                   | mp_preapproval_id             | character varying        | YES         |
| assinaturas                   | data_inicio                   | timestamp with time zone | YES         |
| assinaturas                   | data_vencimento               | timestamp with time zone | NO          |
| assinaturas                   | metadata                      | jsonb                    | YES         |
| assinaturas                   | created_at                    | timestamp with time zone | YES         |
| assinaturas                   | updated_at                    | timestamp with time zone | YES         |
| assinaturas                   | curso_id                      | uuid                     | YES         |
| assinaturas                   | metodo_pagamento              | character varying        | YES         |
| assinaturas                   | status_pagamento              | character varying        | YES         |
| assinaturas                   | valor_pago                    | numeric                  | YES         |
| assinaturas                   | moeda                         | character varying        | YES         |
| assinaturas                   | comprovante_url               | text                     | YES         |
| assinaturas                   | data_pagamento                | timestamp with time zone | YES         |
| assinaturas                   | pais_origem                   | character varying        | YES         |
| aula_comentarios              | id                            | uuid                     | NO          |
| aula_comentarios              | aula_id                       | uuid                     | NO          |
| aula_comentarios              | usuario_id                    | uuid                     | NO          |
| aula_comentarios              | texto                         | text                     | NO          |
| aula_comentarios              | created_at                    | timestamp with time zone | YES         |
| aula_comentarios              | resposta                      | text                     | YES         |
| aula_comentarios              | respondido_por                | uuid                     | YES         |
| aula_comentarios              | respondido_em                 | timestamp with time zone | YES         |
| aula_comentarios              | status                        | text                     | YES         |
| aulas                         | id                            | uuid                     | NO          |
| aulas                         | modulo_id                     | uuid                     | YES         |
| aulas                         | titulo                        | character varying        | NO          |
| aulas                         | slug                          | character varying        | NO          |
| aulas                         | descricao                     | text                     | YES         |
| aulas                         | video_url                     | character varying        | YES         |
| aulas                         | duracao_segundos              | integer                  | YES         |
| aulas                         | ordem                         | integer                  | NO          |
| aulas                         | created_at                    | timestamp with time zone | YES         |
| aulas                         | updated_at                    | timestamp with time zone | YES         |
| aulas                         | tipo_conteudo                 | character varying        | YES         |
| aulas                         | questionario_id               | uuid                     | YES         |
| aulas                         | recurso_id                    | uuid                     | YES         |
| aulas                         | liberacao_dias                | integer                  | YES         |
| aulas                         | is_gratis                     | boolean                  | YES         |
| aulas_materiais               | aula_id                       | uuid                     | NO          |
| aulas_materiais               | material_id                   | uuid                     | NO          |
| badges_aluno                  | id                            | uuid                     | NO          |
| badges_aluno                  | usuario_id                    | uuid                     | YES         |
| badges_aluno                  | badge_key                     | text                     | NO          |
| badges_aluno                  | badge_nome                    | text                     | NO          |
| badges_aluno                  | conquistado_em                | timestamp with time zone | YES         |
| certificados_config           | id                            | uuid                     | NO          |
| certificados_config           | curso_id                      | uuid                     | NO          |
| certificados_config           | template_url                  | text                     | NO          |
| certificados_config           | elements                      | jsonb                    | NO          |
| certificados_config           | created_at                    | timestamp with time zone | YES         |
| certificados_config           | updated_at                    | timestamp with time zone | YES         |
| certificados_emitidos         | id                            | uuid                     | NO          |
| certificados_emitidos         | usuario_id                    | uuid                     | NO          |
| certificados_emitidos         | curso_id                      | uuid                     | NO          |
| certificados_emitidos         | config_id                     | uuid                     | NO          |
| certificados_emitidos         | codigo_verificacao            | text                     | NO          |
| certificados_emitidos         | data_emissao                  | timestamp with time zone | YES         |
| certificados_emitidos         | metadata                      | jsonb                    | YES         |
| certificados_emitidos         | created_at                    | timestamp with time zone | YES         |
| configuracoes_checkout        | id                            | uuid                     | NO          |
| configuracoes_checkout        | key                           | text                     | YES         |
| configuracoes_checkout        | badge_topo                    | text                     | YES         |
| configuracoes_checkout        | tagline_topo                  | text                     | YES         |
| configuracoes_checkout        | texto_intro                   | text                     | YES         |
| configuracoes_checkout        | beneficio_1_titulo            | text                     | YES         |
| configuracoes_checkout        | beneficio_1_desc              | text                     | YES         |
| configuracoes_checkout        | beneficio_2_titulo            | text                     | YES         |
| configuracoes_checkout        | beneficio_2_desc              | text                     | YES         |
| configuracoes_checkout        | beneficio_3_titulo            | text                     | YES         |
| configuracoes_checkout        | beneficio_3_desc              | text                     | YES         |
| configuracoes_checkout        | beneficio_4_titulo            | text                     | YES         |
| configuracoes_checkout        | beneficio_4_desc              | text                     | YES         |
| configuracoes_checkout        | checkout_card_tagline         | text                     | YES         |
| configuracoes_checkout        | texto_seguranca               | text                     | YES         |
| configuracoes_checkout        | updated_at                    | timestamp with time zone | YES         |
| configuracoes_email_expiracao | id                            | uuid                     | NO          |
| configuracoes_email_expiracao | logo_url                      | text                     | YES         |
| configuracoes_email_expiracao | texto_principal               | text                     | YES         |
| configuracoes_email_expiracao | cupom_desconto                | text                     | YES         |
| configuracoes_email_expiracao | link_base_checkout            | text                     | YES         |
| configuracoes_email_expiracao | suporte_email                 | text                     | YES         |
| configuracoes_email_expiracao | updated_at                    | timestamp with time zone | YES         |
| configuracoes_financeiras     | id                            | uuid                     | NO          |
| configuracoes_financeiras     | chave_pix_br                  | character varying        | YES         |
| configuracoes_financeiras     | banco_nome_br                 | character varying        | YES         |
| configuracoes_financeiras     | favorecido_br                 | character varying        | YES         |
| configuracoes_financeiras     | mbway_telemovel_pt            | character varying        | YES         |
| configuracoes_financeiras     | iban_pt                       | character varying        | YES         |
| configuracoes_financeiras     | favorecido_pt                 | character varying        | YES         |
| configuracoes_financeiras     | email_notificacao_admin       | character varying        | YES         |
| configuracoes_financeiras     | atualizado_em                 | timestamp with time zone | YES         |
| convites                      | id                            | uuid                     | NO          |
| convites                      | token                         | uuid                     | NO          |
| convites                      | email                         | text                     | NO          |
| convites                      | curso_id                      | uuid                     | YES         |
| convites                      | plano_tipo                    | text                     | YES         |
| convites                      | origem                        | text                     | NO          |
| convites                      | status                        | text                     | YES         |
| convites                      | expires_at                    | timestamp with time zone | YES         |
| convites                      | aceito_em                     | timestamp with time zone | YES         |
| convites                      | user_id                       | uuid                     | YES         |
| convites                      | created_at                    | timestamp with time zone | YES         |
| convites_matricula            | id                            | uuid                     | NO          |
| convites_matricula            | token                         | uuid                     | NO          |
| convites_matricula            | email                         | text                     | NO          |
| convites_matricula            | curso_id                      | uuid                     | YES         |
| convites_matricula            | plano_tipo                    | text                     | YES         |
| convites_matricula            | origem                        | text                     | NO          |
| convites_matricula            | usado                         | boolean                  | YES         |
| convites_matricula            | created_at                    | timestamp with time zone | YES         |
| convites_matricula            | aceito_em                     | timestamp with time zone | YES         |
| convites_matricula            | usuario_id                    | uuid                     | YES         |
| cupons                        | id                            | uuid                     | NO          |
| cupons                        | codigo                        | character varying        | NO          |
| cupons                        | tipo                          | character varying        | NO          |
| cupons                        | valor                         | numeric                  | NO          |
| cupons                        | validade_inicio               | timestamp with time zone | NO          |
| cupons                        | validade_fim                  | timestamp with time zone | YES         |
| cupons                        | limite_uso                    | integer                  | YES         |
| cupons                        | uso_atual                     | integer                  | YES         |
| cupons                        | ativo                         | boolean                  | YES         |
| cupons                        | created_at                    | timestamp with time zone | NO          |
| cupons                        | apenas_para_alunos            | boolean                  | YES         |
| cursos                        | id                            | uuid                     | NO          |
| cursos                        | titulo                        | character varying        | NO          |
| cursos                        | slug                          | character varying        | NO          |
| cursos                        | descricao                     | text                     | YES         |
| cursos                        | thumb_url                     | character varying        | YES         |
| cursos                        | status                        | character varying        | YES         |
| cursos                        | created_at                    | timestamp with time zone | YES         |
| cursos                        | updated_at                    | timestamp with time zone | YES         |
| cursos                        | pilar_id                      | uuid                     | YES         |
| cursos                        | objetivos                     | text                     | YES         |
| cursos                        | publico_alvo                  | text                     | YES         |
| cursos                        | resultados_esperados          | text                     | YES         |
| cursos                        | preco                         | character varying        | YES         |
| cursos                        | formas_pagamento              | character varying        | YES         |
| cursos                        | preco_eur                     | numeric                  | YES         |
| cursos                        | ementa_resumida               | text                     | YES         |
| cursos                        | pre_requisitos                | text                     | YES         |
| cursos                        | video_vendas_url              | text                     | YES         |
| cursos                        | garantia_dias                 | integer                  | YES         |
| cursos                        | faq                           | jsonb                    | YES         |
| cursos                        | professor_id                  | uuid                     | YES         |
| cursos                        | duracao_total_minutos         | integer                  | YES         |
| cursos                        | destaque_vitrine              | boolean                  | YES         |
| cursos                        | is_free                       | boolean                  | YES         |
| cursos                        | is_gratis                     | boolean                  | YES         |
| cursos                        | visivel_no_site               | boolean                  | YES         |
| cursos                        | tipo                          | character varying        | YES         |
| cursos                        | url_checkout                  | text                     | YES         |
| cursos                        | nivel                         | character varying        | YES         |
| cursos                        | ordem_vitrine                 | integer                  | YES         |
| cursos                        | categoria                     | character varying        | YES         |
| cursos                        | o_que_aprender                | jsonb                    | YES         |
| cursos                        | para_quem                     | jsonb                    | YES         |
| cursos                        | nao_para_quem                 | jsonb                    | YES         |
| cursos                        | inclui                        | jsonb                    | YES         |
| cursos                        | avaliacoes_count              | integer                  | YES         |
| cursos                        | avaliacoes_media              | numeric                  | YES         |
| cursos                        | preco_vitrine_brl             | numeric                  | YES         |
| cursos                        | preco_original_brl            | numeric                  | YES         |
| cursos_modulos                | curso_id                      | uuid                     | NO          |
| cursos_modulos                | modulo_id                     | uuid                     | NO          |
| cursos_modulos                | ordem                         | integer                  | NO          |
| cursos_pilares                | curso_id                      | uuid                     | NO          |
| cursos_pilares                | pilar_id                      | uuid                     | NO          |
| diagnosticos                  | id                            | uuid                     | NO          |
| diagnosticos                  | usuario_id                    | uuid                     | YES         |
| diagnosticos                  | curso_id                      | uuid                     | YES         |
| diagnosticos                  | tipo                          | text                     | YES         |
| diagnosticos                  | perfil_resultado              | jsonb                    | YES         |
| diagnosticos                  | trilha_recomendada            | text                     | YES         |
| diagnosticos                  | regra_aplicada                | text                     | YES         |
| diagnosticos                  | created_at                    | timestamp with time zone | YES         |
| ferramentas_saas              | id                            | uuid                     | NO          |
| ferramentas_saas              | nome                          | character varying        | NO          |
| ferramentas_saas              | slug                          | character varying        | NO          |
| ferramentas_saas              | descricao                     | text                     | YES         |
| ferramentas_saas              | icone                         | character varying        | YES         |
| ferramentas_saas              | system_prompt                 | text                     | YES         |
| ferramentas_saas              | status                        | character varying        | YES         |
| ferramentas_saas              | created_at                    | timestamp with time zone | YES         |
| ferramentas_saas              | url_externa                   | text                     | YES         |
| ferramentas_saas              | capa_url                      | text                     | YES         |
| ferramentas_saas              | label_botao                   | character varying        | YES         |
| ferramentas_saas              | visivel_no_site               | boolean                  | YES         |
| ferramentas_saas              | tipo_entrega                  | character varying        | YES         |
| ferramentas_saas              | url_entrega                   | text                     | YES         |
| ferramentas_saas              | categoria                     | character varying        | YES         |
| ferramentas_saas              | ordem_vitrine                 | integer                  | YES         |
| insights                      | id                            | uuid                     | NO          |
| insights                      | usuario_id                    | uuid                     | YES         |
| insights                      | aula_id                       | uuid                     | YES         |
| insights                      | curso_id                      | uuid                     | YES         |
| insights                      | conteudo                      | text                     | NO          |
| insights                      | created_at                    | timestamp with time zone | YES         |
| insights                      | updated_at                    | timestamp with time zone | YES         |
| leads_nurturing               | id                            | uuid                     | NO          |
| leads_nurturing               | usuario_id                    | uuid                     | YES         |
| leads_nurturing               | material_id                   | uuid                     | YES         |
| leads_nurturing               | canal                         | text                     | YES         |
| leads_nurturing               | email_enviado                 | boolean                  | YES         |
| leads_nurturing               | created_at                    | timestamp with time zone | YES         |
| log_uso_ferramentas           | id                            | uuid                     | NO          |
| log_uso_ferramentas           | usuario_id                    | uuid                     | NO          |
| log_uso_ferramentas           | ferramenta_id                 | uuid                     | YES         |
| log_uso_ferramentas           | ferramenta_nome               | text                     | NO          |
| log_uso_ferramentas           | url_acessada                  | text                     | YES         |
| log_uso_ferramentas           | created_at                    | timestamp with time zone | YES         |
| logs_matriculas               | id                            | uuid                     | NO          |
| logs_matriculas               | usuario_id                    | uuid                     | YES         |
| logs_matriculas               | admin_id                      | uuid                     | YES         |
| logs_matriculas               | evento                        | text                     | NO          |
| logs_matriculas               | curso_id                      | uuid                     | YES         |
| logs_matriculas               | plano_id                      | uuid                     | YES         |
| logs_matriculas               | origem                        | text                     | YES         |
| logs_matriculas               | detalhes                      | jsonb                    | YES         |
| logs_matriculas               | created_at                    | timestamp with time zone | YES         |
| logs_notificacoes_expiracao   | id                            | uuid                     | NO          |
| logs_notificacoes_expiracao   | assinatura_id                 | uuid                     | YES         |
| logs_notificacoes_expiracao   | tipo_aviso                    | character varying        | YES         |
| logs_notificacoes_expiracao   | enviado_em                    | timestamp with time zone | YES         |
| logs_transacoes               | id                            | uuid                     | NO          |
| logs_transacoes               | created_at                    | timestamp with time zone | YES         |
| logs_transacoes               | usuario_id                    | uuid                     | YES         |
| logs_transacoes               | curso_id                      | uuid                     | YES         |
| logs_transacoes               | plano_id                      | uuid                     | YES         |
| logs_transacoes               | provider                      | text                     | NO          |
| logs_transacoes               | external_id                   | text                     | YES         |
| logs_transacoes               | status_anterior               | text                     | YES         |
| logs_transacoes               | status_novo                   | text                     | YES         |
| logs_transacoes               | valor_total                   | numeric                  | YES         |
| logs_transacoes               | moeda                         | text                     | YES         |
| logs_transacoes               | payload_bruto                 | jsonb                    | YES         |
| logs_transacoes               | metadata                      | jsonb                    | YES         |
| logs_uso_ia                   | id                            | uuid                     | NO          |
| logs_uso_ia                   | usuario_id                    | uuid                     | YES         |
| logs_uso_ia                   | rota                          | character varying        | YES         |
| logs_uso_ia                   | tokens_usados                 | integer                  | YES         |
| logs_uso_ia                   | modelo                        | character varying        | YES         |
| logs_uso_ia                   | created_at                    | timestamp with time zone | YES         |
| materiais_anexos              | id                            | uuid                     | NO          |
| materiais_anexos              | aula_id                       | uuid                     | YES         |
| materiais_anexos              | arquivo_url                   | character varying        | NO          |
| materiais_anexos              | tipo                          | character varying        | YES         |
| materiais_anexos              | titulo                        | character varying        | NO          |
| materiais_anexos              | is_gratis                     | boolean                  | YES         |
| materiais_anexos              | destaque_vitrine              | boolean                  | YES         |
| metas_aluno                   | id                            | uuid                     | NO          |
| metas_aluno                   | usuario_id                    | uuid                     | YES         |
| metas_aluno                   | titulo                        | text                     | NO          |
| metas_aluno                   | descricao                     | text                     | YES         |
| metas_aluno                   | status                        | text                     | YES         |
| metas_aluno                   | ultima_atualizacao            | timestamp with time zone | YES         |
| metas_aluno                   | semanas_estagnada             | integer                  | YES         |
| metas_aluno                   | created_at                    | timestamp with time zone | YES         |
| modulos                       | id                            | uuid                     | NO          |
| modulos                       | curso_id                      | uuid                     | YES         |
| modulos                       | titulo                        | character varying        | NO          |
| modulos                       | descricao                     | text                     | YES         |
| modulos                       | ordem                         | integer                  | NO          |
| modulos                       | created_at                    | timestamp with time zone | YES         |
| modulos                       | updated_at                    | timestamp with time zone | YES         |
| modulos                       | ui_layout                     | character varying        | YES         |
| modulos_aulas                 | modulo_id                     | uuid                     | NO          |
| modulos_aulas                 | aula_id                       | uuid                     | NO          |
| modulos_aulas                 | ordem                         | integer                  | NO          |
| notificacoes                  | id                            | uuid                     | NO          |
| notificacoes                  | usuario_id                    | uuid                     | YES         |
| notificacoes                  | tipo                          | text                     | NO          |
| notificacoes                  | mensagem                      | text                     | NO          |
| notificacoes                  | lida                          | boolean                  | YES         |
| notificacoes                  | link                          | text                     | YES         |
| notificacoes                  | created_at                    | timestamp with time zone | YES         |
| phd_coins_log                 | id                            | uuid                     | NO          |
| phd_coins_log                 | usuario_id                    | uuid                     | YES         |
| phd_coins_log                 | evento                        | text                     | NO          |
| phd_coins_log                 | coins                         | integer                  | NO          |
| phd_coins_log                 | referencia_id                 | uuid                     | YES         |
| phd_coins_log                 | referencia_tipo               | text                     | YES         |
| phd_coins_log                 | created_at                    | timestamp with time zone | YES         |
| pilares                       | id                            | uuid                     | NO          |
| pilares                       | nome                          | character varying        | NO          |
| pilares                       | cor_badge                     | character varying        | YES         |
| pilares                       | ordem                         | integer                  | YES         |
| pilares                       | slug                          | text                     | YES         |
| pilares                       | subtitulo                     | text                     | YES         |
| pilares                       | icone                         | text                     | YES         |
| planos                        | id                            | uuid                     | NO          |
| planos                        | nome                          | character varying        | NO          |
| planos                        | descricao                     | text                     | YES         |
| planos                        | preco_mensal                  | numeric                  | YES         |
| planos                        | preco_anual                   | numeric                  | YES         |
| planos                        | is_global                     | boolean                  | YES         |
| planos                        | ativo                         | boolean                  | YES         |
| planos                        | created_at                    | timestamp with time zone | YES         |
| planos                        | updated_at                    | timestamp with time zone | YES         |
| planos                        | duracao_meses                 | integer                  | YES         |
| planos_cursos                 | plano_id                      | uuid                     | NO          |
| planos_cursos                 | curso_id                      | uuid                     | NO          |
| planos_cursos                 | valor_venda                   | numeric                  | YES         |
| planos_cursos                 | valor_original                | numeric                  | YES         |
| planos_cursos                 | is_ativo                      | boolean                  | YES         |
| planos_cursos                 | is_featured                   | boolean                  | YES         |
| planos_cursos                 | ativo                         | boolean                  | YES         |
| planos_cursos                 | ordem                         | integer                  | YES         |
| planos_cursos                 | valor_venda_eur               | numeric                  | YES         |
| planos_cursos                 | valor_original_eur            | numeric                  | YES         |
| planos_cursos                 | valor_venda_usd               | numeric                  | YES         |
| planos_cursos                 | valor_original_usd            | numeric                  | YES         |
| planos_cursos                 | stripe_price_id_brl           | text                     | YES         |
| planos_cursos                 | stripe_price_id_eur           | text                     | YES         |
| planos_cursos                 | stripe_price_id_usd           | text                     | YES         |
| prefixos_limpeza              | id                            | uuid                     | NO          |
| prefixos_limpeza              | prefixo                       | text                     | NO          |
| prefixos_limpeza              | created_at                    | timestamp with time zone | YES         |
| professores                   | id                            | uuid                     | NO          |
| professores                   | nome                          | text                     | NO          |
| professores                   | biografia                     | text                     | YES         |
| professores                   | avatar_url                    | text                     | YES         |
| professores                   | links                         | jsonb                    | YES         |
| professores                   | created_at                    | timestamp with time zone | YES         |
| professores                   | video_url                     | text                     | YES         |
| professores                   | site_url                      | text                     | YES         |
| progresso_aulas               | usuario_id                    | uuid                     | NO          |
| progresso_aulas               | aula_id                       | uuid                     | NO          |
| progresso_aulas               | concluida                     | boolean                  | YES         |
| progresso_aulas               | tempo_assistido               | integer                  | YES         |
| progresso_aulas               | ultima_visualizacao           | timestamp with time zone | YES         |
| progresso_aulas               | curso_id                      | uuid                     | NO          |
| progresso_aulas               | posicao_s                     | integer                  | YES         |
| questionarios                 | id                            | uuid                     | NO          |
| questionarios                 | titulo                        | character varying        | NO          |
| questionarios                 | descricao                     | text                     | YES         |
| questionarios                 | nota_corte                    | integer                  | YES         |
| questionarios                 | tentativas_permitidas         | integer                  | YES         |
| questionarios                 | created_at                    | timestamp with time zone | YES         |
| questionarios                 | updated_at                    | timestamp with time zone | YES         |
| questoes                      | id                            | uuid                     | NO          |
| questoes                      | questionario_id               | uuid                     | YES         |
| questoes                      | enunciado                     | text                     | NO          |
| questoes                      | tipo                          | character varying        | YES         |
| questoes                      | explicacao_correcao           | text                     | YES         |
| questoes                      | ordem                         | integer                  | YES         |
| questoes                      | created_at                    | timestamp with time zone | YES         |
| questoes_alternativas         | id                            | uuid                     | NO          |
| questoes_alternativas         | questao_id                    | uuid                     | YES         |
| questoes_alternativas         | texto                         | text                     | NO          |
| questoes_alternativas         | is_correta                    | boolean                  | YES         |
| questoes_alternativas         | ordem                         | integer                  | YES         |
| questoes_alternativas         | explicacao                    | text                     | YES         |
| recursos                      | id                            | uuid                     | NO          |
| recursos                      | titulo                        | character varying        | NO          |
| recursos                      | descricao                     | text                     | YES         |
| recursos                      | thumb_url                     | character varying        | YES         |
| recursos                      | arquivo_url                   | character varying        | NO          |
| recursos                      | tipo                          | character varying        | YES         |
| recursos                      | abertura_tipo                 | character varying        | YES         |
| recursos                      | status                        | character varying        | YES         |
| recursos                      | created_at                    | timestamp with time zone | YES         |
| recursos                      | updated_at                    | timestamp with time zone | YES         |
| recursos                      | objetivo                      | text                     | YES         |
| recursos                      | quando_usar                   | text                     | YES         |
| recursos                      | como_usar                     | text                     | YES         |
| recursos                      | resultados_esperados          | text                     | YES         |
| recursos                      | destaque_vitrine              | boolean                  | YES         |
| recursos                      | visivel_no_site               | boolean                  | YES         |
| revisao_sm2                   | id                            | uuid                     | NO          |
| revisao_sm2                   | usuario_id                    | uuid                     | YES         |
| revisao_sm2                   | aula_id                       | uuid                     | YES         |
| revisao_sm2                   | intervalo                     | integer                  | YES         |
| revisao_sm2                   | repeticoes                    | integer                  | YES         |
| revisao_sm2                   | ease_factor                   | numeric                  | YES         |
| revisao_sm2                   | proxima_revisao               | timestamp with time zone | YES         |
| revisao_sm2                   | created_at                    | timestamp with time zone | YES         |
| revisao_sm2                   | updated_at                    | timestamp with time zone | YES         |
| revisoes_aula                 | id                            | uuid                     | NO          |
| revisoes_aula                 | usuario_id                    | uuid                     | YES         |
| revisoes_aula                 | aula_id                       | uuid                     | YES         |
| revisoes_aula                 | intervalo                     | integer                  | YES         |
| revisoes_aula                 | repeticao                     | integer                  | YES         |
| revisoes_aula                 | efactor                       | numeric                  | YES         |
| revisoes_aula                 | proxima_revisao               | timestamp with time zone | YES         |
| revisoes_aula                 | ultima_revisao                | timestamp with time zone | YES         |
| simulacoes_historico          | id                            | uuid                     | NO          |
| simulacoes_historico          | usuario_id                    | uuid                     | YES         |
| simulacoes_historico          | simulador_id                  | uuid                     | YES         |
| simulacoes_historico          | score                         | integer                  | YES         |
| simulacoes_historico          | feedback_ia                   | text                     | YES         |
| simulacoes_historico          | iniciada_em                   | timestamp with time zone | YES         |
| simulacoes_historico          | finalizada_em                 | timestamp with time zone | YES         |
| simulacoes_mensagens          | id                            | uuid                     | NO          |
| simulacoes_mensagens          | sessao_id                     | uuid                     | YES         |
| simulacoes_mensagens          | role                          | character varying        | NO          |
| simulacoes_mensagens          | content                       | text                     | NO          |
| simulacoes_mensagens          | created_at                    | timestamp with time zone | YES         |
| simuladores_roleplay          | id                            | uuid                     | NO          |
| simuladores_roleplay          | nome                          | character varying        | NO          |
| simuladores_roleplay          | slug                          | character varying        | NO          |
| simuladores_roleplay          | descricao                     | text                     | YES         |
| simuladores_roleplay          | cenario                       | text                     | NO          |
| simuladores_roleplay          | persona_ia                    | text                     | NO          |
| simuladores_roleplay          | status                        | character varying        | YES         |
| simuladores_roleplay          | created_at                    | timestamp with time zone | YES         |
| trilhas_estaticas             | id                            | uuid                     | NO          |
| trilhas_estaticas             | cargo                         | text                     | YES         |
| trilhas_estaticas             | pilar_slug                    | text                     | YES         |
| trilhas_estaticas             | segmento                      | text                     | YES         |
| trilhas_estaticas             | trilha_descricao              | text                     | NO          |
| trilhas_estaticas             | cursos_sugeridos              | ARRAY                    | YES         |
| trilhas_estaticas             | ativo                         | boolean                  | YES         |
| trilhas_estaticas             | created_at                    | timestamp with time zone | YES         |
| usuarios                      | id                            | uuid                     | NO          |
| usuarios                      | nome                          | character varying        | NO          |
| usuarios                      | email                         | character varying        | NO          |
| usuarios                      | telefone                      | character varying        | YES         |
| usuarios                      | cpf                           | character varying        | YES         |
| usuarios                      | is_admin                      | boolean                  | YES         |
| usuarios                      | status                        | character varying        | YES         |
| usuarios                      | created_at                    | timestamp with time zone | YES         |
| usuarios                      | updated_at                    | timestamp with time zone | YES         |
| usuarios                      | origem                        | character varying        | YES         |
| usuarios                      | tags                          | jsonb                    | YES         |
| usuarios                      | role                          | character varying        | YES         |
| usuarios                      | whatsapp                      | character varying        | YES         |
| usuarios                      | contato_preferencial          | character varying        | YES         |
| usuarios                      | is_staff                      | boolean                  | YES         |
| usuarios                      | senha_temporaria              | boolean                  | YES         |
| usuarios                      | cep                           | text                     | YES         |
| usuarios                      | rua                           | text                     | YES         |
| usuarios                      | numero                        | text                     | YES         |
| usuarios                      | bairro                        | text                     | YES         |
| usuarios                      | cidade                        | text                     | YES         |
| usuarios                      | estado                        | text                     | YES         |
| usuarios                      | pilares_interesse             | ARRAY                    | YES         |
| usuarios                      | pais                          | text                     | YES         |
| usuarios                      | nif                           | text                     | YES         |
| usuarios                      | papel                         | text                     | YES         |
| usuarios                      | notificacao_horario_preferido | time without time zone   | YES         |
| usuarios                      | streak_dias                   | integer                  | YES         |
| usuarios                      | phd_coins_total               | integer                  | YES         |
| usuarios                      | phd_nivel                     | integer                  | YES         |
| usuarios                      | segmento_mercado              | text                     | YES         |
| usuarios                      | cargo                         | text                     | YES         |
| usuarios                      | tamanho_empresa               | text                     | YES         |
| usuarios                      | experiencia_anos              | integer                  | YES         |
| usuarios                      | endereco                      | jsonb                    | YES         |
| usuarios                      | perfil_completo_momento2      | boolean                  | YES         |
| usuarios                      | full_name                     | text                     | YES         |
| usuarios                      | ultimo_acesso                 | timestamp with time zone | YES         |
| usuarios                      | aceita_termos                 | boolean                  | YES         |
| usuarios                      | aceita_marketing              | boolean                  | YES         |
| usuarios                      | tutorial_concluido            | boolean                  | YES         |
| vw_cursos_precos_base         | curso_id                      | uuid                     | YES         |
| vw_cursos_precos_base         | menor_preco                   | numeric                  | YES         |
| vw_cursos_precos_base         | total_planos                  | bigint                   | YES         |
| vw_cursos_precos_base         | tem_destaque                  | boolean                  | YES         |