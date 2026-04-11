import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { CommandBar } from '@/components/CommandBar'
import { Sidebar } from '@/components/Sidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const supabaseAdmin = createAdminClient()
  
  // Verifica papéis administrativos usando o cliente ADMIN (Bypass RLS para garantir acesso)
  let { data: userData } = await supabaseAdmin
    .from('usuarios')
    .select('is_admin, is_staff, senha_temporaria, status')
    .eq('id', user.id)
    .single()
  
  // Válvula de Escape / Auto-Setup para o Super Admin
  if (!userData && user.email === 'admin@phdonassolo.com') {
     const { data: created } = await supabase
       .from('usuarios')
       .upsert({ 
         id: user.id, 
         email: user.email,
         full_name: 'PH Admin',
         is_admin: true, 
         is_staff: true 
       })
       .select()
       .single()
     userData = created
  }
  
  const isAdmin = !!userData?.is_admin;
  const isStaff = !!userData?.is_staff;
  const isTemporaria = !!userData?.senha_temporaria;
  const isBlocked = userData?.status === 'bloqueado';

  if (isBlocked) {
    redirect('/login?error=account_blocked')
  }

  if (isTemporaria) {
    redirect('/trocar-senha')
  }

  // Verifica se tem pelo menos uma assinatura ativa/válida (se não for admin)
  let hasActiveAccess = isAdmin || isStaff;
  
  if (!hasActiveAccess) {
    const { data: subs } = await supabase
      .from('assinaturas')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('status', 'ativa')
      .or(`data_vencimento.gt.${new Date().toISOString()},data_vencimento.is.null`)
      .limit(1)
    
    if (subs && subs.length > 0) {
      hasActiveAccess = true;
    }
  }

  const hasAccess = isAdmin || isStaff;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar hasAccess={hasAccess} userEmail={user.email} />


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-y-auto relative">
        {/* Header */}
        <header className="h-16 border-b border-border-custom bg-surface/50 apple-blur sticky top-0 z-10 flex items-center justify-end px-8">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 border-l border-border-custom pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-primary capitalize">{userData?.full_name || user.email?.split('@')[0]}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-primary">
                  {isAdmin ? 'Administrador' : isStaff ? 'Suporte PH' : 'Aluno da Academia'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center text-primary font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-6 md:p-10">
          {children}
        </div>
      </div>
      <CommandBar />
    </div>
  )
}
