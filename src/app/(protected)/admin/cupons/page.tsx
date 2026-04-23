import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, Tag, Calendar, DollarSign, Percent, Loader2, Sparkles, Send,
  ArrowLeft, Search, Filter, CheckCircle, Clock, Trash2, Power, MoreHorizontal
} from 'lucide-react'
import CouponModal from '@/components/admin/CouponModal'
import { listarCupons, deletarCupom, toggleAtivo } from './actions'
import CouponActions from '@/components/admin/CouponActions'
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
             <div className="p-10 border-b border-border-custom flex items-center justify-between bg-black/[0.01]">
                <h2 className="text-lg font-black text-text-primary uppercase tracking-widest text-xs flex items-center gap-3">
                   <Tag className="w-5 h-5 text-amber-500" /> Códigos Promocionais
                </h2>
                <div className="flex items-center gap-6">
                   <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-amber-500 transition-colors" />
                      <input type="text" placeholder="Buscar código..." className="pl-10 pr-4 py-2 bg-background border border-border-custom rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-amber-500 w-64" />
                   </div>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-border-custom bg-black/[0.02]">
                         <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Código / Benefit</th>
                         <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                         <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Utilização</th>
                         <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Período de Validade</th>
                         <th className="px-10 py-6 text-right"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-custom">
                      {cupons.map((cupom: any) => {
                         const isExpired = cupom.validade_fim && new Date(cupom.validade_fim) < new Date()
                         const isLimitReached = cupom.limite_uso && cupom.uso_atual >= cupom.limite_uso
                         const isActive = cupom.ativo && !isExpired && !isLimitReached

                         return (
                            <tr key={cupom.id} className="hover:bg-black/[0.01] transition-colors group">
                               <td className="px-10 py-8">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-[10px] ${isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-surface border border-border-custom text-text-muted'}`}>
                                        {cupom.tipo === 'porcentagem' ? <Percent className="w-4 h-4 mb-0.5" /> : <DollarSign className="w-4 h-4 mb-0.5" />}
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-lg font-black text-text-primary tracking-tight">{cupom.codigo}</p>
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                           {cupom.tipo === 'porcentagem' ? `${cupom.valor}% OFF` : `R$ ${cupom.valor} OFF`}
                                        </p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  {isActive ? (
                                     <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                        <CheckCircle className="w-3 h-3" /> Ativo
                                     </span>
                                  ) : (
                                     <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                                        <Clock className="w-3 h-3" /> {isExpired ? 'Expirado' : isLimitReached ? 'Esgotado' : 'Inativo'}
                                     </span>
                                  )}
                               </td>
                               <td className="px-10 py-8">
                                  <div className="space-y-2 max-w-[120px]">
                                     <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-text-muted">{cupom.uso_atual} de {cupom.limite_uso || '∞'}</span>
                                     </div>
                                     <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                        <div 
                                           className="h-full bg-amber-500 transition-all duration-1000" 
                                           style={{ width: `${cupom.limite_uso ? (cupom.uso_atual / cupom.limite_uso) * 100 : 0}%` }} 
                                        />
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="space-y-1 font-bold text-xs">
                                     <p className="text-text-primary">{new Date(cupom.validade_inicio).toLocaleDateString()}</p>
                                     <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{cupom.validade_fim ? `Até ${new Date(cupom.validade_fim).toLocaleDateString()}` : 'Sem Expiração'}</p>
                                  </div>
                               </td>
                               <td className="px-10 py-8 text-right">
                                   <CouponActions id={cupom.id} ativo={cupom.ativo} />
                               </td>
                            </tr>
                         )
                      })}
                   </tbody>
                </table>
             </div>
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
