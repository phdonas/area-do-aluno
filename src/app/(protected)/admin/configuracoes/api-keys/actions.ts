'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureAdmin } from '@/lib/auth-check'
import { revalidatePath } from 'next/cache'

export type SupportedApiKeys = 'youtube_api_key' | 'gemini_api_key' | 'claude_api_key' | 'openai_api_key'

export async function getApiKeys() {
  await ensureAdmin()
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('configuracoes_sistema')
      .select('chave, valor')
      .in('chave', ['youtube_api_key', 'gemini_api_key', 'claude_api_key', 'openai_api_key'])

    if (error) {
      console.error('Erro ao buscar chaves de API:', error)
      return {}
    }

    const keysMap: Record<string, string> = {}
    data?.forEach((item) => {
      keysMap[item.chave] = item.valor
    })

    return keysMap
  } catch (e) {
    console.error('Erro fatal ao buscar chaves de API:', e)
    return {}
  }
}

export async function saveApiKey(chave: SupportedApiKeys, valor: string) {
  await ensureAdmin()
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    
    // Primeiro verificamos se a chave já existe (pode usar o client normal para leitura)
    const { data: existingData } = await supabase
      .from('configuracoes_sistema')
      .select('chave')
      .eq('chave', chave)
      .single()

    let error;

    if (existingData) {
      // Atualizar - Usando Admin Client para burlar RLS se necessário
      const { error: updateError } = await supabaseAdmin
        .from('configuracoes_sistema')
        .update({ valor, updated_at: new Date().toISOString() })
        .eq('chave', chave)
      error = updateError
    } else {
      // Inserir - Usando Admin Client pois RLS pode bloquear INSERT na tabela de config
      const { error: insertError } = await supabaseAdmin
        .from('configuracoes_sistema')
        .insert({ chave, valor, updated_at: new Date().toISOString() })
      error = insertError
    }

    if (error) {
      console.error(`Erro ao salvar a chave ${chave}:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/configuracoes/api-keys')
    return { success: true }
  } catch (e) {
    console.error(`Erro fatal ao salvar a chave ${chave}:`, e)
    return { success: false, error: 'Erro ao conectar ao banco.' }
  }
}
