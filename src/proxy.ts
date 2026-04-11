import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Recupera o usuário atual de forma segura
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 2. LÓGICA DE PROTEÇÃO DE ROTAS (v6.0 Blindado)
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/player') ||
                           pathname.startsWith('/admin') ||
                           pathname.startsWith('/perfil') ||
                           pathname.startsWith('/insights') ||
                           pathname.startsWith('/simuladores') ||
                           pathname.startsWith('/ferramentas')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('return_to', pathname)
    return NextResponse.redirect(url)
  }

  // 3. Bloqueio por Status da Conta (Bloqueado) e Verificação de Papel
  let isAdmin = false;
  if (user) {
    // Usamos um cliente ADMIN aqui para evitar bloqueios de RLS no Proxy
    const supabaseAdminCheck = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: userData } = await supabaseAdminCheck
      .from('usuarios')
      .select('status, is_admin')
      .eq('id', user.id)
      .single()
    
    isAdmin = !!userData?.is_admin;

    if (userData?.status === 'bloqueado') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'blocked')
      return NextResponse.redirect(url)
    }
  }

  // 4. Bloqueio por Expiração de Acesso para Rotas Premium
  const isPremiumRoute = pathname.startsWith('/player') ||
                         pathname.startsWith('/insights') ||
                         pathname.startsWith('/simuladores') ||
                         pathname.startsWith('/ferramentas')

  if (user && isPremiumRoute && !isAdmin) {
    const { data: activeAccess } = await supabase
      .from('assinaturas')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('status', 'ativa')
      .or(`data_vencimento.gt.${new Date().toISOString()},data_vencimento.is.null`)
      .limit(1)

    if (!activeAccess || activeAccess.length === 0) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'no_active_access')
      return NextResponse.redirect(url)
    }
  }

  // 5. Troca de Senha Obrigatória (Bootstrap v5.2)
  if (
    user && 
    user.user_metadata?.needs_password_change === true && 
    !pathname.startsWith('/trocar-senha') &&
    !pathname.startsWith('/api') 
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/trocar-senha'
    return NextResponse.redirect(url)
  }

  // 4. Redirecionar se já logado (login -> dashboard)
  if (user && (pathname === '/login' || pathname === '/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets - robots, manifest, images/avatars)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
