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
  // Quality: 0-5
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

    // 1. Buscar estado atual da revisão se existir
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

    // 2. Salvar novo estado
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
        className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] text-center space-y-4"
      >
         <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Calendar className="w-8 h-8 text-white" />
         </div>
         <h4 className="text-xl font-black text-white uppercase tracking-tighter">Blindagem Ativada!</h4>
         <p className="text-sm text-emerald-500 font-bold uppercase tracking-widest">Agendamos sua revisão para garantir que você não esqueça esse conteúdo.</p>
      </motion.div>
    )
  }

  return (
    <div className="bg-[#0A0F1E] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 text-center space-y-8">
         <div className="space-y-4">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 mx-auto shadow-lg shadow-indigo-500/5">
               <Brain className="w-9 h-9 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-tight">
               Blindagem de Conhecimento
            </h3>
            <p className="text-sm text-white/40 font-medium max-w-sm mx-auto">
               Para fixar esta aula em sua mente, diga ao algoritmo o quão difícil foi absorver este conteúdo:
            </p>
         </div>

         <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { val: 1, label: 'Difícil', color: 'bg-red-500' },
              { val: 3, label: 'Médio', color: 'bg-amber-500' },
              { val: 5, label: 'Fácil', color: 'bg-emerald-500' }
            ].map((btn) => (
              <button
                key={btn.val}
                disabled={loading}
                onClick={() => handleRate(btn.val)}
                className="group relative flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 min-w-[120px]"
              >
                 <div className={`w-3 h-3 rounded-full ${btn.color} shadow-lg shadow-black/20`} />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{btn.label}</span>
                 {rating === btn.val && loading && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl backdrop-blur-sm">
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                   </div>
                 )}
              </button>
            ))}
         </div>

         <div className="pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Tecnologia de Memória Espaçada (SM-2)</p>
         </div>
      </div>
    </div>
  )
}
