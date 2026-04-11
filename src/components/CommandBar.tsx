'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  LayoutDashboard, 
  Library, 
  PlaySquare, 
  Settings, 
  LogOut, 
  Zap,
  ChevronRight,
  MonitorPlay,
  Command
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function CommandBar() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Escuta evento customizado para abrir via botão lateral
    const handleOpenCommandBar = () => setIsOpen(true)
    window.addEventListener('open-command-bar', handleOpenCommandBar)
    return () => window.removeEventListener('open-command-bar', handleOpenCommandBar)
  }, [])

  const staticActions = useMemo(() => [
    { id: 'dash', title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', category: 'Navegação' },
    { id: 'cata', title: 'Catálogo de Cursos', icon: Library, href: '/catalogo', category: 'Navegação' },
    { id: 'simu', title: 'Simuladores IA', icon: PlaySquare, href: '/simuladores', category: 'Prática' },
    { id: 'perf', title: 'Meu Perfil', icon: Settings, href: '/perfil', category: 'Conta' },
    { id: 'out', title: 'Sair da Plataforma', icon: LogOut, href: '/logout', category: 'Conta', danger: true },
  ], [])

  const filteredActions = useMemo(() => {
    if (!query) return staticActions
    return staticActions.filter(a => 
      a.title.toLowerCase().includes(query.toLowerCase()) || 
      a.category.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, staticActions])

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape') setIsOpen(false)
      
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredActions.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length)
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const selected = filteredActions[selectedIndex]
        if (selected) {
          router.push(selected.href)
          setIsOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, toggle, filteredActions, selectedIndex, router])

  useEffect(() => {
     setSelectedIndex(0)
  }, [query])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Escuro com Blur Profundo */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[9998]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl bg-[#0F172A] border border-white/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,1)] z-[9999] overflow-hidden"
          >
            {/* Input com Alto Contraste */}
            <div className="p-8 border-b border-white/10 flex items-center gap-6 bg-white/5">
              <Command className="w-8 h-8 text-primary" />
              <input 
                autoFocus
                placeholder="O que você deseja fazer?"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-transparent border-none text-white text-2xl font-bold focus:outline-none placeholder:text-white/20"
              />
              <kbd className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg border border-white/20 text-[10px] font-black text-white/40">ESC</kbd>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-6 custom-scrollbar bg-black/20">
              {filteredActions.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <Zap className="w-12 h-12 text-primary/20 mx-auto" />
                  <p className="text-white/40 font-medium">Nenhum comando encontrado para "{query}"</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(
                    filteredActions.reduce((acc, curr) => {
                      if (!acc[curr.category]) acc[curr.category] = []
                      acc[curr.category].push(curr)
                      return acc
                    }, {} as Record<string, typeof filteredActions>)
                  ).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                       <h4 className="px-4 text-[11px] font-black text-primary uppercase tracking-[0.3em]">{category}</h4>
                       <div className="space-y-2">
                          {items.map((item) => {
                            const absoluteIndex = filteredActions.indexOf(item)
                            const isSelected = selectedIndex === absoluteIndex
                            const Icon = item.icon

                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  router.push(item.href)
                                  setIsOpen(false)
                                }}
                                onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                                className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all duration-200 border ${
                                  isSelected 
                                    ? 'bg-primary border-primary shadow-lg shadow-primary/40 translate-x-2' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
                                }`}
                              >
                                <div className="flex items-center gap-5">
                                   <div className={`p-3 rounded-2xl transition-all ${
                                     isSelected ? 'bg-white text-primary' : 'bg-white/5 text-white/40'
                                   }`}>
                                      <Icon className="w-6 h-6" />
                                   </div>
                                   <span className={`text-lg font-black transition-all ${
                                     isSelected ? 'text-white' : 'text-white/80'
                                   }`}>
                                      {item.title}
                                   </span>
                                </div>
                                
                                {isSelected && (
                                   <ChevronRight className="w-5 h-5 text-white animate-pulse" />
                                )}
                              </button>
                            )
                          })}
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-5 bg-black/40 border-t border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-6 text-[11px] font-black text-white/30 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Selecionar</span>
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/20" /> Navegar</span>
               </div>
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">PH Donassolo Area</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
