# Mercado Pago — LMS (area-do-aluno)
## Plano de implementação — ambiente de teste

> Implementar primeiro em modo TESTE antes de ir para produção
> Fazer junto com a implementação no site principal (MERCADOPAGO-SITE-PRINCIPAL.md)

### Legenda
- 👤 **Você faz** — ação manual (configuração, cadastro, teste)
- 🔧 **Claude Code** — implementação de código

---

## PRÉ-REQUISITOS — fazer antes de qualquer código

### 1. Verificar estado atual do Mercado Pago no LMS

O LMS já tem implementado:
- `api/pagamentos/criar-preferencia/route.ts` — cria preferência MP
- `api/webhooks/mercadopago/route.ts` — processa pagamentos aprovados
- Fluxo de criação de assinatura após pagamento MP

**O que precisa verificar antes de começar:**

| # | Quem | Tarefa |
|---|---|---|
| 1 | 👤 Você | Vercel → projeto `area-do-aluno` → Settings → Environment Variables → verificar se existe `MP_ACCESS_TOKEN` |
| 2 | 👤 Você | Se existir, verificar se o valor começa com `TEST-` (teste) ou `APP_USR-` (produção) |
| 3 | 👤 Você | Se não existir, criar — instruções na Fase 1 abaixo |

### 2. Criar credenciais de teste no Mercado Pago

| # | Quem | Tarefa |
|---|---|---|
| 1 | 👤 Você | Acessar developers.mercadopago.com.br → login → Suas integrações → aplicação "PHD Academy LMS" (criada no passo do site principal) |
| 2 | 👤 Você | Aba → Credenciais de teste → copiar `Access Token` de teste (começa com `TEST-...`) |
| 3 | 👤 Você | Aba → Credenciais de teste → copiar `Public Key` de teste |

---

## FASE 1 — Variáveis de ambiente na Vercel

| # | Quem | Tarefa |
|---|---|---|
| 1 | 👤 Você | Vercel → projeto `area-do-aluno` → Settings → Environment Variables → adicionar ou atualizar: |

```
MP_ACCESS_TOKEN = TEST-xxxx...    (Access Token de TESTE)
MP_PUBLIC_KEY   = TEST-xxxx...    (Public Key de TESTE — se necessário)
```

| 2 | 👤 Você | Selecionar ambientes: Production + Preview + Development |
| 3 | 👤 Você | Fazer Redeploy do projeto no Vercel para aplicar as variáveis |

---

## FASE 2 — Diagnóstico do código existente

Antes de implementar qualquer coisa, o Claude Code deve verificar o estado atual:

| # | Quem | Tarefa |
|---|---|---|
| 1 | 🔧 Code | Ler `src/app/api/pagamentos/criar-preferencia/route.ts` e reportar: |
- Como a `MP_ACCESS_TOKEN` está sendo carregada
- Quais campos são aceitos no payload
- Como o parcelamento está configurado atualmente
- O `back_urls` (URLs de retorno após pagamento) — para onde redireciona após sucesso/falha

| 2 | 🔧 Code | Ler `src/app/api/webhooks/mercadopago/route.ts` e reportar: |
- Como valida a autenticidade do webhook
- Como cria a assinatura no Supabase
- Se trata o caso de aluno novo (sem conta) corretamente

---

## FASE 3 — Correções e melhorias no endpoint

### 3.1 Configurar parcelamento

| # | Quem | Tarefa |
|---|---|---|
| 1 | 🔧 Code | Em `criar-preferencia/route.ts`, configurar o parcelamento conforme a decisão: 6x sem juros, 7x a 12x com juros para o cliente |

```typescript
// Adicionar na preferência:
payment_methods: {
  installments: 12,           // máximo de parcelas
  default_installments: 1,    // parcela padrão selecionada
  excluded_payment_types: [], // não excluir nenhum método
},
// Para configurar sem juros até 6x:
// isso é feito no painel do Mercado Pago → sua conta →
// Configurações → Parcelamentos sem juros
// (não no código — é configuração da conta)
```

