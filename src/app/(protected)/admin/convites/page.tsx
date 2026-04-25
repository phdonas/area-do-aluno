import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, Mail, CheckCircle, Clock, Search, Filter, 
  ChevronRight, ArrowLeft, MoreHorizontal, UserPlus, FileSpreadsheet
} from 'lucide-react'
import InviteModal from '@/components/admin/InviteModal'
import BulkInviteModal from '@/components/admin/BulkInviteModal'

export const metadata = {
  title: 'Gestão de Convites | Admin',
}

export default async function ConvitesAdminPage() {
  const supabase = await createClient()

  // 1. Verificar Admin de forma consistente
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect('/catalogo?acesso_negado=admin')

  // 2. Buscar Dados
  const [
    { data: convites },
    { data: cursos }
  ] = await Promise.all([
    supabase.from('convites_matricula').select('*').order('created_at', { ascending: false }),
    supabase.from('cursos').select('id, titulo').eq('status', 'publicado')
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      
      {/* 🟢 HEADER DINÂMICO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface border border-border-custom p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[100%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="space-y-4 relative z-10">
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
               <ArrowLeft className="w-3 h-3" /> Painel de Controle
            </Link>
            <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-4">
               Gestão de <span className="text-emerald-500">Convites</span>
            </h1>
            <p className="text-sm font-medium text-text-muted max-w-md">Controle a entrada de novos alunos via convites manuais, cupons ou importação em massa.</p>
         </div>

         <div className="flex flex-wrap items-center gap-4 relative z-10">
            <BulkInviteModal cursos={cursos || []} />
            <InviteModal cursos={cursos || []} />
         </div>
      </header>

      {/* 📊 ESTATÍSTICAS RÁPIDAS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 bg-surface border border-border-custom rounded-[2.5rem] space-y-2">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total de Envios</p>
            <h3 className="text-3xl font-black text-text-primary tracking-tighter">{convites?.length || 0}</h3>
         </div>
         <div className="p-8 bg-surface border border-border-custom rounded-[2.5rem] space-y-2">
            <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Ativados</p>
            <h3 className="text-3xl font-black text-text-primary tracking-tighter">{convites?.filter(c => c.usado).length || 0}</h3>
         </div>
         <div className="p-8 bg-surface border border-border-custom rounded-[2.5rem] space-y-2">
            <p className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest">Pendentes</p>
            <h3 className="text-3xl font-black text-text-primary tracking-tighter">{convites?.filter(c => !c.usado).length || 0}</h3>
         </div>
      </section>

      {/* 📋 LISTA DE CONVITES */}
      <section className="bg-surface border border-border-custom rounded-[3rem] overflow-hidden shadow-xl">
         <div className="p-10 border-b border-border-custom flex items-center justify-between bg-black/[0.01]">
            <h2 className="text-lg font-black text-text-primary uppercase tracking-widest text-xs flex items-center gap-3">
               <Users className="w-5 h-5 text-primary" /> Histórico de Acessos
            </h2>
            <div className="flex items-center gap-6">
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input type="text" placeholder="Filtrar por e-mail..." className="pl-10 pr-4 py-2 bg-background border border-border-custom rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary w-64" />
               </div>
               <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><Filter className="w-4 h-4 text-text-muted" /></button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border-custom bg-black/[0.02]">
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Aluno / Destinatário</th>
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Acesso Vinculado</th>
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Data / Expiração</th>
                     <th className="px-10 py-6 text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-custom">
                  {convites?.map((convite: any) => (
                     <tr key={convite.id} className="hover:bg-black/[0.01] transition-colors group">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${convite.usado ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                 {convite.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="space-y-1">
                                 <p className="text-sm font-black text-text-primary tracking-tight">{convite.email}</p>
                                 <p className="text-[10px] text-text-muted truncate w-40 font-mono tracking-tighter">Token: {convite.token}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           {convite.usado ? (
                              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                 <CheckCircle className="w-3 h-3" /> Ativado
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
                                 <Clock className="w-3 h-3" /> Aguardando
                              </span>
                           )}
                        </td>
                        <td className="px-10 py-8">
                           <div className="space-y-1">
                              <p className="text-xs font-bold text-text-primary capitalize">{convite.curso_id ? 'Pilar Específico' : 'Acesso Global'}</p>
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em]">{convite.origem.replace('_', ' ')}</p>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="space-y-1">
                              <p className="text-xs font-black text-text-primary">{new Date(convite.created_at).toLocaleDateString()}</p>
                              <p className="text-[10px] text-text-muted font-medium italic">Expira em 7 dias</p>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <button className="p-3 hover:bg-black/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4 text-text-muted" /></button>
                        </td>
                     </tr>
                  ))}
                  {(!convites || convites.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center space-y-6 opacity-30">
                          <Users className="w-16 h-16" />
                          <p className="text-lg font-black uppercase tracking-widest">Nenhum convite gerado</p>
                          <p className="text-xs font-medium max-w-[240px]">Inicie gerando um novo convite ou importando uma lista de contatos.</p>
                        </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </section>
    </div>
  )
}
