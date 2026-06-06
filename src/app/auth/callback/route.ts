import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'recovery' | 'signup' | 'email' | 'magiclink' | null
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[auth/callback] chamado')
  console.log('[auth/callback] code presente:', !!code)
  console.log('[auth/callback] token_hash presente:', !!token_hash)
  console.log('[auth/callback] type:', type)
  console.log('[auth/callback] origin:', origin)

  const supabase = await createClient()

  // Fluxo PKCE — parâmetro code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth/callback] exchange (PKCE) error:', error?.message ?? 'nenhum')
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/confirmar-senha`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Fluxo OTP/token_hash — parâmetro token_hash
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    console.log('[auth/callback] verifyOtp (token_hash) error:', error?.message ?? 'nenhum')
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/confirmar-senha`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.log('[auth/callback] sem code nem token_hash válidos — fallback')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
