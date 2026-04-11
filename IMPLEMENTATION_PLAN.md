# Plano de Implementação — Fluxo de Venda e Matrícula (v5.2)

## 📋 Introdução
Este plano detalha as tarefas necessárias para transformar os mocks atuais em um sistema funcional de venda, cadastro e matrícula automática, seguindo as diretrizes do Blueprint v5.2.

---

## 🛠️ Fase 1: Fundação de Dados e Segurança (P1)
**Objetivo**: Preparar o banco de dados e garantir a segurança das rotas.

| Tarefa | Arquivos Afetados | Complexidade | Risco |
| :--- | :--- | :---: | :--- |
| **1.1 Criar tabela `convites`** | `supabase_schema.sql` | Baixa | Baixo |
| **1.2 Criar tabela `cupons`** | `supabase_schema.sql` | Baixa | Baixo |
| **1.3 Criar tabela `logs_matriculas`** | `supabase_schema.sql` (Audit Log) | Baixa | Baixo |
| **1.4 Implementar `middleware.ts`** | `src/middleware.ts` (novo) | Média | **Alto** |
| **1.5 Trigger de Boas-vindas (Draft)** | Supabase Functions/Triggers | Média | Baixo |

---

## 🔐 Fase 2: Fluxos de Acesso e Cadastro (P2)
**Objetivo**: Permitir que novos alunos e convidados entrem na plataforma.

| Tarefa | Arquivos Afetados | Complexidade | Risco |
| :--- | :--- | :---: | :--- |
| **2.1 Rota `/cadastro` (UI)** | `src/app/(auth)/cadastro/page.tsx` | Média | Baixo |
| **2.2 Lógica de Token de Convite** | `src/app/(auth)/cadastro/page.tsx`, `actions.ts` | Alta | Médio (Validação de Expiração/Status) |
| **2.3 Troca de Senha Obrigatória** | `src/app/(auth)/trocar-senha/page.tsx`, `middleware.ts` | Alta | Médio |

---

## 💰 Fase 3: Checkout e Mercado Pago (P2)
**Objetivo**: Automatizar a venda e liberação de cursos.

| Tarefa | Arquivos Afetados | Complexidade | Risco |
| :--- | :--- | :---: | :--- |
| **3.1 API Criar Preferência** | `.../api/pagamentos/criar-preferencia/route.ts` | Alta | Médio |
| **3.2 API Webhook Mercado Pago** | `.../api/webhooks/mercadopago/route.ts` | Alta | **Crítico** |
| **3.3 Validação de Cupons** | `src/app/api/cupons/validar/route.ts` | Média | Baixo |
| **3.4 Registro de Log (Webhook)** | Inserção em `logs_matriculas` | Baixa | Baixo |

---

## ⚙️ Fase 4: Administração e Dashboard (P2/P3)
**Objetivo**: Dar ferramentas ao professor e melhorar o UX do aluno.

| Tarefa | Arquivos Afetados | Complexidade | Risco |
| :--- | :--- | :---: | :--- |
| **4.1 Gestão de Convites (/admin)** | `src/app/(protected)/admin/convites/page.tsx` | Alta | Médio |
| **4.2 Dashboard: Seção Grátis** | `src/app/(protected)/dashboard/page.tsx` | Baixa | Baixo |
| **4.3 Dashboard: Contextualização** | `src/app/(protected)/dashboard/page.tsx` | Baixa | Baixo |
| **4.4 Registro de Log (Manual)** | Registro em `logs_matriculas` no Admin | Baixa | Baixo |

---

## 🧪 Estratégia de Rollback e Validação
1.  **Backup SQL**: Antes de aplicar novos schemas, gerar dump das tabelas `usuarios` e `assinaturas`.
2.  **Sandbox**: Todo o fluxo de Mercado Pago será testado em ambiente Sandbox antes de ir para produção.
3.  **Logs**: Implementação de logs detalhados em `/api/webhooks` para rastrear qualquer falha na matrícula.

---

### **Aprovação Solicitada**
Professor, este plano segue a ordem de prioridade P1 -> P4 do Blueprint. Podemos prosseguir com a **Fase 1 (Banco de Dados e Middleware)**?
