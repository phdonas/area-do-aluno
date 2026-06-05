import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validarCupom, calcularDesconto } from '@/lib/cupons'
import { registrarLogSistema } from '@/lib/logs'
import { getCorsHeaders, corsOptionsResponse } from '@/lib/cors'

// Inicializa o Stripe com a chave secreta do .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_ph')

export async function OPTIONS(request: Request) {
  return corsOptionsResponse(request)
}

export async function POST(request: Request) {
  const corsH = getCorsHeaders(request)
  try {
    const { cursoId, planoId, cupomCodigo, emailFinal, moeda = 'EUR' } = await request.json()
    
    if (!cursoId) {
      return NextResponse.json({ error: 'ID do curso é obrigatório' }, { status: 400, headers: corsH })
    }

    const targetCurrency = (moeda === 'USD' || moeda === 'EUR') ? moeda : 'EUR'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Se o email não vier no body (aluno logado), usamos o email do auth
    const emailCalculado = (emailFinal || user?.email)?.toLowerCase()

    if (!emailCalculado) {
      return NextResponse.json({ error: 'E-mail do comprador não identificado' }, { status: 401, headers: corsH })
    }

    // 1. Busca detalhes do curso e plano
    const { data: curso, error: cursoError } = await supabase
      .from('cursos')
      .select('*, planos_cursos(planos(*), valor_venda, valor_venda_eur, valor_venda_usd, stripe_price_id_eur, stripe_price_id_usd)')
      .eq('id', cursoId)
      .single()

    if (cursoError || !curso) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404, headers: corsH })
    }

    // Resolve a oferta selecionada (plano)
    const oferta = planoId 
      ? curso.planos_cursos?.find((pc: any) => pc.planos?.id.toString() === planoId.toString())
      : curso.planos_cursos?.[0]

    const plano = oferta?.planos as any

    // Determina o preço base na moeda de destino
    let precoBase = 0
    if (targetCurrency === 'EUR') {
      precoBase = Number(oferta?.valor_venda_eur || 0)
    } else {
      precoBase = Number(oferta?.valor_venda_usd || 0)
    }

    // Fallback inteligente caso a moeda estrangeira não esteja preenchida no banco
    if (precoBase <= 0) {
      const precoBRL = Number(oferta?.valor_venda || curso.preco || 0)
      precoBase = Math.round(precoBRL / 6) // Conversão estimada simples de segurança
      if (precoBase <= 0) precoBase = 49 // Preço mínimo fallback de segurança
    }
    
    let precoFinal = precoBase
    let appliedCupomId = null

    // 2. Aplica Cupom se fornecido
    if (cupomCodigo) {
      const { valid, cupom, error } = await validarCupom(cupomCodigo)
      if (valid && cupom) {
        // Reduz o preço em porcentagem ou valor fixo
        const { precoFinal: novoPreco } = calcularDesconto(precoBase, cupom)
        precoFinal = novoPreco
        appliedCupomId = cupom.id
      } else if (cupomCodigo.trim() !== '') {
        await registrarLogSistema({
          email: emailCalculado,
          evento: 'STRIPE_CUPOM_INVALIDO',
          nivel: 'aviso',
          origem: 'STRIPE_CRIAR_SESSAO',
          detalhes: { codigo: cupomCodigo, erro: error, curso_id: cursoId }
        })
        return NextResponse.json({ error: error || 'Cupom inválido' }, { status: 400, headers: corsH })
      }
    }

    // 3. Criar a sessão no Stripe Checkout (Flexível usando price_data para descontos dinâmicos)
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: targetCurrency.toLowerCase(),
            product_data: {
              name: `Acesso Elite: ${curso.titulo}`,
              description: `Treinamento de Alta Performance — PHD Academy`,
              images: curso.thumb_url ? [curso.thumb_url] : []
            },
            unit_amount: Math.round(precoFinal * 100) // Stripe aceita apenas em centavos (inteiro)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      customer_email: emailCalculado,
      metadata: {
        curso_id: curso.id,
        plano_id: plano?.id || '',
        cupom_id: appliedCupomId || '',
        email_final: emailCalculado,
        moeda: targetCurrency,
        valor_pago: precoFinal.toString()
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}&curso_id=${curso.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/${curso.slug || curso.id}`,
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    await registrarLogSistema({
      email: emailCalculado,
      evento: 'STRIPE_SESSÃO_CHECKOUT_CRIADA',
      nivel: 'info',
      origem: 'STRIPE_CRIAR_SESSAO',
      detalhes: { curso_id: cursoId, precoFinal, moeda: targetCurrency, session_id: session.id }
    })

    return NextResponse.json({
      id: session.id,
      url: session.url,
      precoFinal
    }, { headers: corsH })

  } catch (error: any) {
    console.error('Erro Stripe Checkout:', error)
    await registrarLogSistema({
      email: 'SYSTEM',
      evento: 'STRIPE_CHECKOUT_ERRO_CRITICO',
      nivel: 'erro',
      origem: 'STRIPE_CRIAR_SESSAO',
      detalhes: { erro: error.message }
    })
    return NextResponse.json({
      error: 'Falha ao processar checkout internacional',
      details: error.message
    }, { status: 500, headers: corsH })
  }
}
