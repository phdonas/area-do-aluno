'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function listarUsoFerramentas(filters: { email?: string, ferramenta?: string, page?: number } = {}) {
  const supabase = createAdminClient()
  const limit = 50
  const offset = ((filters.page || 1) - 1) * limit

  let targetUserIds: string[] = []

  // 1. Se houver filtro de aluno (nome ou email), buscamos os UUIDs primeiro
  if (filters.email) {
    const { data: users } = await supabase
      .from('usuarios')
      .select('id')
      .or(`email.ilike.%${filters.email}%,nome.ilike.%${filters.email}%`)
    
    if (users && users.length > 0) {
      targetUserIds = users.map(u => u.id)
    } else {
      // Se buscou por alguém e não achou ninguém, retornamos vazio direto
      return { logs: [], total: 0 }
    }
  }

  // 2. Buscar os logs puros
  let query = supabase
    .from('log_uso_ferramentas')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (targetUserIds.length > 0) {
    query = query.in('usuario_id', targetUserIds)
  }

  if (filters.ferramenta) {
    query = query.ilike('ferramenta_nome', `%${filters.ferramenta}%`)
  }

  const { data: logs, error, count } = await query

  if (error) {
    console.error('❌ ERRO NA TELEMETRIA:', error.message)
    return { logs: [], total: 0 }
  }

  if (!logs || logs.length === 0) {
    return { logs: [], total: 0 }
  }

  // 3. "Join Manual": Buscar nomes/emails dos usuários envolvidos nestes logs
  const userIds = Array.from(new Set(logs.map(l => l.usuario_id).filter(Boolean)))
  
  const { data: profiles } = await supabase
    .from('usuarios')
    .select('id, nome, email')
    .in('id', userIds)

  // 4. Fundir os dados
  const logsComUsuarios = logs.map(log => {
    const profile = profiles?.find(p => p.id === log.usuario_id)
    return {
      ...log,
      usuarios: profile || null
    }
  })

  return { 
    logs: logsComUsuarios, 
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
