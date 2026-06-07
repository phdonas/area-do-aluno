'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { processarConvitePosLogin } from '@/lib/convites'

export async function login(prevState: any, formData: FormData) {
  const emailInput = formData.get('email') as string
  const password = formData.get('password') as string
  const token = formData.get('token') as string | null

  if (!emailInput || !password) {
    return { error: 'Preencha todos os campos' }
  }

  const supabase = await createClient()
  const email = emailInput.toLowerCase().trim()

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !user) {
    return { error: 'E-mail ou senha incorretos' }
  }

  revalidatePath('/', 'layout')
  
  if (user.user_metadata?.needs_password_change === true) {
    redirect('/trocar-senha')
  }

  // Se há um convite pendente, processa a matrícula automática e leva direto ao curso
  if (token) {
    const resultado = await processarConvitePosLogin(token, user.id)
    if (resultado.success && resultado.cursoId) {
      redirect(`/player/${resultado.cursoId}`)
    }
  }

  // Verifica se é Admin para redirecionar ao Painel Gestor
  const { data: isAdmin } = await supabase.rpc('is_admin')
  const { data: userData } = await supabase.from('usuarios').select('is_staff').eq('id', user.id).single()

  if (isAdmin || userData?.is_staff) {
    redirect('/admin')
  }

  redirect('/dashboard') 
}

