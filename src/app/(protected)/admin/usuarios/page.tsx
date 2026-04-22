import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, UserPlus, Filter, Shield, 
  Mail, Calendar, Briefcase, ChevronRight
} from 'lucide-react'
import { listarUsuarios } from './actions'
import UserActions from '@/components/admin/UserActions'
import { ensureAccess } from '@/lib/auth-check'

export const metadata = {
  title: 'Gestão de Equipe & Alunos | Admin',
}

export default async function AdminUsuariosPage() {
  const { user, isAdmin: isCurrentUserAdmin } = await ensureAccess()
  const { usuarios = [] } = await listarUsuarios()

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface border border-border-custom p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[100%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="relative flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border ${isCurrentUserAdmin ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-indigo-500/20 border-indigo-500/30'}`}>
               <Users className={`w-8 h-8 ${isCurrentUserAdmin ? 'text-emerald-500' : 'text-indigo-500'}`} />
            </div>
            <div>
               <h1 className="text-3xl font-black text-text-primary tracking-tight italic">Nível de Acesso</h1>
               <p className="text-text-muted font-medium mt-1">Gestão de Roles: Admin, Staff e Comunidade</p>
            </div>
         </div>

         <div className="relative flex items-center gap-4">
            <div className="bg-black/5 hover:bg-black/10 transition-colors border border-border-custom p-2 px-4 rounded-2xl flex items-center gap-3">
               <Users className="w-4 h-4 text-emerald-500" />
               <span className="text-sm font-black text-text-primary">{usuarios.length} Contas</span>
            </div>
            <Link 
              href="/admin/convites"
              className="bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-3"
            >
               <UserPlus className="w-5 h-5" />
               Gerar Convite
            </Link>
         </div>
      </header>

      {/* Lista de Usuários */}
      <section className="bg-surface border border-border-custom rounded-[3.5rem] shadow-2xl overflow-hidden">
         <div className="p-8 border-b border-border-custom bg-black/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="bg-emerald-500/10 p-3 rounded-2xl">
                  <Filter className="w-5 h-5 text-emerald-500" />
               </div>
               <span className="font-black text-sm uppercase tracking-widest text-text-muted italic">Auditoria de Credenciais</span>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="border-b border-border-custom">
                     <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">Membro</th>
                     <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Cursos Ativos</th>
                     <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">Identidade Digital</th>
                     <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Permissões</th>
                     <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Cadastro</th>
                     <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-text-muted">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-custom">
                  {usuarios.map((u: any) => {
                     const isSelf = u.id === user.id
                     const roleLabel = u.is_admin ? '🛡️ Admin' : u.is_staff ? '💼 Staff' : '👤 Aluno'
                     const roleColor = u.is_admin ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : u.is_staff ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                     const totalCursos = u.assinaturas?.[0]?.count || 0
                     
                     return (
                        <tr key={u.id} className="group hover:bg-black/[0.02] transition-all">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border ${u.is_admin ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : u.is_staff ? 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'}`}>
                                    {u.full_name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                    <p className="font-black text-text-primary flex items-center gap-2">
                                       {u.full_name || 'Anônimo'}
                                       {isSelf && <span className="text-[9px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md border border-blue-500/20 font-black">SUA CONTA</span>}
                                    </p>
                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
                                       {u.is_admin || u.is_staff ? <Shield className="w-3 h-3 text-primary" /> : null}
                                       {u.is_admin ? 'Administrador' : u.is_staff ? 'Equipe PH' : 'Membro Regular'}
                                    </p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/5 text-[10px] font-black text-text-primary border border-border-custom">
                                 {totalCursos}
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-2 text-text-muted font-bold text-sm">
                                 <Mail className="w-4 h-4 text-emerald-500" />
                                 {u.email}
                              </div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border inline-block min-w-[100px] ${roleColor}`}>
                                 {roleLabel}
                              </span>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <div className="flex flex-col items-center justify-center text-text-muted">
                                 <span className="text-[10px] font-black text-text-primary">{new Date(u.created_at).toLocaleDateString('pt-BR')}</span>
                                 <span className="text-[8px] font-normal uppercase opacity-50">Entrada</span>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <UserActions id={u.id} isAdmin={u.is_admin} isStaff={u.is_staff} email={u.email} isSelf={isSelf} />
                           </td>
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
         
         {usuarios.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Users className="w-10 h-10 text-emerald-500" />
               </div>
               <p className="text-text-muted font-bold italic">Nenhum registro localizado no servidor.</p>
            </div>
         )}
      </section>
    </div>
  )
}
