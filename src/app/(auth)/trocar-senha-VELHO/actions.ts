'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function trocarSenha(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Preencha todos os campos' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres' }
  }

  const supabase = await createClient()

  // Atualiza a senha e desmarca o flag de troca obrigatória
  const { error } = await supabase.auth.updateUser({
    password: password,
    data: { needs_password_change: false }
  })

  if (error) {
    return { error: 'Erro ao atualizar senha: ' + error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
