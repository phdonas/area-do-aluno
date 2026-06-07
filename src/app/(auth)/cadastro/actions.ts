'use server'

import { createClient } from '@/lib/supabase/server'
import { processarConvitePosLogin } from '@/lib/convites'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function cadastrarUsuario(prevState: any, formData: FormData) {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const token = formData.get('token') as string // Do convite
  const aceitaTermos = formData.get('aceitaTermos') as string
  const aceitaMarketing = formData.get('aceitaMarketing') as string

  // Validações Básicas
  if (!nome || !email || !password) {
    return { error: 'Preencha todos os campos obrigatórios' }
  }

  if (!aceitaTermos) {
    return { error: 'Você precisa aceitar os Termos de Serviço' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres' }
  }

  const supabase = await createClient()

  // 1. Criar o usuário no Supabase Auth
  // Se houver token, o email já está fixo no convite (o form deve ser readonly para o email)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nome,
        needs_password_change: false, // Se o próprio aluno está criando, já sabe a senha
        aceita_termos: true,
        aceita_marketing: aceitaMarketing === 'on'
      },
    },
  })

  if (signUpError) {
    return { error: 'Erro ao criar conta: ' + signUpError.message }
  }

  const userId = signUpData.user?.id

  // 2. Se houver um token de convite, processar a matrícula automática
  if (token && userId) {
    await processarConvitePosLogin(token, userId)
  }

  // Se tudo ok, redireciona para o login ou dashboard (se auto-logado)
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
