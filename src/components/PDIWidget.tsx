'use client'

import { useState } from 'react'
import { Target, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Meta {
  id: string
  titulo: string
  status: 'ativa' | 'avancando' | 'estagnada' | 'concluida'
  semanas_estagnada: number
}

interface PDIWidgetProps {
  metas: Meta[]
}

export function PDIWidget({ metas: initialMetas }: PDIWidgetProps) {
  const [metas, setMetas] = useState<Meta[]>(initialMetas)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'estagnada': return <AlertCircle className="w-4 h-4 text-amber-500" />
      default: return <Clock className="w-4 h-4 text-primary" />
    }
  }

  return (
    <div className="bg-emerald-500/10 dark:bg-emerald-50/90 border border-emerald-500/20 dark:border-emerald-200 rounded-xl p-8 h-full flex flex-col shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground dark:text-emerald-950 font-display">Meu PDI</h3>
            <p className="text-[10px] text-text-muted dark:text-emerald-800/60 uppercase tracking-wider font-bold font-sans">Metas de Desenvolvimento</p>
          </div>
        </div>
        
        <button className="p-2 hover:bg-white/5 dark:hover:bg-emerald-200/50 rounded-full transition-colors group">
          <Plus className="w-5 h-5 text-text-muted dark:text-emerald-800/60 group-hover:text-primary transition-colors" />
        </button>
      </div>

      <div className="space-y-4">
        {metas.length > 0 ? (
          metas.map((meta, idx) => (
            <motion.div 
              key={meta.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-white/[0.02] dark:bg-emerald-200/20 border border-white/5 dark:border-emerald-200/30 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(meta.status)}
                <span className="text-xs font-bold text-white dark:text-emerald-950 group-hover:text-primary-light transition-colors">{meta.titulo}</span>
              </div>
              
              {meta.status === 'estagnada' && (
                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                  {meta.semanas_estagnada} sem. parado
                </span>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-6 space-y-4">
             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto opacity-20">
               <Target className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
               Defina sua primeira meta para<br/>acelerar seu crescimento.
             </p>
             <button className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-light transition-all shadow-lg active:scale-95">
               Criar Meta Agora
             </button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border-custom/50">
        <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <span>Performance Geral</span>
          <span>{metas.filter(m => m.status === 'concluida').length}/{metas.length}</span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-1000" 
            style={{ width: metas.length > 0 ? `${(metas.filter(m => m.status === 'concluida').length / metas.length) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  )
}
