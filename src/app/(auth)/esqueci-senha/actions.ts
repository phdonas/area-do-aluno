'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function resetPassword(prevState: any, formData: FormData) {
  const emailInput = formData.get('email') as string
  
  if (!emailInput) {
    return { error: 'Por favor, insira o seu e-mail.' }
  }

  const email = emailInput.toLowerCase().trim()
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/confirmar-senha`,
  })

  if (error) {
    console.error('Erro ao resetar senha:', error.message)
    if (error.message.includes('rate limit')) {
      return { error: 'Aguarde 1 minuto antes de solicitar um novo link de recuperação.' }
    }
    return { error: error.message || 'Erro ao enviar e-mail de recuperação.' }
  }

  return { success: true }
}
