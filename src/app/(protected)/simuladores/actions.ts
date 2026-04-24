'use server'

import { createClient } from '@/lib/supabase/server'

interface LogUsageParams {
  ferramentaId?: string
  ferramentaNome: string
  urlAcessada?: string
}

/**
 * Registra o uso de uma ferramenta por um aluno.
 * Esta função é silenciosa (try/catch) para não interromper a experiência do usuário
 * caso haja falha no registro da telemetria.
 */
export async function logFerramentaUsage({
  ferramentaId,
  ferramentaNome,
  urlAcessada
}: LogUsageParams) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    const { error } = await supabase
      .from('log_uso_ferramentas')
      .insert({
        usuario_id: user.id,
        ferramenta_id: ferramentaId || null,
        ferramenta_nome: ferramentaNome,
        url_acessada: urlAcessada || null
      })

    if (error) {
      console.error('Erro ao registrar log de uso:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Falha catastrófica no log de uso:', err)
    return { success: false, error: 'Internal Error' }
  }
}