**Importante — configurar parcelamento sem juros no painel:**

| # | Quem | Tarefa |
|---|---|---|
| 1 | 👤 Você | Mercado Pago → sua conta → menu → Seu negócio → Custos → Parcelamentos sem juros |
| 2 | 👤 Você | Ativar parcelamento sem juros até 6x |
| 3 | 👤 Você | De 7x a 12x: deixar com juros para o cliente (o MP calcula automaticamente) |

### 3.2 Configurar URLs de retorno

| # | Quem | Tarefa |
|---|---|---|
| 1 | 🔧 Code | Verificar e corrigir `back_urls` na preferência — devem apontar para o LMS: |

```typescript
back_urls: {
  success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/sucesso?curso_id=${cursoId}`,
  failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/${cursoSlug}?erro=pagamento_recusado`,
  pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pendente?curso_id=${cursoId}`
},
auto_return: 'approved',  // redireciona automaticamente após aprovação
```

### 3.3 Configurar notificação do webhook

| # | Quem | Tarefa |
|---|---|---|
| 1 | 🔧 Code | Adicionar `notification_url` na preferência para garantir que o webhook seja chamado: |

```typescript
notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
```

| 2 | 👤 Você | Mercado Pago → Suas integrações → aplicação → Webhooks → adicionar URL: `https://aluno.phdonassolo.com/api/webhooks/mercadopago` → evento: `payment` |

### 3.4 CORS para o site principal

| # | Quem | Tarefa |
|---|---|---|
| 1 | 🔧 Code | Verificar se `criar-preferencia/route.ts` tem CORS habilitado para `phdonassolo.com` |
| 2 | 🔧 Code | Se não tiver, adicionar usando o utilitário `src/lib/cors.ts` já existente no projeto |

```typescript
// No início do handler POST:
const corsHeaders = getCorsHeaders(request)

// No retorno:
return NextResponse.json(data, { headers: corsHeaders })

// Adicionar handler OPTIONS:
export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request)
}
```

### 3.5 Tratamento de aluno novo via MP

| # | Quem | Tarefa |
|---|---|---|
| 1 | 🔧 Code | Verificar no webhook se existe tratamento para aluno que não tem conta no LMS |
| 2 | 🔧 Code | Se não existir, implementar: após pagamento aprovado, se o email não existe no Supabase Auth, criar convite automático com o curso vinculado (mesmo fluxo do `criarConvite()` já implementado) |

```typescript
// No webhook, após confirmar pagamento:
const { data: usuario } = await supabase.auth.admin.listUsers()
const alunoExiste = usuario.users.find(u => u.email === emailComprador)

if (!alunoExiste) {
  // Criar convite automático com curso vinculado
  await criarConvite({
    email: emailComprador,
    curso_id: cursoId,
    plano_tipo: planoTipo,
    origem: 'mercado_pago'
  })
  // O aluno receberá email para criar senha e já estará matriculado
} else {
  // Aluno existe — criar assinatura diretamente
  await criarAssinatura(alunoExiste.id, cursoId, planoId)
}
```

---

## FASE 4 — Checkout interno do LMS

O LMS tem página de checkout em `/checkout/[id]` com seletor BR/PT/INTL. Verificar se o fluxo BR está funcional:

| # | Quem | Tarefa |
|---|---|---|
| 1 | 🔧 Code | Verificar `src/app/(protected)/checkout/[id]/page.tsx` — botão BR chama `criar-preferencia` corretamente? |
| 2 | 🔧 Code | Verificar se o `MP_ACCESS_TOKEN` é usado corretamente no endpoint |
| 3 | 👤 Você | Testar checkout interno: acessar `/loja/curso/[id]` no LMS → clicar em comprar → selecionar BR → verificar se vai para MP |

---

## FASE 5 — Testes completos

### 5.1 Fluxo pelo site principal → MP

