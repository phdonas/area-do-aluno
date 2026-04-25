'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { CommandBar } from '@/components/CommandBar'
import { Sidebar } from '@/components/Sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPlayerPage = pathname?.includes('/player/')
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Lista de e-mails que são "Super Admins" por padrão na interface
  // Isso garante consistência visual mesmo em falhas de rede ou RLS temporário
  const SUPER_ADMINS = ['admin@phdonassolo.com', 'ph@phdonassolo.com']

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          window.location.href = '/login'
          return
        }
        setUser(authUser)

        // Busca o perfil com tratamento de erro silencioso para evitar quebra da página
        const { data: profile } = await supabase
          .from('usuarios')
          .select('is_admin, is_staff, senha_temporaria, status, full_name, nome')
          .eq('id', authUser.id)
          .single()
        
        setUserData(profile)

        if (profile?.status === 'bloqueado') {
          window.location.href = '/login?error=account_blocked'
        }
        if (profile?.senha_temporaria) {
          window.location.href = '/trocar-senha'
        }
      } catch (err) {
        console.error('Erro ao validar usuário no layout:', err)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  if (loading) return null

  // Lógica Redundante de Acesso: Confia no Banco de Dados OU na lista de Super Admins
  const isSuperAdmin = user?.email && SUPER_ADMINS.includes(user.email.toLowerCase())
  const isAdmin = isSuperAdmin || !!userData?.is_admin
  const isStaff = !!userData?.is_staff
  const hasAccess = isAdmin || isStaff
  // Simplificado para o client, mas mantendo a lógica de acesso
  const hasSubscription = true 

  if (isPlayerPage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
        <CommandBar />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-x-hidden">
      <Sidebar hasAccess={hasAccess} hasSubscription={hasSubscription} userEmail={user?.email} />

      <div className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-y-auto md:overflow-x-hidden relative">
        <header className="h-16 border-b border-border-custom bg-surface/50 apple-blur sticky top-0 z-10 flex items-center justify-end px-8">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/perfil" className="flex items-center gap-3 border-l border-border-custom pl-4 group/user transition-all hover:bg-primary/5 rounded-2xl px-2 py-1">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-primary capitalize group-hover/user:text-primary transition-colors">
                  {userData?.full_name || userData?.nome || user?.email?.split('@')[0]}
                </p>
                <p className="text-[10px] uppercase font-black tracking-widest text-primary">
                  {isAdmin ? 'Administrador' : isStaff ? 'Suporte PH' : 'Aluno da Academia'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover/user:bg-primary group-hover/user:text-white transition-all shadow-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10">
          {children}
        </div>
      </div>
      <CommandBar />
    </div>
  )
}
