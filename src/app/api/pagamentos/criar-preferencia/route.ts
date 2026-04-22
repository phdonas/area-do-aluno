import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validarCupom, calcularDesconto } from '@/lib/cupons'
import { registrarLogSistema } from '@/lib/logs'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-MOCK-TOKEN-PH' 
})

export async function POST(request: Request) {
  try {
    const { cursoId, cupomCodigo, emailFinal } = await request.json()
    
    if (!cursoId) {
      return NextResponse.json({ error: 'ID do curso é obrigatório' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Se o email não vier no body (aluno logado), usamos o email do auth
    const emailCalculado = (emailFinal || user?.email)?.toLowerCase()

    if (!emailCalculado) {
      return NextResponse.json({ error: 'E-mail do comprador não identificado' }, { status: 401 })
    }

    // 1. Busca detalhes do curso/plano
    const { data: curso, error: cursoError } = await supabase
      .from('cursos')
      .select('*, planos_cursos(planos(*))')
      .eq('id', cursoId)
      .single()

    if (cursoError || !curso) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }

    const plano = curso.planos_cursos?.[0]?.planos as any
    const precoBase = Number(plano?.preco_mensal || plano?.preco_anual || curso.preco || 0)
    
    let precoFinal = precoBase
    let appliedCupomId = null

    // 2. Aplica Cupom se fornecido
    if (cupomCodigo) {
      const { valid, cupom, error } = await validarCupom(cupomCodigo)
      if (valid && cupom) {
        const { precoFinal: novoPreco } = calcularDesconto(precoBase, cupom)
        precoFinal = novoPreco
        appliedCupomId = cupom.id
      } else if (cupomCodigo.trim() !== '') {
        // Se tentou usar e falhou, retornamos erro para feedback no checkout
        await registrarLogSistema({
          email: emailCalculado,
          evento: 'CHECKOUT_CUPOM_INVALIDO',
          nivel: 'aviso',
          origem: 'CRIAR_PREFERENCIA',
          detalhes: { codigo: cupomCodigo, erro: error, curso_id: cursoId }
        })
        return NextResponse.json({ error: error || 'Cupom inválido' }, { status: 400 })
      }
    }

    // 3. Gerar Preferência MP
    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items: [
          {
            id: curso.id,
            title: `Acesso Elite: ${curso.titulo}`,
            quantity: 1,
            unit_price: Number(precoFinal.toFixed(2)),
            currency_id: 'BRL',
            description: `Treinamento de Alta Performance - PH Donassolo`,
            picture_url: curso.thumb_url
          }
        ],
        payer: { email: emailCalculado },
        metadata: {
          curso_id: curso.id,
          plano_id: plano?.id,
          cupom_id: appliedCupomId,
          email_final: emailCalculado
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/erro`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pendente`
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`
      }
    })

      await registrarLogSistema({
        email: emailCalculado,
        evento: 'CHECKOUT_PREFERENCIA_GERADA',
        nivel: 'info',
        origem: 'CRIAR_PREFERENCIA',
        detalhes: { curso_id: cursoId, precoFinal, appliedCupomId }
      })

      return NextResponse.json({ 
        id: response.id,
        init_point: response.init_point,
        precoFinal 
      })

  } catch (error: any) {
    console.error('Erro Checkout:', error)
    await registrarLogSistema({
      email: 'SYSTEM',
      evento: 'CHECKOUT_ERRO_CRITICO',
      nivel: 'erro',
      origem: 'CRIAR_PREFERENCIA',
      detalhes: { erro: error.message }
    })
    return NextResponse.json({ 
      error: 'Falha ao processar checkout', 
      details: error.message 
    }, { status: 500 })
  }
}
