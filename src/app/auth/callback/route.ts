import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[auth/callback] chamado')
  console.log('[auth/callback] code presente:', !!code)
  console.log('[auth/callback] type:', type)
  console.log('[auth/callback] origin:', origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth/callback] error do exchange:', error?.message ?? 'nenhum')
    if (!error) {
      if (type === 'recovery') {
        console.log('[auth/callback] recovery ok — redirecionando para /confirmar-senha')
        return NextResponse.redirect(`${origin}/confirmar-senha`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  } else {
    console.log('[auth/callback] code ausente — caindo no fallback')
  }

  // Fallback em caso de erro
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
