# ÁREA DO ALUNO PHDonassolo — Guia de Implementação V1
## Documento para o Dev (Antigravity)

> **Projeto:** alunos.phdonassolo.com  
> **Stack confirmado:** Next.js 15 + TypeScript + Supabase + Vercel + Mercado Pago + AWS SES + Claude API  
> **Blueprint de referência:** v5.1  
> **Relatório de análise:** v3.0 (12/04/2026)  
> **Status atual:** Implementação em andamento — localhost  

---

## ÍNDICE

1. [Contexto e Decisões de Arquitetura](#1-contexto-e-decisões-de-arquitetura)
2. [Correções Imediatas — P0](#2-correções-imediatas--p0)
3. [Schema: Mudanças no Banco de Dados](#3-schema-mudanças-no-banco-de-dados)
4. [Novo Papel: Visitante](#4-novo-papel-visitante)
5. [Fluxo Completo do Visitante](#5-fluxo-completo-do-visitante)
6. [Vitrine — Rota /vitrine](#6-vitrine--rota-vitrine)
7. [Perfil Expandido — Momento 2](#7-perfil-expandido--momento-2)
8. [PDI — Plano de Desenvolvimento Individual](#8-pdi--plano-de-desenvolvimento-individual)
9. [PHD Coins — Gamificação](#9-phd-coins--gamificação)
10. [Engajamento de Progresso](#10-engajamento-de-progresso)
11. [Diagnóstico Estático — Trilha por Cargo](#11-diagnóstico-estático--trilha-por-cargo)
12. [Crossell e Upsell Antecipados](#12-crossell-e-upsell-antecipados)
13. [Feedback Assíncrono do Professor](#13-feedback-assíncrono-do-professor)
14. [Comunidade V1 — Base Estrutural](#14-comunidade-v1--base-estrutural)
15. [Middleware e Proteção de Rotas](#15-middleware-e-proteção-de-rotas)
16. [Configurações de Ambiente — Pré-Deploy Vercel](#16-configurações-de-ambiente--pré-deploy-vercel)
17. [Checklist de Validação V1](#17-checklist-de-validação-v1)
18. [Plano de Sessões por Semana](#18-plano-de-sessões-por-semana)

---

## 1. Contexto e Decisões de Arquitetura

### Decisões Confirmadas — Não Reabrir

| Decisão | Justificativa |
|---|---|
| **Plyr** em vez de YouTube IFrame API nativo | UX superior em mobile + elimina sugestões de vídeos concorrentes ao final da aula |
| **AWS SES + Resend** | Resend é superior para e-mails transacionais de desenvolvimento; SES para produção |
| **Simuladores como links externos** | HTML no HostGator ou Excel no Google Drive — a plataforma apenas protege o link com `tem_acesso_curso()` |
| **YouTube unlisted** para vídeos das aulas | Gratuito, confiável, sem custo de hospedagem de vídeo |
| **Testar local primeiro** | Zero custo de bug em localhost; migrar para Vercel Preview quando os 3 fluxos de matrícula estiverem funcionando end-to-end |

### Stack Final

```
Frontend:    Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
Backend:     Supabase (PostgreSQL + Auth + Storage + RLS + pgvector)
Pagamentos:  Mercado Pago (Checkout Pro + Webhook)
E-mail:      AWS SES (produção) + Resend (dev)
IA:          claude-haiku-4-5 (ferramentas simples) | claude-sonnet-4-6 (simuladores)
Deploy:      Vercel (automático via GitHub push)
Leads:       Google Sheets via Service Account
Player:      Plyr (wrapper YouTube IFrame)
```

### Glossário — Termos Fixos no Código e na UI

| Termo correto | Nunca usar |
|---|---|
| **Módulo** | Seção, Unidade, Capítulo |
| **Ferramenta** | Tool, Widget |
| **Simulador** | Roleplay, Chatbot |
| **PDI** | ADI (nome antigo) |
| **Visitante** | Explorador, Prospect, Lead |
| **PHD Coins** | Stars, Pontos, Créditos |

---

## 2. Correções Imediatas — P0

> ⚠️ **Estas duas correções devem ser feitas ANTES de qualquer outra implementação.**

### 2.1 Bug: Tabela `convites` → `convites_matricula`

**Arquivo:** `src/app/(auth)/cadastro/actions.ts`

**Problema:** A Server Action `cadastrarUsuario` referencia a tabela legada `convites`. O banco e o webhook usam `convites_matricula`.

**Impacto:** 100% dos cadastros via token (Fluxo 2 — ex-alunos Udemy, presenciais) falham silenciosamente.

**Correção:**
```typescript
// ANTES (errado)
const { data } = await supabase
  .from('convites')  // ← tabela legada
  .select('*')
  .eq('token', token)
  .eq('status', 'pendente')

// DEPOIS (correto)
const { data } = await supabase
  .from('convites_matricula')  // ← tabela correta
  .select('*')
  .eq('token', token)
  .eq('status', 'pendente')
```

Verificar também: todas as queries de status (`pendente`/`aceito`/`expirado`) que referenciem `convites` na mesma action.

### 2.2 Validação: seekTo e Salvamento de Posição no Plyr

**Arquivo:** Componente do player (localizar no projeto)

**O que testar:**
1. Criar uma aula de teste com YouTube ID válido
2. Assistir até a posição 2:30
3. Navegar para fora da aula
4. Retornar para a mesma aula
5. ✅ Esperado: player inicia em 2:30
6. Verificar no Supabase: `progresso_aulas.posicao_s` está sendo atualizado a cada ~30s durante a reprodução

**O que o código deve ter:**
```typescript
// Ao carregar a aula — buscar posição salva
const posicaoSalva = progresso?.posicao_s ?? 0
player.currentTime = posicaoSalva  // ou player.seek(posicaoSalva)

// Durante reprodução — salvar posição a cada 30s
const interval = setInterval(async () => {
  await supabase
    .from('progresso_aulas')
    .upsert({ 
      user_id: userId, 
      aula_id: aulaId, 
      posicao_s: Math.floor(player.currentTime) 
    })
}, 30000)
```

---

## 3. Schema: Mudanças no Banco de Dados

> Execute no Supabase SQL Editor. Adicionar ao schema mestre do projeto.

### 3.1 Alterações em Tabelas Existentes

```sql
-- profiles: novo papel + novos campos
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_papel_check;

ALTER TABLE profiles 
  ADD CONSTRAINT profiles_papel_check 
  CHECK (papel IN ('aluno', 'admin', 'staff', 'visitante'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  notificacao_horario_preferido TIME;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  streak_dias INT DEFAULT 0;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  phd_coins_total INT DEFAULT 0;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  phd_nivel INT DEFAULT 1;

-- Campos de perfil expandido (Momento 2)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS segmento_mercado TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tamanho_empresa TEXT 
  CHECK (tamanho_empresa IN ('1-10', '11-50', '51-200', '201-500', '500+'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experiencia_anos INT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT; -- CPF/NIF obrigatório no Momento 2
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone TEXT;  -- Obrigatório no Momento 2
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS endereco JSONB; -- Opcional: {cep, cidade, estado, pais}
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS perfil_completo_momento2 BOOLEAN DEFAULT FALSE;

-- cursos e materiais: campo para vitrine
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS destaque_vitrine BOOLEAN DEFAULT FALSE;
ALTER TABLE materiais ADD COLUMN IF NOT EXISTS destaque_vitrine BOOLEAN DEFAULT FALSE;

-- metas_aluno: campo de status para checkin PDI
ALTER TABLE metas_aluno ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativa'
  CHECK (status IN ('ativa', 'avancando', 'estagnada', 'concluida'));
ALTER TABLE metas_aluno ADD COLUMN IF NOT EXISTS ultima_atualizacao TIMESTAMPTZ;
ALTER TABLE metas_aluno ADD COLUMN IF NOT EXISTS semanas_estagnada INT DEFAULT 0;

-- quiz_respostas: feedback do professor
ALTER TABLE quiz_respostas ADD COLUMN IF NOT EXISTS feedback_professor TEXT;
ALTER TABLE quiz_respostas ADD COLUMN IF NOT EXISTS feedback_em TIMESTAMPTZ;

-- notas_aluno: feedback do professor em reflexões
ALTER TABLE notas_aluno ADD COLUMN IF NOT EXISTS feedback_professor TEXT;
ALTER TABLE notas_aluno ADD COLUMN IF NOT EXISTS feedback_em TIMESTAMPTZ;
```

### 3.2 Novas Tabelas

```sql
-- PHD Coins: log imutável de transações
CREATE TABLE IF NOT EXISTS phd_coins_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  evento TEXT NOT NULL,
  coins INT NOT NULL,
  referencia_id UUID, -- id do objeto relacionado (aula_id, curso_id etc)
  referencia_tipo TEXT, -- 'aula', 'curso', 'quiz', 'pdi', 'indicacao'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges conquistados por aluno
CREATE TABLE IF NOT EXISTS badges_aluno (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL, -- 'primeiros_passos', 'semana_perfeita', etc
  badge_nome TEXT NOT NULL,
  conquistado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

-- Leads de nutrição: visitantes que baixaram material
CREATE TABLE IF NOT EXISTS leads_nurturing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materiais(id),
  canal TEXT DEFAULT 'vitrine',
  email_enviado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diagnósticos de trilha (V1 estático, V2 IA)
-- Tabela já existe no Blueprint v5.1 — verificar campos
-- Se não existir:
CREATE TABLE IF NOT EXISTS diagnosticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES cursos(id),
  tipo TEXT DEFAULT 'estatico' CHECK (tipo IN ('estatico', 'ia')),
  perfil_resultado JSONB,
  trilha_recomendada TEXT,
  regra_aplicada TEXT, -- para tipo='estatico': qual regra cargo+pilar foi usada
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regras de trilha estática (admin configura)
CREATE TABLE IF NOT EXISTS trilhas_estaticas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cargo TEXT, -- pode ser NULL = qualquer cargo
  pilar_slug TEXT, -- pode ser NULL = qualquer pilar
  segmento TEXT, -- pode ser NULL = qualquer segmento
  trilha_descricao TEXT NOT NULL,
  cursos_sugeridos UUID[], -- array de curso_ids em ordem
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Triggers

```sql
-- Trigger: atualizar phd_coins_total e phd_nivel após insert em phd_coins_log
CREATE OR REPLACE FUNCTION atualizar_coins_e_nivel()
RETURNS TRIGGER AS $$
DECLARE
  novo_total INT;
  novo_nivel INT;
BEGIN
  SELECT COALESCE(SUM(coins), 0) INTO novo_total
  FROM phd_coins_log WHERE user_id = NEW.user_id;

  -- Calcular nível
  novo_nivel := CASE
    WHEN novo_total >= 10000 THEN 5
    WHEN novo_total >= 4000  THEN 4
    WHEN novo_total >= 1500  THEN 3
    WHEN novo_total >= 1000  THEN 2
    ELSE 1
  END;

  UPDATE profiles 
  SET phd_coins_total = novo_total, phd_nivel = novo_nivel
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_coins ON phd_coins_log;
CREATE TRIGGER trigger_atualizar_coins
  AFTER INSERT ON phd_coins_log
  FOR EACH ROW EXECUTE FUNCTION atualizar_coins_e_nivel();

-- Trigger: conceder coins ao concluir aula
CREATE OR REPLACE FUNCTION coins_ao_concluir_aula()
RETURNS TRIGGER AS $$
BEGIN
  -- Primeira aula concluída
  IF NEW.concluida = TRUE AND OLD.concluida = FALSE THEN
    IF NOT EXISTS (
      SELECT 1 FROM progresso_aulas 
      WHERE user_id = NEW.user_id AND concluida = TRUE AND aula_id != NEW.aula_id
    ) THEN
      INSERT INTO phd_coins_log (user_id, evento, coins, referencia_id, referencia_tipo)
      VALUES (NEW.user_id, 'primeira_aula', 10, NEW.aula_id, 'aula');
      
      INSERT INTO badges_aluno (user_id, badge_key, badge_nome)
      VALUES (NEW.user_id, 'primeiros_passos', 'Primeiros Passos')
      ON CONFLICT DO NOTHING;
    ELSE
      INSERT INTO phd_coins_log (user_id, evento, coins, referencia_id, referencia_tipo)
      VALUES (NEW.user_id, 'aula_concluida', 5, NEW.aula_id, 'aula');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_coins_aula ON progresso_aulas;
CREATE TRIGGER trigger_coins_aula
  AFTER UPDATE ON progresso_aulas
  FOR EACH ROW EXECUTE FUNCTION coins_ao_concluir_aula();
```

### 3.4 RLS para Novas Tabelas

```sql
ALTER TABLE phd_coins_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuario_ve_proprios_coins" ON phd_coins_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sistema_insere_coins" ON phd_coins_log
  FOR INSERT WITH CHECK (TRUE); -- inserções via service role / triggers

ALTER TABLE badges_aluno ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuario_ve_proprios_badges" ON badges_aluno
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE leads_nurturing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_ve_todos_leads" ON leads_nurturing
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND papel = 'admin')
  );
CREATE POLICY "usuario_ve_proprio_nurturing" ON leads_nurturing
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuario_ve_proprio_diagnostico" ON diagnosticos
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE trilhas_estaticas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "todos_leem_trilhas_ativas" ON trilhas_estaticas
  FOR SELECT USING (ativo = TRUE);
CREATE POLICY "admin_gerencia_trilhas" ON trilhas_estaticas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND papel IN ('admin', 'staff'))
  );
```

---

## 4. Novo Papel: Visitante

### 4.1 Lógica de Papel no Sistema

| Papel | Rota de Entrada | Rota Principal | Pode Comprar? | Vira Aluno? |
|---|---|---|---|---|
| `visitante` | /vitrine | /vitrine | ✅ Sim | Automaticamente ao pagar |
| `aluno` | /dashboard | /dashboard | ✅ Sim | Já é aluno |
| `staff` | /admin | /admin | ❌ | Não |
| `admin` | /admin | /admin | ❌ | Não |

### 4.2 Upgrade Automático no Webhook

```typescript
// Em /api/webhooks/mercadopago/route.ts
// Após criar a matrícula, verificar se o perfil é visitante e fazer upgrade

const { data: profile } = await supabase
  .from('profiles')
  .select('papel')
  .eq('id', userId)
  .single()

if (profile?.papel === 'visitante') {
  await supabase
    .from('profiles')
    .update({ papel: 'aluno' })
    .eq('id', userId)
}
```

---

## 5. Fluxo Completo do Visitante

### 5.1 Diagrama do Fluxo

```
phdonassolo.com
    │
    ▼ clica em "Área do Aluno"
    │
alunos.phdonassolo.com
    │
    ├── [não logado] → /vitrine (página pública de apresentação)
    │                   └── CTA "Criar conta"
    │                         ↓
    │                   /cadastro (nome, e-mail, senha, LGPD)
    │                         ↓
    │                   Supabase cria user + profile com papel='visitante'
    │                         ↓
    │                   E-mail de confirmação (AWS SES)
    │                         ↓
    │                   Clica no link → troca de senha obrigatória
    │                         ↓
    │                   Middleware detecta papel='visitante' → redirect /vitrine
    │                         ↓
    │                   [VITRINE AUTENTICADA]
    │                         ├── Clica em "Baixar material" → entrega + leads_nurturing
    │                         └── Clica em "Comprar curso" → checkout MP
    │                                   ↓ webhook aprovado
    │                             papel='aluno' + matrícula criada
    │                                   ↓
    │                             /dashboard (aluno)
    │
    └── [logado como aluno] → /dashboard
    └── [logado como admin/staff] → /admin
```

### 5.2 Middleware: Lógica de Redirecionamento

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Rotas públicas — sempre permitidas
  const publicRoutes = ['/vitrine', '/login', '/cadastro', '/certificados', '/cursos', '/materiais-gratuitos']
  if (publicRoutes.some(r => pathname.startsWith(r))) {
    return res
  }

  // Não logado → login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Buscar papel do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', session.user.id)
    .single()

  const papel = profile?.papel

  // Visitante tentando acessar área do aluno → vitrine
  if (papel === 'visitante' && pathname.startsWith('/aluno')) {
    return NextResponse.redirect(new URL('/vitrine', req.url))
  }

  // Aluno tentando acessar admin → dashboard
  if (papel === 'aluno' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Admin/staff tentando acessar área do aluno → admin
  if ((papel === 'admin' || papel === 'staff') && pathname.startsWith('/aluno')) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

---

## 6. Vitrine — Rota /vitrine

### 6.1 Estrutura da Página

```typescript
// src/app/vitrine/page.tsx
// Rota pública — não requer autenticação
// SSR para SEO

export default async function VitrinePage() {
  // Buscar dados configurados no admin
  const cursos = await getCursosDestaque()      // WHERE destaque_vitrine=TRUE LIMIT 6
  const materiais = await getMateriaisDestaque() // WHERE gratuito=TRUE AND destaque_vitrine=TRUE LIMIT 4
  const config = await getConfigVitrine()        // JSONB de admin/configuracoes

  return (
    <>
      <HeroVitrine config={config} />
      <ConhecaAcademia config={config} />
      <CursosDestaque cursos={cursos} />
      <MateriaisGratuitos materiais={materiais} />
      <ConhecaProfessor config={config} />
    </>
  )
}
```

### 6.2 Queries Necessárias

```typescript
// Cursos em destaque para a vitrine
async function getCursosDestaque() {
  const { data } = await supabase
    .from('cursos')
    .select(`
      id, slug, titulo, thumbnail_url, nivel, carga_horaria_h,
      precos_planos!inner(preco, preco_promo, preco_promo_ate, tipo)
    `)
    .eq('publicado', true)
    .eq('destaque_vitrine', true)
    .order('criado_em', { ascending: false })
    .limit(6)
  return data
}

// Materiais gratuitos em destaque
async function getMateriaisDestaque() {
  const { data } = await supabase
    .from('materiais')
    .select('id, titulo, descricao, tipo, thumbnail_url, categoria')
    .eq('gratuito', true)
    .eq('destaque_vitrine', true)
    .limit(4)
  return data
}
```

### 6.3 Configuração no Admin

Adicionar em `/admin/configuracoes` uma seção "Vitrine":

```typescript
// Campos editáveis:
interface ConfigVitrine {
  hero_headline: string        // ex: "Desenvolva sua equipe comercial de verdade"
  hero_subheadline: string
  hero_cta_texto: string       // ex: "Criar minha conta"
  academia_titulo: string
  academia_descricao: string
  professor_bio_curta: string
  professor_foto_url: string
  professor_livros: string[]   // títulos dos livros
}
// Salvar como JSON em configuracoes WHERE chave='vitrine'
```

### 6.4 Registro de Material Baixado

```typescript
// Ao visitante autenticado clicar em "Baixar material"
async function registrarDownloadVisitante(userId: string, materialId: string) {
  // 1. Registrar na tabela de nurturing
  await supabase.from('leads_nurturing').upsert({
    user_id: userId,
    material_id: materialId,
    canal: 'vitrine'
  })

  // 2. Disparar e-mail de entrega (AWS SES)
  await enviarEmailMaterial(userId, materialId)

  // 3. Retornar URL do material ou link externo
  return getMaterialUrl(materialId)
}
```

---

## 7. Perfil Expandido — Momento 2

### 7.1 Modal Pós-Login (Primeira Vez)

```typescript
// Verificar se o aluno já preencheu o Momento 2
// Campo: profiles.perfil_completo_momento2

// Exibir modal se:
// - usuario está logado
// - perfil_completo_momento2 = FALSE
// - NÃO é rota de troca de senha
```

### 7.2 Campos do Modal

```typescript
interface PerfilMomento2 {
  // Obrigatórios
  cpf_cnpj: string           // CPF (Brasil) ou NIF (Portugal) — validar formato
  telefone: string           // Com WhatsApp flag opcional
  
  // Opcionais (mas incentivados com PHD Coins futuramente)
  segmento_mercado: string   // Select: Distribuidora, Varejo, Serviços, Indústria, B2B, B2C, Outro
  cargo: string              // Select: Diretor, Gerente, Coordenador, Consultor, Empreendedor, Vendedor, Outro
  tamanho_empresa: string    // Select: 1-10, 11-50, 51-200, 201-500, 500+
  experiencia_anos: number   // Slider: 0-30+
  endereco: {                // Opcional
    cep?: string
    cidade?: string
    estado?: string
    pais?: string
  }
}
```

### 7.3 Ao Salvar

```typescript
await supabase.from('profiles').update({
  ...dadosMomento2,
  perfil_completo_momento2: true
}).eq('id', userId)

// Se campos obrigatórios preenchidos: PHD Coins futuramente (V2)
```

---

## 8. PDI — Plano de Desenvolvimento Individual

> **Nota:** O nome correto é **PDI** (Plano de Desenvolvimento Individual), substituindo o nome anterior ADI.

### 8.1 Modal de Metas

- Aparece na primeira abertura de qualquer curso matriculado
- Campo de texto livre para metas (sem limite fixo de quantidade)
- Salvar em `metas_aluno` com `status='ativa'`

### 8.2 CRON de Checkin Semanal

```typescript
// Executar toda segunda-feira
// Verificar alunos com:
// - metas em metas_aluno WHERE status IN ('ativa', 'avancando', 'estagnada')
// - pelo menos uma matrícula ativa

// Para cada aluno elegível:
// 1. Enviar notificação in-app
// 2. Enviar e-mail com as metas listadas
// 3. Link para o modal de checkin

// Modal de checkin — para cada meta:
// Botões: "Avançando" | "Estagnada" | "Concluída"

// Ao marcar:
// - Atualizar metas_aluno.status
// - Atualizar metas_aluno.ultima_atualizacao
// - Se 'estagnada': incrementar semanas_estagnada
// - Se concluída: PHD Coins (15) + sugestão de nova meta
// - Se estagnada >= 3 semanas: e-mail especial com dica por pilar
```

### 8.3 E-mail para Meta Estagnada

```typescript
// Conteúdo do e-mail:
// "Notamos que sua meta '[nome_da_meta]' está marcada como estagnada há [n] semanas.
// Para profissionais de [segmento] com foco em [pilar], uma dica do Prof. Paulo:
// [dica configurada no admin por pilar]"

// Admin configura as dicas por pilar em /admin/configuracoes
```

---

## 9. PHD Coins — Gamificação

### 9.1 Tabela de Eventos e Coins

| Evento | Coins | Badge | Quando disparar |
|---|---|---|---|
| `primeira_aula` | 10 | Primeiros Passos | Trigger em `progresso_aulas` |
| `aula_concluida` | 5 | — | Trigger em `progresso_aulas` |
| `modulo_concluido` | 25 | Módulo Concluído | Calcular ao marcar última aula do módulo |
| `streak_7` | 50 | Semana Perfeita | CRON diário ao detectar 7 dias |
| `streak_30` | 200 | Constância Total | CRON diário ao detectar 30 dias |
| `marco_25` | 30 | — | Trigger ao atingir 25% do curso |
| `marco_50` | 50 | Meio Caminho | Trigger ao atingir 50% |
| `marco_75` | 75 | Reta Final | Trigger ao atingir 75% |
| `curso_concluido` | 150 | Curso Concluído | Ao atingir 100% |
| `quiz_aprovado_1` | 20 | — | Ao aprovar no quiz na 1ª tentativa |
| `quiz_nota_max` | 40 | Domínio Total | Ao tirar 100% no quiz |
| `pdi_checkin` | 15 | — | Ao completar checkin semanal PDI |
| `indicacao_convertida` | 100 | Embaixador | Ao aluno indicado se matricular |

### 9.2 CRON de Streak

```typescript
// Executar todo dia à meia-noite
// Para cada aluno com matrícula ativa:

const hoje = new Date().toDateString()
const ontem = new Date(Date.now() - 86400000).toDateString()

const ultimoAcesso = profile.ultimo_acesso

if (ultimoAcesso.toDateString() === ontem) {
  // Estudou ontem — incrementar streak
  const novoStreak = profile.streak_dias + 1
  await supabase.from('profiles').update({ streak_dias: novoStreak }).eq('id', userId)
  
  // Verificar marcos de streak
  if (novoStreak === 7) {
    await inserirCoins(userId, 'streak_7', 50, 'streak')
    await inserirBadge(userId, 'semana_perfeita', 'Semana Perfeita')
  }
  if (novoStreak === 30) {
    await inserirCoins(userId, 'streak_30', 200, 'streak')
    await inserirBadge(userId, 'constancia_total', 'Constância Total')
  }
} else if (ultimoAcesso.toDateString() !== hoje) {
  // Não estudou ontem nem hoje — zerar streak
  await supabase.from('profiles').update({ streak_dias: 0 }).eq('id', userId)
}
```

### 9.3 Ranking Mensal no Dashboard

```typescript
// Query: top 10 alunos por coins no mês corrente
const { data: ranking } = await supabase
  .from('phd_coins_log')
  .select('user_id, profiles(nome, foto_url), sum(coins)')
  .gte('created_at', startOfMonth)
  .lte('created_at', endOfMonth)
  .group('user_id, profiles.nome, profiles.foto_url')
  .order('sum', { ascending: false })
  .limit(10)
```

---

## 10. Engajamento de Progresso

### 10.1 Streak Visual no Dashboard

```tsx
// Card de streak no dashboard
<StreakCard 
  diasConsecutivos={profile.streak_dias}
  ultimoAcesso={profile.ultimo_acesso}
/>
// Exibir chama 🔥 se streak_dias > 0
// Exibir mensagem de incentivo se streak_dias === 0 ("Comece sua sequência hoje!")
```

### 10.2 Barra de Progresso nos Cards do Catálogo

```typescript
// Para cada curso no catálogo, buscar progresso do aluno logado
const progresso = await supabase
  .from('progresso_aulas')
  .select('aula_id, concluida')
  .eq('user_id', userId)
  .in('aula_id', aulasDoCurso.map(a => a.id))

const percentual = (aulasConcluidas / totalAulas) * 100
// Exibir barra visual de progresso no card
```

### 10.3 Botão "Continuar de onde parei"

```typescript
// Query: última aula acessada com posição salva
const { data: ultimaAula } = await supabase
  .from('progresso_aulas')
  .select('aula_id, posicao_s, aulas(titulo, cursos(slug))')
  .eq('user_id', userId)
  .eq('concluida', false)
  .order('updated_at', { ascending: false })
  .limit(1)
  .single()

// Link direto: /cursos/[slug]/aula/[id]?t=[posicao_s]
```

### 10.4 Marcos de Progresso (25/50/75/100%)

```typescript
// Calcular percentual após cada conclusão de aula
// Verificar se atingiu marco não celebrado ainda
const marcos = [25, 50, 75, 100]

for (const marco of marcos) {
  if (percentualAtual >= marco && percentualAnterior < marco) {
    // Disparar coins + modal de celebração
    await inserirCoins(userId, `marco_${marco}`, coinsDoMarco(marco))
    
    // Modal especial
    if (marco === 50 || marco === 80) {
      // Crossell: sugerir curso complementar do mesmo pilar
      await dispararCrossell(userId, cursoId)
    }
  }
}
```

---

## 11. Diagnóstico Estático — Trilha por Cargo

### 11.1 Lógica de Aplicação

```typescript
// Ao aluno acessar o dashboard pela primeira vez ou ao clicar em "Ver minha trilha"
async function gerarDiagnosticoEstatico(userId: string) {
  const profile = await getProfile(userId)
  
  // Buscar regra mais específica (cargo + pilar + segmento)
  // Fallback progressivo: cargo+pilar → pilar → segmento → padrão
  const { data: regra } = await supabase
    .from('trilhas_estaticas')
    .select('*')
    .or(`cargo.eq.${profile.cargo},cargo.is.null`)
    .or(`pilar_slug.eq.${pilares[0]},pilar_slug.is.null`)
    .eq('ativo', true)
    .order('cargo', { nullsLast: true })
    .limit(1)
    .single()

  // Salvar diagnóstico
  await supabase.from('diagnosticos').insert({
    user_id: userId,
    tipo: 'estatico',
    perfil_resultado: { cargo: profile.cargo, pilar: pilares[0], segmento: profile.segmento_mercado },
    trilha_recomendada: regra?.trilha_descricao ?? 'Trilha padrão',
    regra_aplicada: regra?.id ?? 'padrao'
  })
}
```

### 11.2 Admin: CRUD de Trilhas Estáticas

Adicionar em `/admin/trilhas`:
- Criar regra: SE cargo = X E pilar = Y → recomendar trilha Z
- Campo de texto para `trilha_descricao` (exibido ao aluno)
- Array de `cursos_sugeridos` (select múltiplo de cursos publicados)

---

## 12. Crossell e Upsell Antecipados

### 12.1 Lógica dos Marcos de Venda

```typescript
// Trigger ao calcular progresso do curso

if (percentual >= 50 && !crossell50Exibido) {
  // Crossell: curso do mesmo pilar, diferente do atual
  const cursoCrossell = await getCursoMesmoPublico(cursoId, userId)
  if (cursoCrossell) {
    await exibirModalCrossell(cursoCrossell, 'marco_50')
    await inserirCoins(userId, 'marco_50', 50)
    await inserirBadge(userId, 'meio_caminho', 'Meio Caminho')
  }
}

if (percentual >= 80 && !upsell80Exibido) {
  // Upsell ou crossell mais forte — CTA mais urgente
  const proximo = curso.proximo_curso_id 
    ?? await getCursoMesmoPublico(cursoId, userId)
  
  await exibirModalUpsell(proximo, 'marco_80')
  await inserirCoins(userId, 'marco_75', 75) // coins do marco 75%
  await inserirBadge(userId, 'reta_final', 'Reta Final')
}

if (percentual >= 100) {
  // Emitir certificado + modal de avaliação + upsell final
  await emitirCertificado(userId, cursoId)
  await inserirCoins(userId, 'curso_concluido', 150)
  await inserirBadge(userId, 'curso_concluido', 'Curso Concluído')
}
```

### 12.2 Certificado com Compartilhamento no LinkedIn

```typescript
// URL de compartilhamento do LinkedIn (Open Graph)
const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true`
  + `&url=${encodeURIComponent(`https://alunos.phdonassolo.com/certificados/${certificado.codigo}`)}`
  + `&title=${encodeURIComponent(`Concluí o curso ${curso.titulo}`)}`
  + `&summary=${encodeURIComponent(`Certificado verificável emitido pela Academia PHDonassolo`)}`

// Botão no certificado: target="_blank"
```

---

## 13. Feedback Assíncrono do Professor

### 13.1 Interface no Admin

```typescript
// Em /admin/alunos/[id]/respostas:
// - Listar todas as respostas de quiz do aluno
// - Para cada resposta: campo de texto "Feedback do Professor"
// - Botão "Salvar e notificar aluno"

async function salvarFeedbackQuiz(respostaId: string, feedback: string) {
  await supabase.from('quiz_respostas').update({
    feedback_professor: feedback,
    feedback_em: new Date().toISOString()
  }).eq('id', respostaId)

  // Buscar aluno e enviar notificação
  const resposta = await getRespostaComAluno(respostaId)
  
  await supabase.from('notificacoes').insert({
    user_id: resposta.user_id,
    tipo: 'feedback_professor',
    mensagem: `O professor adicionou um feedback para sua resposta no quiz "${resposta.quiz.titulo}"`,
    link: `/aluno/cursos/${resposta.curso_slug}/aula/${resposta.aula_id}#quiz`
  })

  await enviarEmailNotificacao(resposta.user_id, 'feedback_recebido', {
    quiz_titulo: resposta.quiz.titulo,
    link: `https://alunos.phdonassolo.com/aluno/cursos/...`
  })
}
```

### 13.2 Mesmo Fluxo para Reflexões de Aula

```typescript
// Campo notas_aluno.feedback_professor — mesmo padrão de admin + notificação
// Interface em /admin/alunos/[id]/notas
```

---

## 14. Comunidade V1 — Base Estrutural

> **Importante:** A comunidade completa é V2. Em V1, implementar apenas a estrutura de dados e os três itens abaixo.

### 14.1 O Que Implementar em V1

**Item 1: Grupos por pilar — estrutura**
```sql
-- Tabela grupos já existe no Blueprint v5.1
-- Ao aluno selecionar pilares no cadastro:
-- INSERT INTO grupos_membros (user_id, grupo_id) 
-- para cada grupo vinculado ao pilar selecionado
-- SEM interface de feed/posts — apenas estrutura de dados
```

**Item 2: Desafio Semanal por e-mail**
```typescript
// CRON toda segunda-feira:
// Admin configura o desafio da semana em /admin/configuracoes
// Sistema envia e-mail para todos os alunos matriculados com:
// - O desafio (texto + contexto)
// - Espaço para reflexão (link para PDI ou notas)
// NÃO há resposta pública em V1 — apenas e-mail
```

**Item 3: Feed de Casos Reais curado**
```typescript
// Seção na home do aluno: "Casos Reais"
// Admin publica casos em /admin/casos-reais (formulário simples)
// Alunos veem — sem poder postar ou comentar em V1
// Estrutura: titulo, descricao, setor, resultado, criado_em
```

---

## 15. Middleware e Proteção de Rotas

> Ver seção 5.2 para o código completo do middleware.ts

### 15.1 Hierarquia de Redirecionamentos

```
Não logado → /login (qualquer rota protegida)
Visitante → /vitrine (se tentar /aluno/*)
Aluno → /dashboard (se tentar /admin/*)
Admin/Staff → /admin (se tentar /aluno/*)
```

### 15.2 Criar o Arquivo

**Local:** `src/middleware.ts` (raiz de src/, não dentro de app/)

**Este arquivo NÃO existe ainda — criar em localhost mas só terá efeito no Vercel.**

---

## 16. Configurações de Ambiente — Pré-Deploy Vercel

> Estas configurações NÃO fazem sentido em localhost. Executar exatamente antes do primeiro deploy.

### 16.1 Variáveis de Ambiente no Vercel

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mercado Pago
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=     # Para validação HMAC

# Claude API
ANTHROPIC_API_KEY=

# AWS SES
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@phdonassolo.com

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Google Sheets (leads)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEETS_ID=
```

### 16.2 Validação HMAC do Webhook Mercado Pago

```typescript
// Em /api/webhooks/mercadopago/route.ts
import { createHmac } from 'crypto'

function validarAssinaturaMP(req: Request, body: string): boolean {
  const signature = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id')
  
  if (!signature || !requestId) return false

  const [tsPart, v1Part] = signature.split(',')
  const ts = tsPart.replace('ts=', '')
  const v1 = v1Part.replace('v1=', '')

  const manifest = `id:${body};request-id:${requestId};ts:${ts};`
  const expected = createHmac('sha256', process.env.MP_WEBHOOK_SECRET!)
    .update(manifest)
    .digest('hex')

  return expected === v1
}
```

### 16.3 Rate Limiting com Upstash

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const rateLimitAuth = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'rl:auth'
})

export const rateLimitCupons = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'rl:cupons'
})

export const rateLimitIA = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'rl:ia'
})
```

### 16.4 DNS

```
# No painel do HostGator:
Tipo:  CNAME
Nome:  alunos
Valor: cname.vercel-dns.com
TTL:   3600
```

---

## 17. Checklist de Validação V1

### Bloco 1 — Auth e Visitante

- [ ] Cadastro de novo usuário cria profile com `papel='visitante'`
- [ ] E-mail de confirmação é enviado após cadastro
- [ ] Troca de senha obrigatória funciona e redireciona para /vitrine
- [ ] Vitrine carrega com cursos e materiais em destaque
- [ ] Download de material gratuito registra em `leads_nurturing`
- [ ] Compra de curso atualiza `papel` de 'visitante' para 'aluno'
- [ ] Cadastro com token de convite cria profile com `papel='aluno'` diretamente
- [ ] Modal de perfil Momento 2 aparece no primeiro login após troca de senha
- [ ] CPF/NIF e telefone são validados como obrigatórios no Momento 2

### Bloco 2 — Player e Progresso

- [ ] Aula retoma na posição salva ao recarregar (seekTo funcionando)
- [ ] Posição é salva a cada 30 segundos durante reprodução
- [ ] Barra de progresso aparece nos cards do catálogo
- [ ] Botão "Continuar de onde parei" leva para a aula e posição corretas
- [ ] Marco de 50%: modal de crossell + PHD Coins + badge
- [ ] Marco de 80%: modal de upsell/crossell
- [ ] 100%: certificado emitido + modal de avaliação + compartilhamento LinkedIn

### Bloco 3 — PHD Coins e Gamificação

- [ ] Conclusão de aula insere em `phd_coins_log` e atualiza `phd_coins_total`
- [ ] Streak é incrementado no dia seguinte ao acesso
- [ ] Streak é zerado após 24h sem acesso
- [ ] Badge "Primeiros Passos" aparece na primeira aula concluída
- [ ] Ranking mensal aparece no dashboard
- [ ] Checkin PDI concede 15 coins

### Bloco 4 — Pagamentos

- [ ] Checkout Mercado Pago abre corretamente (sandbox)
- [ ] Webhook de pagamento aprovado: cria matrícula + plano_acesso + e-mail de boas-vindas
- [ ] Idempotência: processar o mesmo `mp_payment_id` duas vezes não cria duplicata
- [ ] Cupom de desconto funciona no checkout

### Bloco 5 — Admin

- [ ] Admin pode marcar cursos como `destaque_vitrine`
- [ ] Admin pode marcar materiais como `destaque_vitrine`
- [ ] Admin pode editar textos da vitrine em admin/configuracoes
- [ ] Admin pode adicionar feedback em respostas de quiz
- [ ] Admin pode adicionar feedback em reflexões de aula
- [ ] Aluno recebe notificação ao professor salvar feedback

### Bloco 6 — Configurações de Ambiente (Staging)

- [ ] Middleware redireciona visitante para /vitrine
- [ ] Middleware redireciona aluno que tenta acessar /admin
- [ ] Rate limiting ativo nas rotas de auth e cupons
- [ ] HMAC do webhook validado corretamente
- [ ] DNS alunos.phdonassolo.com resolvendo para o Vercel

---

## 18. Plano de Sessões por Semana

| Semana | Sessão | Entregáveis |
|---|---|---|
| S1 | M1-A: Correções P0 + Schema | Bug convites corrigido; Plyr validado; Schema atualizado (41 tabelas + novas) |
| S1 | M1-B: Auth + Visitante | Papel visitante; fluxo cadastro → vitrine; middleware base |
| S2 | M1-C: Perfil Expandido + PDI | Modal Momento 2; PDI renomeado; campos CPF/telefone |
| S2 | M-Vitrine: Página /vitrine | 5 seções; cursos e materiais em destaque; captação leads_nurturing |
| S3 | M2-A: Catálogo e Player | Barra de progresso; botão continuar; seekTo confirmado |
| S3 | M2-B: Crossell e Marcos | Marcos 50% e 80%; crossell e upsell; certificado LinkedIn |
| S4 | M-Gamificação: PHD Coins | phd_coins_log; triggers; streak CRON; ranking; badges |
| S4 | M4: Pagamentos e Convites | Webhook MP; fluxo de convite com convites_matricula corrigido |
| S5 | M5: Quiz com Feedback | Feedback do professor; notificação; reflexões |
| S5 | M6: Admin Ampliado | CRUD trilhas estáticas; configurações vitrine; admin/configuracoes |
| S6 | M7: Comunidade V1 | Grupos por pilar; Desafio Semanal por e-mail; Feed Casos Reais curado |
| S6 | M8: E-mails e PDI CRON | CRON checkin PDI; CRON streak; CRON notificação personalizada |
| S7 | M-Diagnóstico: Trilha estática | Regras no admin; aplicação ao primeiro acesso do aluno |
| S7 | Validação Localhost Completa | Checklist Bloco 1–5 totalmente verde |
| S8 | Deploy Staging (Vercel Preview) | Middleware ativo; webhooks testados com URL pública; e-mails reais |
| S9 | Validação Staging | Checklist Bloco 6; testes end-to-end com usuário real |
| S9 | Go-Live | DNS produção; rate limiting; HMAC ativo |

---

## Notas Finais

### O Que NÃO Implementar em V1

- Comunidade com posts/comentários/curtidas dos alunos
- Resgate de PHD Coins por desconto ou conteúdo
- Quiz de Perfil Profissional com IA
- Trilha adaptativa com Claude API
- Lives integradas
- Modo offline (PWA)
- App mobile nativo
- ROI Tracker com gráfico
- Sala VIP PHD Master com benefícios funcionais

### Referências

- **Blueprint v5.1:** arquivo `Blueprint_Area_do_Aluno_v51.docx` no projeto
- **Relatório de análise v3:** arquivo `Relatorio_Analise_Area_Aluno_v3.docx` no projeto
- **CLAUDE.md do projeto:** raiz de `/area-do-aluno/` — source of truth para o agente
- **Repositórios de referência:**
  - `adrianhajdin/saas-app` → padrões de auth e dashboard
  - `oompas/open-lms` → player e progresso por aula
  - `KolbySisk/next-supabase-stripe-starter` → middleware e webhook (adaptar MP)

---

*Documento elaborado por Claude (Anthropic) — PHD Ramp Project*  
*12 de Abril de 2026 | V1.0 | Para uso interno — Antigravity Dev*
