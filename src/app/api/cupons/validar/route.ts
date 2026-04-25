import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validarCupom, calcularDesconto } from '@/lib/cupons'

export async function POST(request: Request) {
  try {
    const { codigo, cursoId } = await request.json()

    if (!codigo || !cursoId) {
      return NextResponse.json({ valid: false, error: 'Dados incompletos.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { valid, cupom, error } = await validarCupom(codigo, user?.id)
    if (!valid || !cupom) {
      return NextResponse.json({ valid: false, error: error || 'Cupom inválido.' })
    }

    const { data: curso } = await supabase
      .from('cursos')
      .select('*, planos_cursos(planos(*))')
      .eq('id', cursoId)
      .single()

    if (!curso) {
      return NextResponse.json({ valid: false, error: 'Curso não encontrado.' }, { status: 404 })
    }

    const precoBase = Number(curso.planos_cursos?.[0]?.planos?.preco_mensal || curso.preco || 0)
    const { valorDesconto, precoFinal } = calcularDesconto(precoBase, cupom)

    return NextResponse.json({ 
      valid: true, 
      valorDesconto,
      precoFinal,
      codigo: cupom.codigo 
    })

  } catch (error: any) {
    console.error('Erro validação cupom:', error)
    return NextResponse.json({ valid: false, error: 'Falha interna na validação.' }, { status: 500 })
  }
}
