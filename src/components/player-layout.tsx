'use client'

import { useState, ReactNode } from 'react'
import { Menu, X, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cleanTitle } from '@/lib/formatter'

interface PlayerLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  cursoId: string
  aulaTitulo: string
  prefixes: string[]
  isFlowMode?: boolean
}

export function PlayerLayout({ children, sidebar, cursoId, aulaTitulo, prefixes, isFlowMode = false }: PlayerLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isGradeOpen, setIsGradeOpen] = useState(!isFlowMode) // Por padrão, fechada se for fluxo por causa do dashboard logic ou se o usuário pediu

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen bg-background overflow-hidden selection:bg-primary/30">
      
      {/* HEADER PREMIUM (Sempre visível exceto no Modo Foco Total) */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="h-20 bg-background/80 border-b border-border-custom flex items-center justify-between px-6 md:px-10 z-[110] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-6">
                <Link 
                  href={`/dashboard`} 
                  className="flex items-center gap-3 px-4 py-2 hover:bg-surface rounded-xl transition-all text-text-muted hover:text-primary border border-transparent hover:border-border/50 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Painel</span>
                </Link>
                
                <div className="h-8 w-px bg-border-custom hidden md:block" />

                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary leading-none mb-1.5 opacity-60">Conteúdo em Foco</span>
                  <h2 className="text-sm md:text-base font-black uppercase tracking-widest text-text-primary truncate max-w-[180px] md:max-w-2xl italic leading-none font-display">
                    {cleanTitle(aulaTitulo, prefixes)}
                  </h2>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 mr-4 bg-card/50 px-4 py-2 rounded-xl border border-border/50">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Sincronizado</span>
                </div>

                <button 
                  onClick={() => setIsFocusMode(true)}
                  className="hidden sm:flex items-center gap-3 px-6 py-3 bg-secondary border border-secondary-dark/30 rounded-xl hover:bg-secondary/80 transition-all shadow-sm group active:scale-95"
                >
                  <Maximize2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Atenção Plena</span>
                </button>
                
                {/* BOTÃO DESKTOP PARA COLLAPSE DA SIDEBAR */}
                <button 
                  onClick={() => setIsGradeOpen(!isGradeOpen)}
                  className={`hidden lg:flex p-3 rounded-xl transition-all shadow-sm border ${isFlowMode ? 'bg-orange-500/10 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-background border-border-custom text-text-primary hover:border-primary'}`}
                  title={isGradeOpen ? "Fechar Grade" : "Abrir Grade"}
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* BOTÃO MOBILE (TOGGLE SIDEBAR) */}
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-3.5 bg-primary text-white rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden relative">
        {/* CONTEÚDO PRINCIPAL (VÍDEO) */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar relative transition-all duration-500 ease-in-out ${isFocusMode ? 'bg-[#020205]' : 'bg-background'}`}>
          {/* Floating Exit for Focus Mode */}
          {isFocusMode && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsFocusMode(false)}
              className="fixed top-10 right-10 z-[200] p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl text-white/40 hover:text-white hover:bg-primary transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] group"
            >
              <Minimize2 className="w-7 h-7" />
              <span className="absolute right-full mr-5 top-1/2 -translate-y-1/2 px-4 py-2 bg-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Encerrar Modo Foco</span>
            </motion.button>
          )}

          <div className={`${isFocusMode ? 'pt-0' : 'p-0'}`}>
            {children}
          </div>
        </main>

        {/* SIDEBAR DESKTOP (GRADE DE AULAS) - COLLAPSABLE */}
        <AnimatePresence mode="popLayout">
          {isGradeOpen && !isFocusMode && (
              <motion.aside 
               initial={{ width: 0, opacity: 0 }}
               animate={{ width: "420px", opacity: 1 }}
               exit={{ width: 0, opacity: 0 }}
               transition={{ type: "spring", damping: 30, stiffness: 200 }}
               className="hidden lg:block h-full border-l border-border/50 bg-card/30 backdrop-blur-sm shadow-2xl relative z-10"
             >
               <div className="h-full overflow-hidden">
                 {sidebar}
               </div>
             </motion.aside>
          )}
        </AnimatePresence>

        {/* SIDEBAR MOBILE (DRAWER) */}
        <AnimatePresence>
          {isSidebarOpen && !isFocusMode && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[145] lg:hidden"
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-[90%] max-w-[400px] bg-surface z-[150] lg:hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              >
                <div className="h-full overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-border-custom flex items-center justify-between bg-background/50">
                     <span className="text-[11px] font-black uppercase tracking-widest text-text-primary italic">Grade do Curso</span>
                     <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-3 bg-white/5 border border-border-custom rounded-2xl text-text-primary"
                     >
                       <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="flex-1 overflow-hidden" onClick={() => setIsSidebarOpen(false)}>
                    {sidebar}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
