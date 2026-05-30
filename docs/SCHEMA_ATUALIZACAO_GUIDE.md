# Dicionário de Dados e Orientações de Schema Total (Área do Aluno)

Este documento representa o **Schema Total** da aplicação "PHD Academy", incluindo dicionário de dados de todas as tabelas, funções (RPC), gatilhos (Triggers) e políticas de segurança (RLS). Serve como a fonte de verdade para a estrutura de dados atual (V6).

## 1. Visão Geral da Arquitetura de Dados
O banco de dados (PostgreSQL hospedado no Supabase) é composto por **44 tabelas** organizadas em grandes domínios:
1. **Identidade e Perfil:** `usuarios` (e view de retrocompatibilidade `profiles`).
2. **Catálogo e Conteúdo:** `cursos`, `modulos`, `aulas`, `pilares`, `professores`.
3. **Mecânica de Vendas:** `planos`, `planos_cursos`, `assinaturas`, `cupons`, `configuracoes_checkout`.
4. **Aprendizado e Progresso:** `progresso_aulas`, `revisoes_aula`, `revisao_sm2`.
5. **Inteligência e Ferramentas:** `ferramentas_saas`, `simuladores_roleplay`, `simulacoes_historico`.
6. **Gamificação e PDI:** `phd_coins_log`, `badges_aluno`, `metas_aluno`.
7. **Infraestrutura e Logs:** `logs_transacoes`, `logs_matriculas`, `logs_uso_ia`.

---

## 2. Dicionário de Tabelas (Entidades)

### 2.1 Identidade e Controle de Acesso
- **`usuarios`**: Tabela principal. Extensão da tabela `auth.users` do Supabase.
  - Colunas Notáveis: `id` (PK, UUID), `email`, `role`, `is_admin`, `is_staff`, `status`, `streak_dias`, `phd_coins_total`, `phd_nivel`, `papel` (aluno, visitante, admin).
  - *Nota:* A view `profiles` espelha esta tabela para manter a compatibilidade com códigos legados.

### 2.2 Catálogo de Ensino
- **`cursos`**: Cadastro mestre de treinamentos.
  - Colunas: `id`, `titulo`, `slug`, `pilar_id`, `professor_id`, `preco`, `preco_eur`, `is_gratis`, `destaque_vitrine`.
- **`modulos`**: Agrupamentos de aulas. Pode pertencer diretamente a um curso (`curso_id`) ou vir da biblioteca via pivot (`cursos_modulos`).
  - Colunas: `id`, `curso_id`, `titulo`, `ordem`, `ui_layout`, `tipo`.
- **`aulas`**: Conteúdo final. 
  - Colunas: `id`, `modulo_id`, `titulo`, `slug`, `video_url`, `duracao_segundos`, `ordem`, `is_gratis`.
- **`pilares`**: Áreas de conhecimento (Ex: Vendas, Liderança).
- **`professores`**: Cadastro de docentes para vínculo nos cursos.

### 2.3 Pagamentos e Acesso
- **`planos`**: Assinaturas globais ou pacotes genéricos.
- **`planos_cursos`**: Tabela pivot (`plano_id`, `curso_id`) com preços multimoedas: `valor_venda`, `valor_venda_eur`, `valor_venda_usd`, e chaves do Stripe.
- **`assinaturas`**: Controle de acesso individual e efetivação de compras. 
  - Colunas: `usuario_id`, `plano_id`, `curso_id`, `status` (ativa, inativa), `data_vencimento`, `status_pagamento`.
- **`cupons`**: Regras de desconto. (`codigo`, `tipo`, `valor`, `validade_fim`, `limite_uso`, `uso_atual`).
- **`configuracoes_financeiras`**: Chaves PIX, MBWay e NIFs do administrador recebedor.

### 2.4 Progresso e Engajamento
- **`progresso_aulas`**: Marcações de vídeos concluídos. (`usuario_id`, `aula_id`, `curso_id`, `concluida`, `posicao_s` para retomada).
- **`revisoes_aula` / `revisao_sm2`**: Algoritmos de repetição espaçada (Spaced Repetition).
- **`metas_aluno`**: Plano de Desenvolvimento Individual (PDI).

