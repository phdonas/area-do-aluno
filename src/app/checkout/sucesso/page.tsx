import React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Play, LayoutDashboard } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function CheckoutSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ curso_id?: string, manual?: string }>
}) {
  const { curso_id, manual } = await searchParams
  const isManual = manual === 'true'
  const supabase = createAdminClient()
  
  let cursoNome = 'Treinamento'
  if (curso_id) {
    const { data: curso } = await supabase.from('cursos').select('titulo').eq('id', curso_id).single()
    cursoNome = curso?.titulo || 'Treinamento'
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="max-w-2xl w-full bg-surface border border-border-custom rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
         
         {/* Background Orbs */}
         <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] ${isManual ? 'bg-amber-500/10' : 'bg-emerald-500/10'} blur-[120px] rounded-full pointer-events-none`} />
         <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

         <div className="relative z-10 space-y-10">
            <div className={`w-24 h-24 ${isManual ? 'bg-amber-500/20 border-amber-500/30 shadow-amber-500/20' : 'bg-emerald-500/20 border-emerald-500/30 shadow-emerald-500/20'} border rounded-[2rem] flex items-center justify-center mx-auto shadow-xl`}>
               {isManual ? <Clock className="w-12 h-12 text-amber-500" /> : <CheckCircle2 className="w-12 h-12 text-emerald-500" />}
            </div>

             <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter italic leading-tight">
                  {isManual ? 'Aguarde: estamos apenas conferindo o seu pagamento' : 'Seja Bem-vindo!'}
                </h1>
                <p className="text-lg text-text-muted font-medium max-w-lg mx-auto">
                  {isManual 
                    ? 'Dentro de poucos minutos seu acesso estará liberado. Isso pode demorar alguns minutos.'
                    : `Sua matrícula no curso "${cursoNome}" foi confirmada com sucesso.`
                  }
                </p>
            </div>

            <div className={`bg-black/5 border border-border-custom px-6 py-4 rounded-3xl inline-block`}>
               <p className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <span className={`w-2 h-2 ${isManual ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full animate-pulse`} />
                  {isManual ? 'Conferência em andamento' : 'Acesso Liberado Imediatamente'}
               </p>
            </div>

            {isManual && (
               <div className="space-y-6 text-sm text-text-muted font-medium bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                  <p>
                    Volte para o dashboard e conheça outros cursos ou as ferramentas gratuitas para começar a usar já.
                  </p>
                  <p className="text-primary font-black uppercase text-[10px] tracking-widest leading-relaxed">
                    Iremos informar você via e-mail assim que a sua matrícula estiver concluída.
                  </p>
               </div>
            )}

            <div className="flex flex-col gap-4 pt-8">
               {!isManual && (
                 <Link 
                   href={curso_id ? `/player/${curso_id}` : '/dashboard'} 
                   className="w-full py-5 bg-primary hover:bg-primary-dark text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px]"
                 >
                    <Play className="w-4 h-4" />
                    Começar a Estudar
                    <ArrowRight className="w-4 h-4" />
                 </Link>
               )}

               <Link 
                 href="/dashboard" 
                 className="w-full py-5 bg-background border border-border-custom text-text-primary font-black rounded-2xl hover:bg-black/5 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px]"
               >
                  <LayoutDashboard className="w-4 h-4" />
                  Ir para o Dashboard
               </Link>
            </div>

            <p className="text-[9px] text-text-muted italic opacity-50 pt-10 uppercase tracking-widest">
               Ambiente Seguro • Ph Donassolo LMS v5.2
            </p>
         </div>
      </div>
    </div>
  )
}

import { Clock } from 'lucide-react'
