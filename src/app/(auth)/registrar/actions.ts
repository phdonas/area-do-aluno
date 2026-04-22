'use server'

import { createClient } from '@/lib/supabase/server'

export async function registrarVisitante(prevState: any, formData: FormData) {
  const emailInput = formData.get('email') as string
  
  if (!emailInput) {
    return { error: 'O e-mail é obrigatório' }
  }

  const supabase = await createClient()
  const email = emailInput.toLowerCase().trim()

  // Fluxo de Registro via Magic Link (OTP)
  // shouldCreateUser: true garante que se não existir, ele cria o perfil no Auth
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/definir-senha`,
      shouldCreateUser: true
    }
  })

  if (error) {
    console.error('Erro no registro de visitante:', error)
    return { error: 'Não foi possível enviar o e-mail de confirmação. Verifique o endereço e tente novamente.' }
  }

  return { success: true }
}
