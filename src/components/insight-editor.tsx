'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lightbulb, Save, RefreshCw, CheckCircle2, History } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface InsightEditorProps {
  usuarioId: string
  aulaId: string
  cursoId: string
  initialValue?: string
}

export function InsightEditor({ usuarioId, aulaId, cursoId, initialValue = '' }: InsightEditorProps) {
  const [insight, setInsight] = useState(initialValue)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const supabase = createClient()

  // Sincroniza o estado local com o valor inicial (caso mude a aula)
  useEffect(() => {
    setInsight(initialValue)
  }, [initialValue])

  // Lógica de Salvamento Automático com Debounce Nativo
  useEffect(() => {
    if (insight === initialValue) return
    
    const handler = setTimeout(async () => {
      if (insight.trim() === '') return
      
      setStatus('saving')
      
      const { error } = await supabase
        .from('insights')
        .upsert({
          usuario_id: usuarioId,
          aula_id: aulaId,
          curso_id: cursoId,
          conteudo: insight,
          updated_at: new Date().toISOString()
        }, { onConflict: 'usuario_id,aula_id' })

      if (error) {
        console.error('Erro ao salvar insight:', error)
        setStatus('error')
      } else {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 3000)
      }
    }, 1500) // Aguarda 1.5s após parar de digitar

    return () => clearTimeout(handler)
  }, [insight, usuarioId, aulaId, cursoId, initialValue, supabase])

  return (
    <div className="bg-[#0A0F1E] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                 <Lightbulb className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-white tracking-tighter uppercase">Workshop de Insights</h3>
                 <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.2em]">O que você aprendeu nesta aula?</p>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                {status === 'saving' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sincronizando...</span>
                  </motion.div>
                )}
                {status === 'saved' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Salvo no Workspace</span>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        <div className="relative group">
           <textarea 
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder="Anote aqui seus pensamentos, estratégias ou dúvidas fundamentais..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 text-white/80 font-medium leading-relaxed outline-none focus:border-amber-500/50 focus:ring-8 focus:ring-amber-500/5 transition-all min-h-[220px] resize-none text-lg"
           />
           <div className="absolute bottom-6 right-8 flex items-center gap-2 text-white/20">
              <History className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Histórico Pessoal</span>
           </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
           <div className="flex -space-x-2">
              {[1, 2].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0F1E] bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40 italic">PH</div>
              ))}
           </div>
           <p className="text-[10px] font-medium text-white/30 italic">Suas anotações são privadas e serão consolidadas no seu relatório final do curso.</p>
        </div>
      </div>
    </div>
  )
}
