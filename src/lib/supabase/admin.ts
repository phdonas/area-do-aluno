import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Ambiente não configurado: SUPABASE_SERVICE_ROLE_KEY faltando.')
  }

  // Este cliente BYPASSA TODAS AS POLÍTICAS DE RLS
  // Use apenas dentro de ações disparadas por Admins ou Secretaria
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
