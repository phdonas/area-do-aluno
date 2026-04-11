# CLAUDE.md — Área do Aluno PHDonassolo v5.2

## Projeto
Plataforma de ensino do Prof. Paulo Henrique Donassolo
URL: alunos.phdonassolo.com | Site referência visual: phdonassolo.com

## Stack
- Frontend: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- Backend/BaaS: Supabase (PostgreSQL + Auth + Storage + pgvector)
- Pagamentos: Mercado Pago (Checkout Pro + Assinaturas Preapproval)
- IA Ferramentas simples: claude-haiku-4-5 | IA Simuladores: claude-sonnet-4-6
- Deploy: Vercel (automático via GitHub push) | E-mail: AWS SES
- Leads: Google Sheets via Service Account

## Módulos do Projeto
M1: Auth e Perfil | M2: Catálogo + Player + Trilhas | M3: Materiais + Simuladores HTML
M4: Pagamentos + Planos + Convites + Certificados | M5: Quiz e Avaliações
M6: Dashboard Admin | M7: Comunidade | M8: E-mails + CRON | M9: Ferramentas SaaS
M10: Simuladores Roleplay IA | M11: Coach IA 24/7 (pós-60d) | M12: Diagnóstico (pós-60d)

## ══ REGRAS ABSOLUTAS ══

### Segurança — P1 CRÍTICO (implementar antes de qualquer código)
- Rate limiting APENAS em /api/* — NUNCA em rotas de páginas, assets, CSS ou JS
- /admin/login deve ficar FORA do Route Group (protected) para evitar loop infinito
  Estrutura correta: /app/(auth)/login | /app/(protected)/admin/...
- Slugs são SEMPRE ASCII lowercase sem acentos e sem caracteres especiais
- Validar senha em TODO endpoint de autenticação
- NUNCA expor ANTHROPIC_API_KEY no frontend — sempre via /api/
- Verificar vencimento do plano em TODA rota protegida de conteúdo

### Identidade visual e código
- NUNCA hardcodar cores — sempre lib/design-tokens.ts
- NUNCA hardcodar pilares — sempre buscar da tabela pilares
- Mobile-first: componente funciona em 375px antes de desktop
- Simuladores HTML ficam no HostGator — link protegido com token PHP
- PDFs exclusivos: Supabase Storage com signed URLs de 60min

### Glossário — USAR SEMPRE ESTES TERMOS
- Módulo = agrupamento de aulas. NUNCA 'seção', 'unidade' ou 'capítulo'
- Ferramenta = tool SaaS com output direto (formulário→texto)
- Simulador = roleplay conversacional multi-turno
- Biblioteca = tabelas modulos/aulas com curso_id NULL

## Variáveis de Ambiente (.env.local)
NEXT_PUBLIC_SUPABASE_URL= 
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= 
NEXT_PUBLIC_MP_PUBLIC_KEY=
MP_ACCESS_TOKEN= 
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SITE_URL=https://alunos.phdonassolo.com
AWS_SES_REGION=us-east-1 
AWS_ACCESS_KEY_ID= 
AWS_SECRET_ACCESS_KEY=
SIMULADOR_TOKEN_SECRET=
GOOGLE_SHEETS_LEADS_ID=
GOOGLE_SERVICE_ACCOUNT_KEY=
