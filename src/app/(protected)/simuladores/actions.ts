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
  console.log('📡 [Server Action] Iniciando registro de uso:', { ferramentaNome, ferramentaId });

  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ [Server Action] Erro de autenticação:', userError);
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
      .from('log_uso_ferramentas')
      .insert({
        usuario_id: user.id,
        ferramenta_id: ferramentaId || null,
        ferramenta_nome: ferramentaNome,
        url_acessada: urlAcessada || ''
      })

    if (error) {
      console.error('❌ [Server Action] Erro ao inserir no Supabase:', error);
      return { success: false, error: error.message }
    }

    console.log('✅ [Server Action] Uso registrado com sucesso para:', user.email);
    return { success: true }
  } catch (err) {
    console.error('💥 [Server Action] Erro inesperado:', err);
    return { success: false, error: 'Erro interno no servidor' }
  }
}
