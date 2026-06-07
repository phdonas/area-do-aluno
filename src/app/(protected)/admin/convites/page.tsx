import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import InviteModal from '@/components/admin/InviteModal'
import BulkInviteModal from '@/components/admin/BulkInviteModal'
import ConvitesTable from '@/components/admin/ConvitesTable'

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
         <ConvitesTable convites={convites || []} />
      </section>
    </div>
  )
}
