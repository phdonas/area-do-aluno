# 🔍 Relatório de Auditoria Técnica: Baseline v5.2

Este relatório detalha a conformidade do projeto **Área do Aluno (PH Donassolo)** em relação aos requisitos técnicos e de negócio do **Blueprint v5.2**.

---

## 📊 Resumo de Conformidade (Audit A1-A22)

| ID | Requisito Relevante | Status | Observação Técnica |
| :--- | :--- | :---: | :--- |
| **A1** | Rota de Cadastro (`/cadastro`) | ✅ | Implementada em `src/app/(auth)/cadastro` |
| **A2** | Integração Supabase Auth | ✅ | `cadastrarUsuario` via `supabase.auth.signUp` |
| **A3** | Trigger Automática (Profiles) | ✅ | Função `handle_new_user` no `public.usuarios` |
| **A4** | Fluxo de Confirmação/Token | 🚫 | **BUG CRÍTICO:** Rota de cadastro lê tabela errada (`convites`) |
| **A5** | Troca de Senha Obrigatória | ❌ | Lógica de `needs_password_change` ausente e `false` por padrão |
| **A6** | Middleware de Proteção | ❌ | Arquivo `middleware.ts` não existe no projeto |
| **A7** | Tabela de Convites | ✅ | Implementada como `public.convites_matricula` |
| **A8** | Rota `/cadastro?token=[x]` | ✅ | Lógica presente, mas afetada pelo bug da tabela |
| **A9** | API Criação Parcela MP | ✅ | Implementada via `mercadopago` SDK |
| **A10** | Webhook Mercado Pago | ✅ | Implementado com tratamento de idempotência |
| **A11** | Automação de Matrícula | ✅ | Webhook cria assinaturas e convites corretamente |
| **A12** | E-mail via AWS SES | ⚠️ | **DIVERGÊNCIA:** Projeto usa **Resend** em vez de AWS SES |
| **A13** | Cupom de Desconto | ✅ | Implementado no Checkout e Webhook |
| **A14** | Página `/checkout/sucesso` | ✅ | Implementada com redirecionamento ao Dashboard |
| **A15** | Ordenação do Dashboard | ✅ | Cursos matriculados aparecem no topo |
| **A16** | Seção "Vitrine" | ✅ | Implementada (Cursos não matriculados) |
| **A17** | Seção "Cursos Grátis" | ⚠️ | Lógica `is_free` no código, pendente validação UI |
| **A18** | Continuar de onde parou | ✅ | Baseado em `progresso_aulas.updated_at` |
| **A19** | Barra de Progresso | ✅ | Implementada por curso |
| **A20** | Admin: Importação CSV | ✅ | Implementada em `ConvitesAdminPage` |
| **A21** | Matrícula Manual (Origem) | ✅ | Modal de convite possui campo `origem` |
| **A22** | E-mail Boas-vindas | ✅ | Disparado via `enviarEmailComunicacao` |

---

## 🚨 Gaps e Problemas Críticos

### 1. Bug no Sistema de Convites (Impacto: Bloqueante para Vendas)
O arquivo `src/app/(auth)/cadastro/page.tsx` está tentando buscar dados da tabela `public.convites`, que não existe (o nome correto é `convites_matricula`). Além disso, o código usa campos como `status` e `expires_at`, que não constam no esquema atual da tabela.
- **Efeito:** Clientes vindos do checkout ou de convites manuais não conseguem concluir o cadastro.

### 2. Infraestrutura de E-mail (Impacto: Arquitetura)
O Blueprint exige o uso de **AWS SES** para garantir alta entregabilidade em envios em massa. O projeto atual está configurado com **Resend**.
- **Decisão Necessária:** Manter Resend ou migrar para AWS SES conforme o Blueprint.

### 3. Segurança e Middleware (Impacto: Segurança)
A ausência de um `middleware.ts` centralizado torna a aplicação vulnerável a bypasses de rotas protegidas se não houver checks rigorosos em cada página/action. O requisito v5.2 exige proteção nativa via middleware.

### 4. Fluxo de Boas-Vindas e Senha (Impacto: UX)
Não existe a lógica de "Troca de senha obrigatória" no primeiro acesso para convites manuais (onde o admin define uma senha temporária em `InviteModal`).

---

## 🛡️ Auditoria de Blindagem RLS (Row-Level Security)

Conforme solicitado, mantemos o protocolo de auditoria para todas as tabelas:

| Tabela | RLS Ativo? | Política Principal | Status |
| :--- | :---: | :--- | :--- |
| `usuarios` | Sim | Admin: ALL / Owner: SELECT/UPDATE | ✅ |
| `cursos` | Sim | Todos: SELECT (if status=publicado) / Admin: ALL | ✅ |
| `modulos` | Sim | Todos: SELECT / Admin: ALL | ✅ |
| `aulas` | Sim | Todos: SELECT / Admin: ALL | ✅ |
| `assinaturas` | Sim | Admin: ALL / Owner: SELECT | ✅ |
| `progresso_aulas`| Sim | Admin: ALL / Owner: ALL | ✅ |
| `convites_matricula`| Sim | Admin: ALL | ✅ |
| `logs_matriculas` | Sim | Admin: ALL | ✅ |
| `configuracoes_checkout`| Sim | Admin: ALL / Public: SELECT | ✅ |

---

## 📋 Próximos Passos Sugeridos

1. **Corrigir o Cadastro:** Atualizar a query em `cadastro/page.tsx` para usar a tabela e colunas corretas.
2. **Implementar Middleware:** Criar `middleware.ts` para gerenciar sessões e redirecionamentos centralizados.
3. **Ajuste AWS SES:** Migrar a lib de e-mail de Resend para AWS SES.
4. **Fluxo de Ativação:** Implementar a troca de senha obrigatória no primeiro login.
5. **Deduplicação Nativa (DB):** Corrigir a RPC `get_modulos_curso` para usar `DISTINCT` ou `JOIN` em vez de `UNION ALL`, eliminando a necessidade de deduplicação manual no frontend.
6. **Revisão checkout:** Ativar cronograma dinâmico no checkout.

---
*Auditoria realizada por Antigravity AI em 16/04/2026.*
