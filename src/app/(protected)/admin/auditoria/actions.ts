'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function listarLogs(filters?: {
  evento?: string
  nivel?: string
  email?: string
  page?: number
}) {
  const supabase = createAdminClient()
  const limit = 50
  const offset = ((filters?.page || 1) - 1) * limit

  let query = supabase
    .from('logs_sistema')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (filters?.evento) query = query.ilike('evento', `%${filters.evento}%`)
  if (filters?.nivel) query = query.eq('nivel', filters.nivel)
  if (filters?.email) query = query.ilike('email', `%${filters.email}%`)

  const { data, count, error } = await query

  if (error) {
    console.error('Erro ao listar logs:', error)
    return { logs: [], total: 0 }
  }

  return { logs: data || [], total: count || 0 }
}

export async function limparLogsAntigos() {
  const supabase = createAdminClient()
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  
  const { error } = await supabase
    .from('logs_sistema')
    .delete()
    .lt('created_at', trintaDiasAtras)

  if (!error) revalidatePath('/admin/auditoria')
  return { success: !error }
}
