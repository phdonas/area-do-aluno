# Blueprint da Arquitetura e Estrutura (Área do Aluno V6)

Este documento reflete **estritamente o que está implementado** no código-fonte atual do projeto `area-do-aluno`. O Blueprint antigo foi descartado, e este serve como a referência absoluta da arquitetura real.

## 1. Stack Tecnológico Atual
- **Framework:** Next.js 15 (App Router).
- **Linguagem:** TypeScript.
- **Estilização:** Tailwind CSS + shadcn/ui (visível pela presença do globals.css, theme-toggles e design system customizado).
- **Banco e Auth:** Supabase (PostgreSQL).
- **Pagamentos:** Integração via Webhooks (MercadoPago/Stripe identificados em `/api/webhooks`).

## 2. Estrutura de Roteamento (Next.js App Router)

A aplicação utiliza Route Groups para segmentar o layout e a proteção das páginas. Todo o front-end está concentrado no diretório `src/app/`.

### 2.1. Grupo Público e Vitrine
Não requerem autenticação (acesso aberto ou restrito a visitantes/leads).
- **`/vitrine`**: Página de captura/apresentação de cursos e materiais (Top of Funnel).
- **`/(auth)`**:
  - `/login`: Autenticação principal.
  - `/cadastro`: Criação de conta.
  - `/esqueci-senha`, `/trocar-senha`, `/definir-senha`: Fluxos de recuperação de acesso.
- **`/verificar-certificado/[codigo]`**: Rota pública para validação de certificados emitidos sem necessidade de login.
- **`/checkout/sucesso`**: Página de pós-venda.

### 2.2. Grupo Protegido (`/(protected)`)
Toda essa árvore compartilha o `layout.tsx` protegido, que força o login e verifica os papéis (`is_admin`, `is_staff`, `senha_temporaria`, `status='bloqueado'`).

#### A) Visão do Aluno
Onde ocorre o consumo do conteúdo:
- **`/dashboard`**: Central do aluno (progresso, cursos recentes, gamificação).
- **`/onboarding/perfil-profissional`**: Fluxo de primeiro acesso/completar perfil (Momento 2).
- **`/perfil`**: Gestão da conta do aluno.
- **`/loja` & `/catalogo`**:
  - `/catalogo/[cursoId]` e `/catalogo/pacote/[pacoteId]`: Visualização de produtos para compra ou acesso.
  - `/loja/curso/[cursoId]`, `/loja/pacote/[pacoteId]`: Fluxo de transação in-app.
- **`/checkout/[id]`**: Tela de pagamento/upsell para usuários logados.
- **`/player`**: 
  - `/player/[cursoId]` e `/player/[cursoId]/[aulaId]`: Consumo de vídeo/aulas.
  - `/player/preview`: Modo de demonstração ou amostra grátis.
- **`/questionarios/[id]`**: Motor de provas e testes de múltipla escolha.
- **`/simuladores/[id]` & `/simuladores/external`**: Interações práticas e integrações com IA.
- **`/meus-certificados/[emitidoId]`**: Visualização de certificados ganhos.
- **`/insights`**: Visão de métricas pessoais/comentários.

#### B) Visão do Administrador (`/admin`)
Painel de controle CRUD exclusivo para staff/admins.
- **CRM e Vendas:** `/admin/alunos`, `/admin/financeiro`, `/admin/cupons`, `/admin/matriculas`, `/admin/planos`, `/admin/pacotes`.
- **Conteúdo (LMS):** `/admin/cursos`, `/admin/modulos`, `/admin/aulas`, `/admin/professores`, `/admin/pilares`.
- **Avaliações e Prática:** `/admin/questionarios`, `/admin/certificados`, `/admin/recursos`, `/admin/ferramentas`.
- **Sistema:** `/admin/configuracoes`, `/admin/auditoria`, `/admin/telemetria`, `/admin/usuarios`, `/admin/convites`.
*(Nota: Quase todos os módulos admin possuem rotas internas no padrão `novo`, `[id]` e `consulta`).*

## 3. APIs e Webhooks Internos (`/api`)

A comunicação Server-to-Server e as integrações de terceiros estão expostas em:
- **`/api/auth/callback`**: Finalização do OAuth e sessões do Supabase.
- **`/api/pagamentos/criar-preferencia`**: Endpoint para instanciar checkouts via provedor.
- **`/api/cupons/validar`**: Validação server-side de descontos.
- **`/api/webhooks/mercadopago`**: Escuta assíncrona de eventos de pagamento (cria matrículas, atualiza logs).
- **`/api/webhooks/admin-notify`**: Notificações internas.
- **`/api/cron/notificar-expiracao`**: Tarefas agendadas (CRON) para enviar e-mails aos alunos.

## 4. Proteção e Segurança (Arquitetura Atual)

1. **Client-Side (Layout):** A verificação de login ocorre no `useEffect` do `/(protected)/layout.tsx`. Se o aluno tentar acessar o painel deslogado, é redirecionado pelo layout para `/login`. Bloqueios e reset obrigatório de senha também ocorrem aqui.
2. **Server-Side (RLS):** Como visto no *Schema Guide*, o banco de dados tem Row Level Security ativo, impedindo que requisições forjadas via cliente busquem aulas ou cursos que o usuário não tem direito, garantindo a segunda (e mais importante) camada de segurança.
3. **Mecânica "Super Admin" Fallback:** O código prevê redundância de segurança definindo emails estáticos em `SUPER_ADMINS` no layout, garantindo que o dono do sistema nunca perca o acesso ao painel, mesmo em falhas de propagação de `is_admin`.

> [!TIP]
> A ausência de um arquivo `middleware.ts` global indica que a aplicação optou por tratar o redirecionamento (auth guards) ao nível de Layout e Componentes Cliente. Essa é uma escolha arquitetural válida no Next.js App Router (usualmente com Server Components verificando sessões), mas requer cuidado especial em não expor dados sensíveis nos Server Components desprotegidos.
