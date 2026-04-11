'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  CheckCircle2, 
  PlayCircle, 
  Lock,
  Layout,
  Clock,
  ArrowRight
} from 'lucide-react'
import { cleanTitle, formatDuration } from '@/lib/formatter'

interface Aula {
  id: string
  titulo: string
  duracao_segundos: number
  ordem: number
  is_gratis: boolean
}

interface Modulo {
  id: string
  titulo: string
  aulas: Aula[]
}

interface ModuleListAccordionProps {
  modulos: Modulo[]
  cursoId: string
  hasAccess: boolean
  aulasConcluidasIds: string[]
  prefixes: string[]
}

export function ModuleListAccordion({ 
  modulos, 
  cursoId, 
  hasAccess, 
  aulasConcluidasIds: aulasConcluidasArray,
  prefixes
}: ModuleListAccordionProps) {
  const aulasConcluidasIds = new Set(aulasConcluidasArray)
  // Estado para controlar quais módulos estão abertos (múltiplos podem ser abertos)
  const [openModulos, setOpenModulos] = useState<Set<string>>(new Set(modulos && modulos.length > 0 ? [modulos[0].id] : []))

  const toggleModulo = (id: string) => {
    const newOpen = new Set(openModulos)
    if (newOpen.has(id)) {
      newOpen.delete(id)
    } else {
      newOpen.add(id)
    }
    setOpenModulos(newOpen)
  }

  return (
    <div className="space-y-6">
      {modulos?.map((modulo) => {
        const isOpen = openModulos.has(modulo.id)
        const totalAulas = modulo.aulas?.length || 0
        const aulasConcluidasNoModulo = modulo.aulas?.filter(a => aulasConcluidasIds.has(a.id)).length || 0
        const moduloConcluido = totalAulas > 0 && aulasConcluidasNoModulo === totalAulas

        return (
          <div 
            key={modulo.id} 
            className={`bg-surface border transition-all duration-300 rounded-[32px] overflow-hidden ${
              isOpen ? 'border-border-custom shadow-lg' : 'border-border-custom/50 hover:border-primary/30 shadow-sm'
            }`}
          >
            {/* CABEÇALHO DO MÓDULO */}
            <button 
              onClick={() => toggleModulo(modulo.id)}
              className="w-full p-6 md:p-8 flex items-center justify-between text-left group transition-colors hover:bg-background/40"
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isOpen ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-background border border-border-custom text-text-muted group-hover:border-primary/50'
                }`}>
                  <Layout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-sm md:text-base font-black uppercase tracking-widest transition-colors ${
                    isOpen ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'
                  }`}>
                    {cleanTitle(modulo.titulo, prefixes)}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                     <span className="text-[10px] font-black text-text-muted/60 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {totalAulas} AULAS
                     </span>
                     {moduloConcluido ? (
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                           <CheckCircle2 className="w-3 h-3" /> CONCLUÍDO
                        </span>
                     ) : (
                        <span className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest">
                           {aulasConcluidasNoModulo}/{totalAulas} COMPLETO
                        </span>
                     )}
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`p-2 rounded-full border ${isOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'border-border-custom text-text-muted'}`}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>

            {/* LISTA DE AULAS */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-4 pb-6 space-y-2">
                    {modulo.aulas?.length > 0 ? (
                      modulo.aulas.map((aula) => {
                        const concluida = aulasConcluidasIds.has(aula.id)
                        const canView = hasAccess || aula.is_gratis
                        
                        return (
                          <div key={aula.id} className="group overflow-hidden rounded-2xl">
                            {canView ? (
                              <Link 
                                href={`/player/${cursoId}/${aula.id}`} 
                                className={`p-5 flex items-center justify-between transition-all border ${
                                  concluida 
                                    ? 'bg-background/20 border-transparent hover:border-emerald-500/20' 
                                    : 'bg-background/40 border-transparent hover:bg-primary/5 hover:border-primary/20 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center gap-5">
                                  <div className="shrink-0">
                                    {concluida ? (
                                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                                        <CheckCircle2 className="w-5 h-5" />
                                      </div>
                                    ) : aula.is_gratis && !hasAccess ? (
                                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-xl shadow-indigo-500/10 animate-pulse">
                                        <PlayCircle className="w-5 h-5" />
                                      </div>
                                    ) : (
                                      <div className="w-10 h-10 rounded-xl bg-surface border border-border-custom flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-all shadow-sm">
                                        <PlayCircle className="w-5 h-5" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className={`text-sm md:text-base font-bold transition-all ${
                                      concluida ? 'text-text-muted opacity-60' : 'text-text-primary group-hover:text-primary'
                                    }`}>
                                      {cleanTitle(aula.titulo, prefixes)}
                                    </span>
                                    {aula.is_gratis && !hasAccess && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none bg-indigo-500/5 px-2 py-1 rounded-sm border border-indigo-500/10">Degustação Gratuita</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-black text-text-muted/60 uppercase tracking-widest">{formatDuration(aula.duracao_segundos)}</span>
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-primary bg-primary/5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                     <ArrowRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </Link>
                            ) : (
                              <div className="p-5 flex items-center justify-between opacity-40 grayscale bg-background/10 border border-transparent">
                                <div className="flex items-center gap-5">
                                  <div className="w-10 h-10 rounded-xl bg-surface border border-border-custom flex items-center justify-center text-text-muted shadow-inner">
                                    <Lock className="w-5 h-5 opacity-40" />
                                  </div>
                                  <span className="text-sm md:text-base font-black text-text-muted uppercase tracking-tight">{cleanTitle(aula.titulo, prefixes)}</span>
                                </div>
                                <div className="p-2">
                                   <Lock className="w-4 h-4 text-text-muted" />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-12 text-center flex flex-col items-center gap-4 opacity-40 grayscale">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-text-muted flex items-center justify-center">
                           <Layout className="w-5 h-5 text-text-muted opacity-30" />
                        </div>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Preparando material...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
