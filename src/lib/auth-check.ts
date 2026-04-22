import { createClient } from './supabase/server'
import { createAdminClient } from './supabase/admin'

/**
 * Lista de e-mails que são "Super Admins" por padrão no código.
 * Isso garante que você nunca perca o acesso administrativo, mesmo se o banco falhar.
 */
const SUPER_ADMINS = ['admin@phdonassolo.com', 'ph@phdonassolo.com']

/**
 * Verifica se o usuário atual é um administrador.
 * Usado para ações de ESCRITA e ALTERAÇÕES críticas.
 */
export async function ensureAdmin() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Não autenticado')
  }

  // Válvula de Escape: Se for um Super Admin, libera direto
  if (user.email && SUPER_ADMINS.includes(user.email.toLowerCase())) {
     return user
  }

  // Verifica o campo is_admin na tabela usuarios usando o Admin Client para evitar recursão de RLS
  const supabaseAdmin = createAdminClient()
  const { data: profile, error: dbError } = await supabaseAdmin
    .from('usuarios')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (dbError || !profile || !profile.is_admin) {
    throw new Error('Unauthorized admin action')
  }

  return user
}

/**
 * Verifica se o usuário tem acesso ao Painel Gestor (Admin ou Staff).
 * Usado para LEITURA de dados e visualização de Dashboards.
 */
export async function ensureAccess() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Não autenticado')
  }

  // Válvula de Escape: Se for um Super Admin, libera direto
  if (user.email && SUPER_ADMINS.includes(user.email.toLowerCase())) {
    return { user, isAdmin: true, isStaff: false }
  }

  const supabaseAdmin = createAdminClient()
  const { data: profile, error: dbError } = await supabaseAdmin
    .from('usuarios')
    .select('is_admin, is_staff')
    .eq('id', user.id)
    .single()

  if (dbError || !profile || (!profile.is_admin && !profile.is_staff)) {
    throw new Error('Unauthorized access to Admin Panel')
  }

  return { 
    user, 
    isAdmin: !!profile.is_admin, 
    isStaff: !!profile.is_staff 
  }
}
