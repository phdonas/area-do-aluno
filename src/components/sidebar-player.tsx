'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  CheckCircle2, 
  Video, 
  Award,
  BookOpen,
  Layout
} from 'lucide-react'
import { cleanTitle, formatDuration } from '@/lib/formatter'

interface Aula {
  id: string
  titulo: string
  duracao_segundos: number
  ordem: number
}

interface Modulo {
  id: string
  titulo: string
  aulas: Aula[]
}

interface SidebarPlayerProps {
  curso: any
  modulos: Modulo[]
  aulaId: string
  cursoId: string
  aulasConcluidasIds: string[]
  porcentagem: number
  prefixes: string[]
}

export function SidebarPlayer({ 
  curso, 
  modulos, 
  aulaId, 
  cursoId, 
  aulasConcluidasIds: aulasConcluidasArray, 
  porcentagem,
  prefixes
}: SidebarPlayerProps) {
  const aulasConcluidasIds = new Set(aulasConcluidasArray)
  // Inicializa com o módulo da aula atual aberto
  const initialOpenModule = modulos.findIndex(m => m.aulas.some(a => a.id === aulaId))
  const [openModuloIndex, setOpenModuloIndex] = useState<number | null>(initialOpenModule !== -1 ? initialOpenModule : 0)

  return (
    <div className="flex flex-col h-full bg-surface relative z-40 overflow-hidden">
      {/* CABEÇALHO DA EMENTA */}
      <div className="p-6 md:p-8 border-b border-border-custom space-y-6 bg-background/30 backdrop-blur-sm sticky top-0 z-10 font-sans">
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Curso Ativo</span>
          <h2 className="font-black text-lg md:text-xl text-text-primary tracking-tighter leading-tight line-clamp-2 italic">{curso?.titulo}</h2>
        </div>
        
        <div className="bg-surface/50 p-5 rounded-[24px] border border-border-custom/50">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] uppercase font-black tracking-widest text-text-muted flex items-center gap-2">
               <BookOpen className="w-3 h-3 text-primary" /> Progresso Atual
            </span>
            <span className="text-xs font-black text-primary">{porcentagem}%</span>
          </div>
          <div className="h-1.5 bg-background border border-border-custom/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${porcentagem}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" 
            />
          </div>
          
          {porcentagem === 100 && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Award className="w-5 h-5 text-white animate-bounce-subtle" /> Emitir meu Certificado
            </motion.button>
          )}
        </div>
      </div>

      {/* LISTA DE MÓDULOS (ACORDEON) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-background/10">
        {modulos.map((modulo, index) => {
          const isOpen = openModuloIndex === index
          const totalAulas = modulo.aulas?.length || 0
          const aulasConcluidasNoModulo = modulo.aulas?.filter(a => aulasConcluidasIds.has(a.id)).length || 0
          const moduloConcluido = totalAulas > 0 && aulasConcluidasNoModulo === totalAulas

          return (
            <div key={modulo.id} className={`rounded-[32px] overflow-hidden transition-all duration-300 border ${isOpen ? 'bg-surface/50 border-border-custom shadow-lg' : 'bg-transparent border-transparent hover:bg-surface/30'}`}>
              <button 
                onClick={() => setOpenModuloIndex(isOpen ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface border border-border-custom text-text-muted group-hover:border-primary/50'}`}>
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isOpen ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>
                      {cleanTitle(modulo.titulo, prefixes)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[9px] font-bold text-text-muted/60 uppercase tracking-tighter">
                          {totalAulas} AULAS • {aulasConcluidasNoModulo}/{totalAulas} CONCLUÍDAS
                       </span>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-primary' : 'text-text-muted'}`} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-3 pb-4 space-y-1">
                      {modulo.aulas?.map((a) => {
                        const isCurrent = a.id === aulaId;
                        const concluida = aulasConcluidasIds.has(a.id);
                        
                        return (
                          <Link 
                            key={a.id} 
                            href={`/player/${cursoId}/${a.id}`} 
                            className={`group p-4 flex items-start gap-4 rounded-2xl transition-all border ${isCurrent ? 'bg-text-primary border-text-primary shadow-xl scale-[1.02] z-10' : 'bg-background/40 hover:bg-surface border-transparent hover:border-border-custom'}`}
                          >
                            <div className="mt-1 shrink-0">
                               {concluida ? (
                                  <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-emerald-400' : 'text-emerald-500'}`} />
                               ) : (
                                  <div className={`w-4 h-4 rounded-full border-2 transition-colors ${isCurrent ? 'border-white/40' : 'border-border-custom group-hover:border-primary'}`} />
                               )}
                            </div>
                            <div className="flex-1 space-y-1">
                               <h4 className={`text-xs font-black leading-snug transition-colors ${isCurrent ? 'text-white' : 'text-text-primary group-hover:text-primary'}`}>
                                 {cleanTitle(a.titulo, prefixes)}
                               </h4>
                               <div className="flex items-center gap-2">
                                  <Video className={`w-3 h-3 ${isCurrent ? 'text-white/40' : 'text-text-muted'}`} />
                                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isCurrent ? 'text-white/40' : 'text-text-muted'}`}>
                                    {formatDuration(a.duracao_segundos)}
                                  </span>
                               </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* FOOTER DA EMENTA */}
      <div className="p-8 bg-background/50 backdrop-blur-md border-t border-border-custom text-center relative">
         <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.4em] opacity-40">ph academy • premium experience</span>
      </div>
    </div>
  )
}
