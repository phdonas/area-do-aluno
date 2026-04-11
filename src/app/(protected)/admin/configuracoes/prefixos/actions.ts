'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPrefixos() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('prefixos_limpeza')
      .select('*')
      .order('prefixo', { ascending: true })

    if (error) {
      console.error('Erro ao buscar prefixos:', error)
      return []
    }
    return data || []
  } catch (e) {
    console.error('Erro fatal ao buscar prefixos:', e)
    return []
  }
}

export async function addPrefixo(texto: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('prefixos_limpeza')
      .insert([{ prefixo: texto.toUpperCase().trim() }])

    if (error) {
      console.error('Erro ao adicionar prefixo:', error)
      return { success: false, error: error.message }
    }
    revalidatePath('/admin/configuracoes/prefixos')
    return { success: true }
  } catch (e) {
    console.error('Erro fatal ao adicionar prefixo:', e)
    return { success: false, error: 'Ocorreu um erro interno no servidor.' }
  }
}

export async function deletePrefixo(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('prefixos_limpeza')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir prefixo:', error)
      return { success: false, error: error.message }
    }
    revalidatePath('/admin/configuracoes/prefixos')
    return { success: true }
  } catch (e) {
    console.error('Erro fatal ao excluir prefixo:', e)
    return { success: false, error: 'Erro ao conectar ao banco.' }
  }
}
