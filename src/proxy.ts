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
  
  // 1.5 Redirecionamento de Redundância (Fused Loja -> Catalogo)
  if (pathname === '/loja') {
    const url = request.nextUrl.clone()
    url.pathname = '/catalogo'
    return NextResponse.redirect(url)
  }

  // 2. LÓGICA DE PROTEÇÃO DE ROTAS (v6.1 - Catalogo e Loja Públicos)
  const isProtectedRoute = (pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/player') ||
                           pathname.startsWith('/admin') ||
                           pathname.startsWith('/meu-perfil') ||
                           pathname.startsWith('/perfil') ||
                           pathname.startsWith('/insights') ||
                           pathname.startsWith('/simuladores') ||
                           pathname.startsWith('/ferramentas') ||
                           pathname.startsWith('/questionarios') ||
                           pathname.startsWith('/definir-senha')) &&
                           !pathname.startsWith('/vitrine') &&
                           !pathname.startsWith('/catalogo') &&
                           !pathname.startsWith('/loja'); 

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('return_to', pathname)
    return NextResponse.redirect(url)
  }

  // 3. Bloqueio por Status da Conta (Bloqueado) e Verificação de Papel
  let isAdmin = false;
  let userData: any = null;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (user) {
    const { data } = await supabaseAdmin
      .from('usuarios')
      .select('status, is_admin, perfil_completo_momento2')
      .eq('id', user.id)
      .single()
    
    userData = data;
    isAdmin = !!userData?.is_admin;

    if (userData?.status === 'bloqueado') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'blocked')
      return NextResponse.redirect(url)
    }

    // 3.5 Redirecionamento para Onboarding (Momento 2)
    // Se o usuário já passou pelo cadastro inicial mas não completou o perfil estendido (e não é admin)
    if (
      userData && 
      !userData?.perfil_completo_momento2 && 
      !isAdmin && 
      !pathname.startsWith('/onboarding') && 
      !pathname.startsWith('/trocar-senha') &&
      !pathname.startsWith('/definir-senha') &&
      !pathname.startsWith('/api') &&
      isProtectedRoute
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding/perfil-profissional'
      return NextResponse.redirect(url)
    }
  }

  // 4. Bloqueio por Expiração de Acesso para Rotas de Aluno (Premium + Dashboard)
  const isStudentRoute = pathname.startsWith('/dashboard') ||
                         pathname.startsWith('/player') ||
                         pathname.startsWith('/insights') ||
                         pathname.startsWith('/simuladores') ||
                         pathname.startsWith('/ferramentas') ||
                         pathname.startsWith('/meus-certificados')

  if (user && isStudentRoute && !isAdmin) {
    const { data: activeAccess } = await supabaseAdmin
      .from('assinaturas')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('status', 'ativa')
      .or(`data_vencimento.gt.${new Date().toISOString()},data_vencimento.is.null`)
      .limit(1)

    if (!activeAccess || activeAccess.length === 0) {
      const url = request.nextUrl.clone()
      url.pathname = '/vitrine'
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

  // 6. Redirecionar se já logado (login/cadastro/registrar -> dinâmico)
  if (user && (pathname === '/login' || pathname === '/cadastro' || pathname === '/registrar' || pathname === '/')) {
    const url = request.nextUrl.clone()
    
    // 1. Admin/Staff -> Painel do Gestor
    if (isAdmin) {
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // 2. Aluno com acesso -> Dashboard
    const { data: assinaturas } = await supabaseAdmin
      .from('assinaturas')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('status', 'ativa')
      .limit(1)

    if (assinaturas && assinaturas.length > 0) {
      url.pathname = '/dashboard'
    } else {
      // 3. Visitante ou Sem Acesso -> Vitrine (Alta Conversão)
      url.pathname = '/vitrine'
    }
    
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
