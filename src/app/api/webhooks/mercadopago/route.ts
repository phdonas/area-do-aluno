import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { enviarEmailComunicacao } from '@/lib/mail'
import { registrarUsoCupom } from '@/lib/cupons'
import { registrarLogSistema } from '@/lib/logs'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-MOCK-TOKEN-PH' 
})

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const dataId = searchParams.get('data.id')

    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ ok: true })
    }

    let paymentData;
    
    if (process.env.NODE_ENV === 'development' && dataId.toString().startsWith('TEST-')) {
        paymentData = {
            status: 'approved',
            metadata: {
                curso_id: searchParams.get('curso_id'),
                plano_id: searchParams.get('plano_id'),
                email_final: searchParams.get('email')
            },
            payer: { email: searchParams.get('email') }
        };
    } else {
        const payment = new Payment(client)
        paymentData = await payment.get({ id: dataId })
    }

    if (paymentData.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    const { curso_id, plano_id, email_final, cupom_id } = paymentData.metadata as any
    const email = (email_final || paymentData.payer?.email)?.toLowerCase().trim()

    const supabase = createAdminClient()

    // 1. Idempotência
    const { data: logExistente } = await supabase
      .from('logs_matriculas')
      .select('id')
      .eq('detalhes->>mp_payment_id', dataId.toString())
      .limit(1)
      .maybeSingle()

    if (logExistente) {
      return NextResponse.json({ ok: true })
    }

    // 2. Buscar nome do curso para o e-mail
    let cursoNome = ''
    if (curso_id) {
      const { data: curso } = await supabase.from('cursos').select('titulo').eq('id', curso_id).single()
      cursoNome = curso?.titulo || ''
    }

    // 3. Lógica de Acesso
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (usuario?.id) {
      // MATRÍCULA DIRETA
      await supabase.from('assinaturas').insert({
        usuario_id: usuario.id,
        plano_id: plano_id || null,
        curso_id: curso_id || null,
        status: 'ativa',
        data_inicio: new Date().toISOString(),
        data_vencimento: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
        metadata: { mp_payment_id: dataId, via: 'webhook' }
      })
      
      await enviarEmailComunicacao({ email, cursoNome, tipo: 'matricula_direta' })

      await registrarLogSistema({
        usuario_id: usuario.id,
        email,
        evento: 'MATRICULA_DIRETA',
        nivel: 'sucesso',
        origem: 'WEBHOOK_MP',
        detalhes: { mp_payment_id: dataId, curso_id, cursoNome }
      })

    } else {
      // FLUXO DE CONVITE (Novo)
      const token = crypto.randomUUID()
      await supabase.from('convites_matricula').insert({
        token, email, curso_id,
        plano_tipo: 'venda_direta',
        origem: 'mercado_pago',
        usado: false
      })

      await enviarEmailComunicacao({ email, token, cursoNome, tipo: 'convite' })

      await registrarLogSistema({
        email,
        evento: 'VENDA_NOVO_ALUNO_CONVITE',
        nivel: 'sucesso',
        origem: 'WEBHOOK_MP',
        detalhes: { mp_payment_id: dataId, curso_id, cursoNome, token }
      })
    }

    // 4. Incrementar Uso do Cupom (se houver)
    if (cupom_id) {
        await registrarUsoCupom(cupom_id)
    }

    return NextResponse.json({ ok: true })

  } catch (error: any) {
    console.error('Erro Webhook:', error)
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 })
  }
}