### 2.5 Gamificação
- **`phd_coins_log`**: Registro imutável de transações de moedas. (`usuario_id`, `evento`, `coins`, `referencia_tipo`).
- **`badges_aluno`**: Conquistas estáticas (ex: 'semana_perfeita').

### 2.6 Inteligência Artificial
- **`ferramentas_saas`**: Prompts estáticos em formato SaaS. (`nome`, `system_prompt`, `url_externa`).
- **`simuladores_roleplay`**: Simuladores avançados de negociação. (`cenario`, `persona_ia`).
- **`simulacoes_mensagens` / `simulacoes_historico`**: Logs de conversas entre aluno e a LLM.

### 2.7 Auditoria e Logs
- **`logs_transacoes`**: Payload cru e histórico de mudanças de status do webhook Stripe/MercadoPago.
- **`logs_matriculas`**: Histórico logico de concessão/revogação de acesso.

---

## 3. Funções Nativas (RPCs) Principais

1. **`is_admin()`**: Retorna TRUE se o usuário corrente tiver `is_admin = TRUE` ou `role = 'admin'` ou `is_staff = TRUE` na tabela `usuarios`. Usado massivamente em RLS.
2. **`tem_acesso_curso(p_user_id, p_curso_id)`**: Checa na tabela `assinaturas` se o usuário possui status "ativo" para aquele curso direto ou via plano abrangente.
3. **`get_modulos_curso(p_curso_id)`**: Retorna a união entre os módulos diretos do curso e os módulos genéricos vinculados via `cursos_modulos`. Essencial para renderizar a UI do Player e Dashboard.

---

## 4. Gatilhos do Banco (Triggers)

1. **`on_auth_user_created`**: 
   - **Evento:** AFTER INSERT em `auth.users`
   - **Ação:** Executa `handle_new_user()`, que insere um registro idêntico na tabela `public.usuarios` com papel default 'student'.
2. **`set_updated_at`**: Atrelado a várias tabelas (ex: `cursos`, `aulas`) para atualizar a coluna `updated_at` para `NOW()` no BEFORE UPDATE.

---

## 5. Políticas de Segurança (RLS)

- **Regra Ouro Admin:** Quase todas as tabelas possuem a política genérica:
  `CREATE POLICY "Admin_Full_Access" ON tabela FOR ALL TO authenticated USING (public.is_admin());`
- **Tabela Usuarios:**
  `CREATE POLICY "Users_Read_Own" ON public.usuarios FOR SELECT USING (auth.uid() = id);`
- **Catálogo (Cursos):**
  `CREATE POLICY "Courses_Read_Public" ON public.cursos FOR SELECT USING (status = 'publicado');`
- **Acesso Bloqueado a Conteúdo Fechado:**
  As tabelas `modulos` e `aulas` usam a RPC `tem_acesso_curso()` no RLS para que o aluno via API Supabase só consiga ler dados de aulas caso tenha a matrícula ativa.
- **Logs:** 
  Tabelas de log como `logs_transacoes` só podem ser lidas por `is_staff = true` ou `is_admin = true`.

---

## Orientações para Atualizar o Schema Futuramente

> [!WARNING]
> Quando precisar modificar o schema (adicionar tabelas ou colunas):
> 1. **Não** altere diretamente no Dashboard do Supabase (interface gráfica) sem guardar registro.
> 2. **Sempre** crie um arquivo de script SQL (ex: `patch_vX.sql`) na raiz do repositório contendo os comandos `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`.
> 3. Atualize este documento (`SCHEMA_ATUALIZACAO_GUIDE.md`) para refletir o novo domínio criado.
> 4. As permissões RLS novas devem sempre testar duas coisas: o papel do admin (via `public.is_admin()`) e o isolamento do próprio usuário corrente (`auth.uid() = usuario_id`).
