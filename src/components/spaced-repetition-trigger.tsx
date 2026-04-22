'use client'

import { useState } from 'react'
import { Brain, Star, CheckCircle2, RefreshCw, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface SpacedRepetitionTriggerProps {
  usuarioId: string
  aulaId: string
  onCompleted?: () => void
}

export function SpacedRepetitionTrigger({ usuarioId, aulaId, onCompleted }: SpacedRepetitionTriggerProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  // Algoritmo SM-2 Simplificado
  const calculateSM2 = (quality: number, prevInterval: number, prevRepedition: number, prevEfactor: number) => {
    let interval = 0
    let repetition = 0
    let efactor = prevEfactor

    if (quality >= 3) {
      if (prevRepedition === 0) {
        interval = 1
      } else if (prevRepedition === 1) {
        interval = 6
      } else {
        interval = Math.round(prevInterval * prevEfactor)
      }
      repetition = prevRepedition + 1
    } else {
      repetition = 0
      interval = 1
    }

    efactor = prevEfactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (efactor < 1.3) efactor = 1.3

    return { interval, repetition, efactor }
  }

  const handleRate = async (quality: number) => {
    setRating(quality)
    setLoading(true)

    const { data: current } = await supabase
      .from('revisoes_aula')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('aula_id', aulaId)
      .maybeSingle()

    const { interval, repetition, efactor } = calculateSM2(
      quality, 
      current?.intervalo || 0, 
      current?.repeticao || 0, 
      parseFloat(current?.efactor || '2.5')
    )

    const proximaData = new Date()
    proximaData.setDate(proximaData.getDate() + interval)

    const { error } = await supabase
      .from('revisoes_aula')
      .upsert({
        usuario_id: usuarioId,
        aula_id: aulaId,
        intervalo: interval,
        repeticao: repetition,
        efactor: efactor,
        proxima_revisao: proximaData.toISOString(),
        ultima_revisao: new Date().toISOString()
      }, { onConflict: 'usuario_id,aula_id' })

    setLoading(false)
    if (!error) {
      setSaved(true)
      if (onCompleted) onCompleted()
    }
  }

  if (saved) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] text-center space-y-3"
      >
         <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Calendar className="w-6 h-6 text-white" />
         </div>
         <h4 className="text-lg font-black text-text-primary uppercase tracking-tighter italic">Blindagem Ativada!</h4>
         <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Revisão agendada com sucesso.</p>
      </motion.div>
    )
  }

  return (
    <div className="bg-indigo-500/10 dark:bg-indigo-50/90 border border-indigo-500/20 dark:border-indigo-200 rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-200/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 text-center space-y-6">
         <div className="space-y-3">
            <div className="w-14 h-14 bg-white/40 dark:bg-indigo-200/50 rounded-2xl flex items-center justify-center border border-indigo-500/20 mx-auto shadow-sm">
               <Brain className="w-8 h-8 text-indigo-500 dark:text-indigo-900" />
            </div>
            <h3 className="text-xl font-black text-text-primary dark:text-indigo-950 tracking-tighter uppercase italic">
               Blindagem de Conhecimento
            </h3>
            <p className="text-[11px] text-text-secondary dark:text-indigo-900/60 font-medium max-w-xs mx-auto">
               Diga ao algoritmo o quão difícil foi absorver este conteúdo para agendar sua revisão:
            </p>
         </div>

         <div className="flex items-center justify-center gap-3">
            {[
              { val: 1, label: 'Difícil', color: 'bg-rose-500' },
              { val: 3, label: 'Médio', color: 'bg-amber-500' },
              { val: 5, label: 'Fácil', color: 'bg-emerald-500' }
            ].map((btn) => (
              <button
                key={btn.val}
                disabled={loading}
                onClick={() => handleRate(btn.val)}
                className="group relative flex flex-col items-center gap-2 px-4 py-4 bg-white/60 dark:bg-white/90 border border-indigo-500/10 dark:border-indigo-200 rounded-2xl hover:bg-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 min-w-[90px]"
              >
                 <div className={`w-2.5 h-2.5 rounded-full ${btn.color} shadow-sm`} />
                 <span className="text-[9px] font-black text-text-primary dark:text-indigo-950 uppercase tracking-widest leading-none">{btn.label}</span>
                 {rating === btn.val && loading && (
                   <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl backdrop-blur-sm">
                      <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                   </div>
                 )}
              </button>
            ))}
         </div>

         <div className="pt-6 border-t border-indigo-500/10">
            <p className="text-[9px] font-black text-indigo-500/30 uppercase tracking-[0.2em]">Memória Espaçada SM-2</p>
         </div>
      </div>
    </div>
  )
}
