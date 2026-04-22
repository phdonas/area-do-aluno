'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Library, 
  PlaySquare, 
  Settings, 
  LogOut, 
  Command,
  Zap,
  Lightbulb,
  Award,
  CircleUser,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  hasAccess: boolean
  hasSubscription: boolean
  userEmail?: string
}

export function Sidebar({ hasAccess, hasSubscription, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [isCollapsed, setIsCollapsed] = useState(true)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresSubscription: true },
    { href: '/catalogo', label: 'Catálogo', icon: Library },
    { href: '/ferramentas', label: 'Ferramentas', icon: Zap, premium: true },
    { href: '/insights', label: 'Insights', icon: Lightbulb, premium: true },
    { href: '/simuladores', label: 'Simuladores IA', icon: PlaySquare, premium: true },
    { href: '/meus-certificados', label: 'Certificados', icon: Award, requiresSubscription: true },
  ]

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="hidden md:flex flex-col bg-card border-r border-border/50 h-screen sticky top-0 z-[100] transition-all duration-300 ease-in-out group"
    >
      {/* HEADER SIDEBAR */}
      <div className="flex items-center justify-between p-4 mb-6 relative">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="px-3 py-2 bg-primary-dark rounded-xl flex items-center gap-2 shadow-inner"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white font-black text-sm tracking-tighter">PHD</span>
              </div>
              <span className="text-white text-xs font-black uppercase tracking-widest mr-2">Academy</span>
            </motion.div>
          ) : (
            <motion.div 
              key="collapsed"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="w-12 h-12 bg-primary-dark rounded-xl flex items-center justify-center shadow-lg mx-auto"
            >
              <span className="text-white font-black text-xs tracking-tighter">PHD</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-12 w-8 h-8 bg-orange-600 text-white border-2 border-white rounded-full flex items-center justify-center hover:bg-orange-700 transition-all shadow-[0_4px_12px_rgba(234,88,12,0.3)] z-50 hover:scale-110 active:scale-95"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" strokeWidth={3} /> : <ChevronLeft className="w-5 h-5" strokeWidth={3} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          if ((item.premium || item.requiresSubscription) && !hasSubscription) return null

          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all font-bold text-sm relative group/item ${
                isActive 
                  ? 'text-white bg-primary shadow-lg shadow-primary/20' 
                  : 'text-text-secondary hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-item-hover:text-primary'}`} />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity z-[110] whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-bar'))}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/5 font-bold transition-all group/cmd relative"
        >
          <Command className="w-5 h-5 flex-shrink-0 group-hover/cmd:text-primary" />
          {!isCollapsed && <span className="text-sm">Comandos</span>}
          {isCollapsed && (
             <div className="absolute left-full ml-4 px-2 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover/cmd:opacity-100 pointer-events-none transition-opacity z-[110] whitespace-nowrap shadow-xl">
               Comandos (⌘K)
             </div>
          )}
        </button>
        
        {hasAccess && (
          <div className={`pt-8 ${isCollapsed ? 'flex justify-center' : ''}`}>
             {!isCollapsed && <span className="px-3 text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 block mb-3 italic">Admin Zone</span>}
             <Link href="/admin" className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all font-bold text-sm border shadow-sm ${
                pathname.startsWith('/admin')
                  ? 'text-white bg-primary border-primary'
                  : 'text-text-primary hover:bg-primary/5 border-primary/20 bg-surface'
             }`}>
               <Settings className={`w-5 h-5 flex-shrink-0 ${pathname.startsWith('/admin') ? 'text-white' : 'text-primary'}`} />
               {!isCollapsed && <span>Painel Gestor</span>}
             </Link>
          </div>
        )}
      </nav>

      <div className={`p-3 mt-auto border-t border-border/50 space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <Link href="/perfil" className={`flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-bold transition-all relative group/item ${
          pathname === '/perfil' ? 'bg-primary/5 text-primary' : 'text-text-secondary hover:text-primary hover:bg-primary/5'
        } ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`}>
          <CircleUser className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Meu Perfil</span>}
          {isCollapsed && (
             <div className="absolute left-full ml-4 px-2 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity z-[110] whitespace-nowrap shadow-xl">
               Perfil
             </div>
          )}
        </Link>
        <button 
          onClick={handleSignOut}
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-rose-600 hover:bg-rose-500/5 font-black text-[10px] uppercase tracking-widest transition-all group/item relative ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`}
          title="Sair da plataforma"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Sair</span>}
          {isCollapsed && (
             <div className="absolute left-full ml-4 px-2 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity z-[110] whitespace-nowrap shadow-xl">
               Encerrar Sessão
             </div>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
