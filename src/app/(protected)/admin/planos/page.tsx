import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlanosClient from './PlanosClient'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'

export const metadata = {
  title: 'Gestão de Vendas | Admin',
}

export default async function GestaoPlanosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdminRole } = await supabase.rpc('is_admin')
  const { data: userData } = await supabase.from('usuarios').select('is_staff').eq('id', user.id).single()
  
  const isAdmin = !!isAdminRole
  const isStaff = !!userData?.is_staff
  const role = isAdmin ? 'admin' : (isStaff ? 'staff' : 'user')

  if (!isAdmin && !isStaff) {
    redirect('/catalogo?acesso_negado=admin')
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4">
      <PlanosClient />
    </div>
  )
}
