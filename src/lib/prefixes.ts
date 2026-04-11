import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * Busca a lista global de prefixos que devem ser limpos dos títulos.
 * Usa o cache do Next.js para garantir que só busquemos uma vez por requisição.
 */
export const getPrefixosLimpeza = cache(async () => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('prefixos_limpeza')
      .select('prefixo')
    
    if (error) {
      console.error('Erro ao buscar prefixos de limpeza:', error)
      return []
    }

    return (data?.map(p => p.prefixo) || []) as string[]
  } catch (e) {
    console.error('Erro fatal ao buscar prefixos:', e)
    return []
  }
})
