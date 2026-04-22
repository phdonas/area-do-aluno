'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validarCupom, registrarUsoCupom } from '@/lib/cupons'

export async function simularCompraMatricula(cursoId: string, cupomCodigo?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado. Por favor, faça login antes de continuar.' }
    }

    const supabaseAdmin = createAdminClient()

    // 0. Resolver ID/Slug para o Curso de fato (UUID)
    const { data: cursoRef, error: errorCurso } = await supabaseAdmin
      .from('cursos')
      .select('id, titulo')
      .or(`id.eq.${cursoId},slug.eq.${cursoId}`)
      .single()

    if (errorCurso || !cursoRef) {
      return { error: 'Curso não encontrado para processar a matrícula.' }
    }

    const realCursoId = cursoRef.id
    const cursoTitulo = cursoRef.titulo

    // 1. Processar Cupom se fornecido
    let appliedCupomId = null
    if (cupomCodigo) {
      const { valid, cupom } = await validarCupom(cupomCodigo)
      if (valid && cupom) {
        appliedCupomId = cupom.id
      }
    }

    // 2. Buscar o plano vinculado a este curso (seleciona o primeiro disponível)
    const { data: planoCurso } = await supabaseAdmin
      .from('planos_cursos')
      .select('plano_id, planos(duracao_meses)')
      .eq('curso_id', realCursoId)
      .limit(1)
      .single()

    let finalPlanoId = planoCurso?.plano_id
    let duracaoMeses = (planoCurso?.planos as any)?.duracao_meses ?? 12

    // Se não houver plano direto, tentamos buscar um plano global
    if (!finalPlanoId) {
        const { data: planoGlobal } = await supabaseAdmin
            .from('planos')
            .select('id, duracao_meses')
            .eq('is_global', true)
            .limit(1)
            .single()
        
        finalPlanoId = planoGlobal?.id
        duracaoMeses = planoGlobal?.duracao_meses ?? 12
    }

    if (!finalPlanoId) {
        return { error: 'Este curso não possui um plano de vendas configurado. Entre em contato com o suporte.' }
    }

    // 3. Criar a assinatura (Matrícula) com prazo dinâmico
    const dataVencimento = duracaoMeses === 0 
      ? '9999-12-31T23:59:59Z' 
      : new Date(Date.now() + duracaoMeses * 30 * 24 * 60 * 60 * 1000).toISOString()

    const { error: errorAssinatura } = await supabaseAdmin
      .from('assinaturas')
      .insert({
        usuario_id: user.id,
        plano_id: finalPlanoId,
        curso_id: realCursoId,
        status: 'ativa',
        data_inicio: new Date().toISOString(),
        data_vencimento: dataVencimento,
        metadata: { 
          simulacao: true, 
          canal: 'checkout_fix', 
          duracao_original: duracaoMeses,
          cupom_utilizado: cupomCodigo || null,
          cupom_id: appliedCupomId,
          curso_titulo: cursoTitulo
        }
      })

    // 4. Registrar uso do cupom se foi aplicado
    if (appliedCupomId) {
      await registrarUsoCupom(appliedCupomId)
    }

    if (errorAssinatura) {
      console.error('Erro ao inserir assinatura:', errorAssinatura)
      return { error: `Erro na base de dados: ${errorAssinatura.message}` }
    }

    // 3. Log de Gamificação (Bônus por ativação)
    await supabaseAdmin.from('phd_coins_log').insert({
      usuario_id: user.id,
      evento: 'compra_curso',
      coins: 100,
      referencia_id: realCursoId,
      referencia_tipo: 'curso'
    })

    revalidatePath('/dashboard')
    revalidatePath('/catalogo')
    
    return { success: true }
  } catch (err: any) {
    console.error('Erro crítico na simulação:', err)
    return { error: 'Ocorreu um erro inesperado ao processar sua matrícula.' }
  }
}
