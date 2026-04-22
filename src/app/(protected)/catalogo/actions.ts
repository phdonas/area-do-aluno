'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function matricularAlunoEmCursoGratuito(cursoId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Você precisa estar logado para se matricular.' }
    }

    // Tentativa 1: RPC (Mais seguro, centraliza a regra de negócio)
    const { error: rpcError } = await supabase.rpc('matricular_curso_gratuito', {
      p_user_id: user.id,
      p_curso_id: cursoId
    })

    if (!rpcError) {
      revalidatePath('/dashboard')
      revalidatePath('/catalogo')
      return { success: true }
    }

    console.warn('RPC matricular_curso_gratuito falhou, tentando fallback via Admin Client:', rpcError)

    // Tentativa 2: Fallback via Admin Client (Garante a execução se o RPC falhar por permissão)
    // Primeiro verificamos se o curso é realmente gratuito
    const { data: curso, error: cursoError } = await supabase
      .from('cursos')
      .select('id, is_gratis')
      .eq('id', cursoId)
      .single()

    if (cursoError || !curso?.is_gratis) {
      return { error: 'Este curso não é gratuito ou não foi encontrado.' }
    }

    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabaseAdmin = createAdminClient()

    const { error: insertError } = await supabaseAdmin
      .from('assinaturas')
      .insert({
        usuario_id: user.id,
        curso_id: cursoId,
        status: 'ativa',
        data_inicio: new Date().toISOString(),
        data_vencimento: '9999-12-31T23:59:59Z',
        metadata: { origem: 'fallback_admin_action', tipo: 'gratuito' }
      })

    if (insertError) {
      console.error('Erro no fallback de matrícula gratuita:', insertError)
      return { error: 'Ocorreu um erro ao processar sua matrícula gratuita.' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/catalogo')

    return { success: true }
  } catch (err: any) {
    console.error('Erro crítico na matrícula gratuita:', err)
    return { error: 'Ocorreu um erro inesperado.' }
  }
}
