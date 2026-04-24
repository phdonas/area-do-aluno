'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function listarUsoFerramentas(filters: { email?: string, ferramenta?: string, page?: number } = {}) {
  const supabase = createAdminClient()
  const limit = 50
  const offset = ((filters.page || 1) - 1) * limit

  let query = supabase
    .from('log_uso_ferramentas')
    .select('*, usuarios!left(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (filters.email) {
    // Busca por email usando o join left
    query = query.ilike('usuarios.email', `%${filters.email.toLowerCase()}%`)
  }

  if (filters.ferramenta) {
    query = query.ilike('ferramenta_nome', `%${filters.ferramenta}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Erro ao listar telemetria:', error)
    return { logs: [], total: 0 }
  }

  return { 
    logs: data || [], 
    total: count || 0 
  }
}

export async function getStatsFerramentas() {
    const supabase = createAdminClient()
    
    // Consulta simplificada para ranking de ferramentas mais usadas
    const { data, error } = await supabase
        .rpc('get_ferramentas_stats') // Vou criar essa RPC no SQL

    if (error) {
        console.error('Erro ao buscar stats:', error)
        return []
    }
    
    return data || []
}
