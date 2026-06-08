'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLmsLiberado() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('configuracoes_sistema')
      .select('valor')
      .eq('chave', 'lms_liberado')
      .single()

    if (error) {
      console.error('Erro ao buscar flag lms_liberado:', error)
      return false
    }
    return data?.valor === 'true'
  } catch (e) {
    console.error('Erro fatal ao buscar flag lms_liberado:', e)
    return false
  }
}

export async function setLmsLiberado(liberado: boolean) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('configuracoes_sistema')
      .update({ valor: liberado ? 'true' : 'false', updated_at: new Date().toISOString() })
      .eq('chave', 'lms_liberado')

    if (error) {
      console.error('Erro ao salvar flag lms_liberado:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/configuracoes/acesso')
    return { success: true }
  } catch (e) {
    console.error('Erro fatal ao salvar flag lms_liberado:', e)
    return { success: false, error: 'Erro ao conectar ao banco.' }
  }
}
