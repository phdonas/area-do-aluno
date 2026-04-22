'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function aprovarPagamentoManual(assinaturaId: string) {
  try {
    const supabaseAdmin = createAdminClient()
    
    // Pegamos o ID do admin (service_role já tem poder)
    // Mas a função SQL aprovar_assinatura_manual exige o ID de um admin real para auditoria nas policies se houver
    // Por enquanto, vamos buscar o primeiro admin
    const { data: adminUser } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .single()

    if (!adminUser) return { error: 'Nenhum administrador encontrado no sistema.' }

    const { error } = await supabaseAdmin.rpc('aprovar_assinatura_manual', {
      p_assinatura_id: assinaturaId,
      p_admin_id: adminUser.id
    })

    if (error) {
      console.error('Erro na RPC de aprovação:', error)
      return { error: 'Falha ao aprovar no servidor.' }
    }

    revalidatePath('/admin/matriculas')
    revalidatePath('/admin/financeiro')
    return { success: true }
  } catch (err) {
    return { error: 'Erro inesperado.' }
  }
}

export async function recusarPagamentoManual(assinaturaId: string) {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .from('assinaturas')
      .update({ status_pagamento: 'recusado', status: 'inativa' })
      .eq('id', assinaturaId)

    if (error) return { error: error.message }
    
    revalidatePath('/admin/matriculas')
    return { success: true }
}