| # | Quem | Tarefa |
|---|---|---|
| 1 | 👤 Você | Acessar `phdonassolo.com/#/curso/descomplicando-o-jbp-rca` com IP brasileiro |
| 2 | 👤 Você | Verificar se exibe BRL e métodos MP automaticamente |
| 3 | 👤 Você | Preencher email de teste, selecionar plano, clicar em "Comprar" |
| 4 | 👤 Você | Verificar se redireciona para checkout do Mercado Pago |
| 5 | 👤 Você | Pagar com cartão de teste: `5031 7557 3453 0604` / `11/25` / `123` |
| 6 | 👤 Você | Verificar redirecionamento para `aluno.phdonassolo.com/checkout/sucesso` |
| 7 | 👤 Você | Verificar no Supabase: `SELECT * FROM assinaturas ORDER BY created_at DESC LIMIT 1` |
| 8 | 👤 Você | Confirmar que `status = 'ativa'` e `metodo_pagamento = 'mercadopago'` |

### 5.2 Fluxo aluno novo via MP

| # | Quem | Tarefa |
|---|---|---|
| 1 | 👤 Você | Usar email que NÃO existe no LMS para fazer a compra de teste |
| 2 | 👤 Você | Verificar se convite foi criado automaticamente em `convites_matricula` |
| 3 | 👤 Você | Verificar se email de boas-vindas foi enviado |
| 4 | 👤 Você | Clicar no link do email → fazer cadastro → confirmar acesso ao curso |

### 5.3 Cartões de teste do Mercado Pago

| Bandeira | Número | Validade | CVV | Resultado |
|---|---|---|---|---|
| Mastercard | 5031 7557 3453 0604 | 11/25 | 123 | Aprovado |
| Visa | 4235 6477 2802 5682 | 11/25 | 123 | Aprovado |
| Mastercard | 5031 4332 1540 6351 | 11/25 | 123 | Recusado |
| Visa | 4000 0000 0000 0002 | 11/25 | 123 | Pendente |

**Para testar Pix em sandbox:**
O MP não simula Pix em sandbox da mesma forma que cartão. Use cartão para os testes iniciais.

---

## FASE 6 — Migração para produção (fazer junto com o site principal)

**Pré-requisito:** todos os testes aprovados.

| # | Quem | Tarefa |
|---|---|---|
| 1 | 👤 Você | Mercado Pago → aplicação → Credenciais de produção → copiar `Access Token` real (começa com `APP_USR-...`) |
| 2 | 👤 Você | Vercel → `area-do-aluno` → Environment Variables → atualizar `MP_ACCESS_TOKEN` com valor de produção |
| 3 | 👤 Você | Mercado Pago → Webhooks de produção → adicionar URL: `https://aluno.phdonassolo.com/api/webhooks/mercadopago` |
| 4 | 👤 Você | Redeploy do LMS no Vercel |
| 5 | 👤 Você | Fazer junto com migração do Stripe para produção |
| 6 | 👤 Você | Testar com compra real de valor mínimo via Pix (taxa 0,49%) |

---

## Referência — tabela de taxas Mercado Pago

| Método | Taxa | Quem paga |
|---|---|---|
| Pix | 0,49% | Vendedor |
| Débito | 1,99% | Vendedor |
| Crédito à vista | 4,98% | Vendedor |
| Crédito 2x | ~5,49% | Vendedor |
| Crédito 3x | ~5,99% | Vendedor |
| Crédito 4x | ~6,49% | Vendedor |
| Crédito 5x | ~6,99% | Vendedor |
| Crédito 6x | ~7,49% | Vendedor |
| Crédito 7x a 12x | juros | **Cliente** |

*Taxas aproximadas — variam conforme volume de vendas mensal. Usar simulador do MP para valores exatos.*

---

*Documento gerado em Junho 2025*
*Usar junto com: MERCADOPAGO-SITE-PRINCIPAL.md*
*Projeto: aluno.phdonassolo.com*
