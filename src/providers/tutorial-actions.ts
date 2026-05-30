'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Registra a conclusão do tutorial guiado no banco de dados
 * e concede bônus de PHD Coins ao aluno.
 */
export async function registrarTutorialConcluido() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    const supabaseAdmin = createAdminClient()

    // 1. Atualiza a flag tutorial_concluido na tabela usuarios
    const { error } = await supabaseAdmin
      .from('usuarios')
      .update({
        tutorial_concluido: true
      })
      .eq('id', user.id)

    if (error) {
      console.error('Erro Supabase Admin ao atualizar status de tutorial:', error)
      return { error: error.message }
    }

    // 2. Conceder 20 PHD Coins de bônus por concluir o tour de onboarding
    await supabaseAdmin.from('phd_coins_log').insert({
      usuario_id: user.id,
      evento: 'tutorial_completo',
      coins: 20
    })

    revalidatePath('/')
    
    return { success: true }
  } catch (err: any) {
    console.error('Erro crítico ao salvar conclusão do tutorial:', err)
    return { error: 'Ocorreu um erro interno ao processar seu progresso.' }
  }
}
