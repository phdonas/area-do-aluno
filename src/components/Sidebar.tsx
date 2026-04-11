'use client'

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
  Award
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  hasAccess: boolean
  userEmail?: string
}

export function Sidebar({ hasAccess, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/catalogo', label: 'Catálogo', icon: Library },
    { href: '/ferramentas', label: 'Ferramentas', icon: Zap },
    { href: '/insights', label: 'Insights', icon: Lightbulb },
    { href: '/simuladores', label: 'Simuladores IA', icon: PlaySquare },
    { href: '/meus-certificados', label: 'Certificados', icon: Award },
  ]

  return (
    <aside className="w-full md:w-64 bg-surface border-r border-border-custom flex-shrink-0 flex flex-col items-center md:items-start p-6">
      <div className="w-12 h-12 bg-gradient-to-tr from-primary-dark to-primary-light rounded-xl md:mx-0 flex items-center justify-center shadow-md shadow-primary/20 mb-8 self-center md:self-start">
        <span className="text-xl text-white font-bold tracking-tighter">PH</span>
      </div>

      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                isActive 
                  ? 'text-text-primary bg-primary/10 shadow-sm border border-primary/10' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Gatilho da Central de Comando */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-bar'))}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/5 font-medium transition-colors group"
        >
          <Command className="w-5 h-5 group-hover:text-primary" />
          <span>Comandos</span>
          <span className="ml-auto text-[10px] bg-black/5 px-1.5 py-0.5 rounded border border-black/5 text-text-muted">⌘K</span>
        </button>
        
        {hasAccess && (
          <div className="pt-4 pb-2">
             <span className="px-4 text-xs font-bold uppercase tracking-wider text-primary/70">Admin Zone</span>
             <Link href="/admin" className={`mt-2 flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold border ${
                pathname.startsWith('/admin')
                  ? 'text-text-primary bg-primary/10 border-primary/30'
                  : 'text-text-primary hover:bg-primary/10 border-primary/20 bg-primary/5'
             }`}>
               <Settings className="w-5 h-5 text-primary" />
               <span>Painel Gestor</span>
             </Link>
          </div>
        )}
      </nav>

      <div className="w-full mt-auto pt-6 border-t border-border-custom space-y-2">
        <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-black/5 font-medium transition-colors">
          <Settings className="w-5 h-5" />
          <span>Perfil</span>
        </Link>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
