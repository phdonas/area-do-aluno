import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CouponModal from '@/components/admin/CouponModal'
import { listarCupons } from './actions'
import CuponsTable from '@/components/admin/CuponsTable'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'

export const metadata = {
  title: 'Gestão de Cupons | Admin',
}

export default async function AdminCuponsPage() {
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

  const { cupons = [] } = await listarCupons()

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface border border-border-custom p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[100%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
             
             <div className="space-y-4 relative z-10">
                <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
                   <ArrowLeft className="w-3 h-3" /> Painel de Controle
                </Link>
                <h1 className="text-5xl font-black text-text-primary tracking-tighter flex items-center gap-4">
                   Gestão de <span className="text-amber-500">Cupons</span>
                </h1>
                <p className="text-sm font-medium text-text-muted max-w-md">Gerencie campanhas promocionais e códigos de desconto ativos no checkout.</p>
             </div>

             <div className="flex flex-wrap items-center gap-4 relative z-10">
                <CouponModal />
             </div>
          </header>

          <section className="bg-surface border border-border-custom rounded-[3rem] overflow-hidden shadow-xl">
             <CuponsTable cupons={cupons} />
          </section>
        </div>

        <aside className="mt-40 space-y-6">
          <AdminTutorialCard 
            role={role}
            moduleTitle="Guia de Cupons"
            steps={[
              {
                title: "Código Único",
                description: "O código deve ser fácil de digitar (ex: VERÃO20) e não pode conter espaços."
              },
              {
                title: "Tipos de Desconto",
                description: "Escolha entre porcentagem (mais comum para promoções) ou valor fixo (ideal para parcerias)."
              },
              {
                title: "Limites de Uso",
                description: "Defina uma data de expiração ou um limite máximo de ativações para criar escassez."
              }
            ]}
            color="amber"
          />
        </aside>
      </div>
    </div>
  )
}
