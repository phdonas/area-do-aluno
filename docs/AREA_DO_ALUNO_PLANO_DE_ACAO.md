# Plano de Ação: Gaps e Melhorias (Área do Aluno)

Durante o processo de *hard audit* estrutural do banco de dados, rotas e arquitetura da Área do Aluno, identificamos alguns pontos de atenção (débitos técnicos e oportunidades de melhoria) que foram mapeados e estão sendo endereçados nas iterações de desenvolvimento.

---

## 1. Segurança de Rotas (Next.js 16 Proxy) —— ✅ [CONCLUÍDO]
> [!NOTE]
> **Status:** Concluído com sucesso em 30/05/2026.
> **Ação Realizada:** 
> - Validamos e mantivemos o proxy global nativo do Next.js 16 (`src/proxy.ts`) na raiz do projeto, removendo o arquivo conflitante `src/middleware.ts` para deixar em execução exclusiva a arquitetura moderna de rotas do framework.
> - Protegemos de forma robusta e centralizada no servidor todas as rotas restritas de alunos (`/dashboard`, `/player`, `/simuladores`, `/ferramentas`, `/meus-certificados`, `/insights`, `/questionarios`, `/definir-senha`) e a área `/admin`.
> - Adicionamos validações automatizadas de usuários com contas suspensas (status `bloqueado`), verificação dinâmica de vigência de matrículas (`assinaturas` ativas) e troca de senha obrigatória diretamente na borda.
> - Limpamos os redirecionamentos client-side do arquivo `src/app/(protected)/layout.tsx`, eliminando qualquer lentidão e flashes em branco durante o carregamento de páginas.

---

## 2. Roteiro de Tutoriais (Manual do Aluno) —— ✅ [CONCLUÍDO]
> [!NOTE]
> **Status:** Concluído com sucesso em 30/05/2026.
> **Ação Realizada:**
> - Instalamos e integramos a biblioteca de onboarding interativo `react-joyride` de forma totalmente compatível com a plataforma.
> - Criamos a Server Action `registrarTutorialConcluido` no arquivo `src/providers/tutorial-actions.ts` para persistir o progresso do onboarding no banco e bonificar o aluno com **+20 PHD Coins** por gamificação.
> - Desenvolvemos o `TutorialProvider.tsx` que centraliza as etapas guiadas nas principais páginas da plataforma (`/vitrine`, `/catalogo`, `/dashboard`, `/player`, `/onboarding`, `/simuladores`) com base no roteiro conceitual oficial e em um design Dark Slate premium perfeitamente integrado.
> - Injetamos os seletores CSS (`id="tutorial-..."`) nos principais componentes da UI para ancoragem perfeita de cada etapa flutuante.
> - Registramos a migration SQL na pasta `src/sql/add_tutorial_flag.sql` para que o administrador possa rodar o script no Supabase SQL Editor.

---

## 3. Gestão Multimoedas (Schema vs Frontend) —— ⏳ [A SEGUIR]
> [!TIP]
> **Gap Identificado:** O banco possui suporte a multimoedas e os campos já estão no Admin UI. Falta a instalação do SDK do Stripe (`npm install stripe`), o desenvolvimento da API de sessions baseada na geolocalização e as rotas de webhook do Stripe.
> **Ação Proposta:** Revisar o endpoint `/api/pagamentos/criar-preferencia` e desenvolver `/api/pagamentos/stripe/criar-sessao` para assegurar que a moeda e cobrança reflitam dinamicamente o país selecionado.

---

## 4. Limpeza de Arquivos e Compatibilidade Legada —— ⏳ [A SEGUIR]
> [!CAUTION]
> **Gap Identificado:** A tabela `usuarios` está operando simultaneamente com uma view `profiles` para retrocompatibilidade.
> **Ação Proposta:** Fazer uma varredura (Search & Replace global) substituindo gradativamente as chamadas de `.from('profiles')` para `.from('usuarios')` nos Server Actions e APIs, permitindo a exclusão segura da View `profiles` no futuro, reduzindo a complexidade do banco.

---
*Documento atualizado em 30/05/2026 após a entrega completa das Fases 1 e 2.*
