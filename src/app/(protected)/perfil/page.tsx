import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { User, Mail, Shield, Calendar, LogOut, MapPin, Fingerprint, CheckCircle, GraduationCap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ProfileForm } from "@/components/profile-form"

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  
  // TENTATIVA 1: Buscar por ID (Usando o Admin Client para furar o bloqueio do RLS)
  let { data: aluno } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  // TENTATIVA 2: Backup por E-mail (Caso o ID do Admin seja diferente do Auth) e Reparo de Sessão
  if (!aluno && user.email) {
    const { data: fallback } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email', user.email)
      .single()
    
    if (fallback) {
      // REPARO AUTOMÁTICO: Soldamos o ID do login no registro do banco de dados
      await supabaseAdmin
        .from('usuarios')
        .update({ id: user.id })
        .eq('email', user.email)
      
      aluno = { ...fallback, id: user.id }
    }
  }

  const meta = user.user_metadata || {}
  const isPortugal = aluno?.pais === 'Portugal' || aluno?.pais === 'PT' || aluno?.pais?.includes('Por')

  // AUTO-SINCRONIZAÇÃO SUPREMA: Se o banco diz Portugal mas o login diz Brasil, o banco ganha e atualiza o login na hora
  if (aluno?.pais && meta.pais !== aluno.pais) {
     const sb = await createClient()
     await sb.auth.updateUser({ data: { pais: aluno.pais } })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
         <h1 className="text-4xl font-black text-text-primary tracking-tighter">Meu Perfil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Lado Esquerdo - Info Básica */}
         <div className="md:col-span-1 space-y-6">
            <div className="bg-surface border border-border-custom p-8 rounded-[40px] flex flex-col items-center text-center shadow-lg shadow-black/5">
                <div className="w-24 h-24 rounded-full bg-primary-light/20 flex items-center justify-center text-primary font-black text-3xl mb-4 border-2 border-primary/10">
                   {user.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-text-primary">{aluno?.nome || meta.full_name || user.email?.split('@')[0]}</h2>
                <div className="flex items-center gap-1.5 mt-2">
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-primary opacity-60">Aluno PHDonassolo Academy</p>
                   {aluno?.pais && (
                     <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-full border border-primary/20">
                        {aluno.pais}
                     </span>
                   )}
                </div>
            </div>

            <div className="bg-surface border border-border-custom p-6 rounded-[32px] space-y-4">
               <h3 className="text-[10px] uppercase font-black tracking-widest text-text-muted px-2">Autenticação</h3>
               <form action={async () => {
                  'use server'
                  const sb = await createClient()
                  await sb.auth.signOut()
                  redirect('/login')
               }}>
                  <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 font-black text-xs uppercase tracking-widest transition-all">
                     <LogOut className="w-4 h-4" /> Finalizar Sessão
                  </button>
               </form>
            </div>
         </div>

         {/* Lado Direito - Detalhes e Edição */}
         <div className="md:col-span-2 space-y-8">
            <ProfileForm initialData={aluno} />

            {/* Pilares de Interesse (Read-only por enquanto) */}
            <div className="bg-surface border border-border-custom rounded-[32px] overflow-hidden">
                <div className="p-6 border-b border-border-custom flex items-center justify-between">
                   <h3 className="font-black text-text-primary uppercase tracking-widest text-[10px] flex items-center gap-2">
                      <GraduationCap className="w-3 h-3 text-primary" /> Pilares de Interesse
                   </h3>
                </div>
                <div className="p-6 bg-background/10">
                   <div className="flex flex-wrap gap-2 text-text-primary">
                      {aluno?.pilares_interesse && aluno.pilares_interesse.length > 0 ? (
                         aluno.pilares_interesse.map((pilar: string, idx: number) => (
                           <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-custom rounded-xl shadow-sm">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">{pilar}</span>
                           </div>
                         ))
                      ) : (
                         <p className="text-[10px] text-text-muted italic px-2">Nenhum pilar selecionado.</p>
                      )}
                   </div>
                </div>
            </div>

            <div className="p-10 bg-indigo-500/5 border-2 border-dashed border-indigo-500/10 rounded-[40px] flex flex-col items-center text-center">
                <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                   <Shield className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-black text-indigo-900 tracking-tight">Segurança de Dados</h3>
                <p className="max-w-xs text-xs font-medium text-indigo-700/60 leading-relaxed mt-2 uppercase tracking-widest">
                   Suas informações estão protegidas por criptografia ponta-a-ponta e em conformidade com as diretrizes da PHDonassolo Academy.
                </p>
            </div>
         </div>
      </div>
    </div>
  )
}
