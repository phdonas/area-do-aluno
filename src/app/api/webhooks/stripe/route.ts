import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { enviarEmailComunicacao } from '@/lib/email-service'
import { registrarUsoCupom } from '@/lib/cupons'
import { registrarLogSistema } from '@/lib/logs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_ph')

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const payload = await request.text()
    const sig = request.headers.get('stripe-signature') || ''
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock_secret'

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
    } catch (err: any) {
      console.error(`❌ Webhook Signature Error: ${err.message}`)
      return NextResponse.json({ error: `Signature verification failed: ${err.message}` }, { status: 400 })
    }

    // Processa apenas sessões de checkout completadas com sucesso
    if (event.type !== 'checkout.session.completed') {
      return NextResponse.json({ received: true })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const { curso_id, plano_id, email_final, cupom_id, moeda, valor_pago } = session.metadata as any
    const email = (email_final || session.customer_email || session.customer_details?.email)?.toLowerCase().trim()

    if (!email) {
      console.error('❌ E-mail do comprador não encontrado nos metadados ou na sessão do Stripe.')
      return NextResponse.json({ error: 'Comprador não identificado' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Idempotência: Checa se este pagamento já foi processado na tabela logs_matriculas
    const { data: logExistente } = await supabase
      .from('logs_matriculas')
      .select('id')
      .eq('detalhes->>stripe_session_id', session.id)
      .limit(1)
      .maybeSingle()

    if (logExistente) {
      console.log(`ℹ️ Webhook do Stripe já processado anteriormente para a sessão: ${session.id}`)
      return NextResponse.json({ received: true })
    }

    // 2. Buscar o nome do curso para o e-mail transacional
    let cursoNome = ''
    if (curso_id) {
      const { data: curso } = await supabase
        .from('cursos')
        .select('titulo')
        .eq('id', curso_id)
        .single()
      cursoNome = curso?.titulo || ''
    }

    // 3. Determinar o prazo de acesso contratado pelo plano
    let duracaoMeses = 12 // Padrão: 1 ano
    if (plano_id) {
      const { data: plano } = await supabase
        .from('planos')
        .select('duracao_meses')
        .eq('id', plano_id)
        .single()
      if (plano) duracaoMeses = plano.duracao_meses
    }

    const dataVencimento = duracaoMeses === 0 
      ? '9999-12-31T23:59:59Z' 
      : new Date(Date.now() + duracaoMeses * 30 * 24 * 60 * 60 * 1000).toISOString()

    // 4. Checar se o comprador já possui uma conta de usuário
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (usuario?.id) {
      // 🔓 MATRÍCULA DIRETA (Aluno já existente)
      const { error: errorAssinatura } = await supabase.from('assinaturas').insert({
        usuario_id: usuario.id,
        plano_id: plano_id || null,
        curso_id: curso_id || null,
        status: 'ativa',
        data_inicio: new Date().toISOString(),
        data_vencimento: dataVencimento,
        metodo_pagamento: 'stripe',
        status_pagamento: 'pago',
        valor_pago: valor_pago ? Number(valor_pago) : (session.amount_total ? session.amount_total / 100 : 0),
        moeda: moeda || session.currency?.toUpperCase() || 'EUR',
        metadata: { stripe_session_id: session.id, via: 'webhook_stripe', duracao_original: duracaoMeses }
      })

      if (errorAssinatura) {
        console.error('❌ Erro ao criar assinatura do Stripe:', errorAssinatura)
        return NextResponse.json({ error: errorAssinatura.message }, { status: 500 })
      }
      
      // Envia o e-mail notificando a liberação direta do curso
      await enviarEmailComunicacao({ email, cursoNome, tipo: 'matricula_direta' })

      // Registra a transação em logs_matriculas
      await supabase.from('logs_matriculas').insert({
        usuario_id: usuario.id,
        evento: 'MATRICULA_DIRETA_STRIPE',
        curso_id: curso_id || null,
        plano_id: plano_id || null,
        origem: 'WEBHOOK_STRIPE',
        detalhes: { stripe_session_id: session.id, cursoNome, valor: valor_pago, moeda }
      })

      // Concede bônus de 100 PHD Coins por gamificação comercial
      await supabase.from('phd_coins_log').insert({
        usuario_id: usuario.id,
        evento: 'compra_curso',
        coins: 100,
        referencia_id: curso_id || null,
        referencia_tipo: 'curso'
      })

      await registrarLogSistema({
        usuario_id: usuario.id,
        email,
        evento: 'STRIPE_MATRICULA_DIRETA',
        nivel: 'sucesso',
        origem: 'WEBHOOK_STRIPE',
        detalhes: { stripe_session_id: session.id, curso_id, cursoNome }
      })

    } else {
      // 📧 FLUXO DE CONVITE (Novo Aluno)
      const token = crypto.randomUUID()
      const { error: errorConvite } = await supabase.from('convites_matricula').insert({
        token,
        email,
        curso_id: curso_id || null,
        plano_tipo: 'venda_direta',
        origem: 'stripe',
        usado: false
      })

      if (errorConvite) {
        console.error('❌ Erro ao criar convite do Stripe:', errorConvite)
        return NextResponse.json({ error: errorConvite.message }, { status: 500 })
      }

      // Envia o e-mail com o link de ativação da nova conta
      await enviarEmailComunicacao({ email, token, cursoNome, tipo: 'convite', contexto: 'pos_pagamento' })

      // Registra o log administrativo
      await supabase.from('logs_matriculas').insert({
        evento: 'CONVITE_STRIPE_GERADO',
        curso_id: curso_id || null,
        plano_id: plano_id || null,
        origem: 'WEBHOOK_STRIPE',
        detalhes: { stripe_session_id: session.id, email, token, cursoNome }
      })

      await registrarLogSistema({
        email,
        evento: 'STRIPE_VENDA_NOVO_ALUNO_CONVITE',
        nivel: 'sucesso',
        origem: 'WEBHOOK_STRIPE',
        detalhes: { stripe_session_id: session.id, curso_id, cursoNome, token }
      })
    }

    // 5. Registrar uso do cupom se tiver sido aplicado
    if (cupom_id) {
      await registrarUsoCupom(cupom_id)
    }

    // 6. Log financeiro em logs_transacoes para o Backoffice
    await supabase.from('logs_transacoes').insert({
      usuario_id: usuario?.id || null,
      curso_id: curso_id || null,
      plano_id: plano_id || null,
      provider: 'stripe',
      external_id: session.id,
      status_anterior: 'pending',
      status_novo: 'approved',
      valor_total: valor_pago ? Number(valor_pago) : (session.amount_total ? session.amount_total / 100 : 0),
      moeda: moeda || session.currency?.toUpperCase() || 'EUR',
      payload_bruto: session as any,
      metadata: session.metadata as any
    })

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('❌ Erro crítico no Webhook do Stripe:', error)
    await registrarLogSistema({
      email: 'SYSTEM',
      evento: 'STRIPE_WEBHOOK_ERRO_CRITICO',
      nivel: 'erro',
      origem: 'WEBHOOK_STRIPE',
      detalhes: { erro: error.message }
    })
    return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 })
  }
}
