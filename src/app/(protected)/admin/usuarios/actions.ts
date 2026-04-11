'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { registrarLogSistema } from '@/lib/logs'
import { ensureAdmin, ensureAccess } from '@/lib/auth-check'

export async function listarUsuarios() {
  try {
    await ensureAccess() // Permite Admin e Staff verem a lista
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { usuarios: data }
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error)
    return { error: error.message }
  }
}

export async function toggleAdmin(id: string, currentStatus: boolean) {
  try {
    const admin = await ensureAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('usuarios')
      .update({ is_admin: !currentStatus })
      .eq('id', id)

    if (error) throw error

    await registrarLogSistema({
      usuario_id: admin.id,
      email: admin.email,
      evento: 'ALTERAR_PERMISSAO_ADMIN',
      nivel: 'aviso',
      origem: 'GESTAO_USUARIOS',
      detalhes: { target_id: id, novo_status: !currentStatus }
    })

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao alterar permissão:', error)
    return { error: error.message }
  }
}

export async function toggleStaff(id: string, currentStatus: boolean) {
  try {
    const admin = await ensureAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('usuarios')
      .update({ is_staff: !currentStatus })
      .eq('id', id)

    if (error) throw error

    await registrarLogSistema({
      usuario_id: admin.id,
      email: admin.email,
      evento: 'ALTERAR_PERMISSAO_STAFF',
      nivel: 'info',
      origem: 'GESTAO_USUARIOS',
      detalhes: { target_id: id, novo_status: !currentStatus }
    })

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao alterar permissão staff:', error)
    return { error: error.message }
  }
}

export async function deletarUsuario(id: string) {
  try {
    const admin = await ensureAdmin()
    const supabase = createAdminClient()

    // 1. Deletar do Auth (precisa ser via Admin Client)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) throw authError

    // 2. O trigger no banco deve limpar o restante, mas garantimos o log
    await registrarLogSistema({
      usuario_id: admin.id,
      email: admin.email,
      evento: 'USUARIO_EXCLUIDO',
      nivel: 'erro',
      origem: 'GESTAO_USUARIOS',
      detalhes: { target_id: id }
    })

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error)
    return { error: error.message }
  }
}
