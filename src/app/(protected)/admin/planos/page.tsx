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
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <PlanosClient />
        </div>
        
        <aside className="mt-28 space-y-6">
          <AdminTutorialCard 
            role={role}
            title="Guia de Vendas"
            description="Configure como seus cursos serão vendidos e empacotados."
            steps={[
              {
                title: "Planos vs Cursos",
                description: "Crie um plano (ex: 'Elite 12 meses') e depois selecione-o na lista para vincular quais cursos ele libera."
              },
              {
                title: "Vínculo Direto",
                description: "Ao selecionar um plano na esquerda, os botões na direita mudam para 'Vincular'. Um curso pode ter apenas um plano ativo."
              },
              {
                title: "Acesso Vitalício",
                description: "Marque vitalício para que o aluno nunca perca o acesso, ou defina meses específicos para expiração automática."
              }
            ]}
            color="indigo"
          />
        </aside>
      </div>
    </div>
  )
}
