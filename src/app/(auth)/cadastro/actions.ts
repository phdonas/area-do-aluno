'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function cadastrarUsuario(prevState: any, formData: FormData) {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const token = formData.get('token') as string // Do convite

  // Validações Básicas
  if (!nome || !email || !password) {
    return { error: 'Preencha todos os campos obrigatórios' }
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
      },
    },
  })

  if (signUpError) {
    return { error: 'Erro ao criar conta: ' + signUpError.message }
  }

  const userId = signUpData.user?.id

  // 2. Se houver um token de convite, processar a matrícula automática
  if (token && userId) {
    // Busca o convite
    const { data: convite, error: conviteError } = await supabase
      .from('convites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pendente')
      .single()

    if (convite && !conviteError) {
      // 2.1 Efetiva a matrícula se o convite tiver um curso_id
      if (convite.curso_id) {
         // O sistema de assinaturas usa planos. 
         // O Blueprint diz que convites presenciais têm "plano_tipo".
         // Precisamos mapear para um plano existente ou criar uma assinatura direta.
         
         // Para este MVP, vamos buscar um plano que seja do tipo coerente
         const { data: plano } = await supabase
           .from('planos')
           .select('id')
           .eq('is_global', convite.plano_tipo === 'vitalicio' || convite.plano_tipo === '1ano')
           .limit(1)
           .single()

         await supabase.from('assinaturas').insert({
           usuario_id: userId,
           plano_id: plano?.id,
           status: 'ativa',
           data_inicio: new Date().toISOString(),
           data_vencimento: convite.plano_tipo === 'vitalicio' ? '9999-12-31T23:59:59Z' : new Date(Date.now() + 365*24*60*60*1000).toISOString(),
           metadata: { 
             via_convite: true, 
             convite_id: convite.id,
             origem: convite.origem 
           }
         })

         // LOG de Matrícula (Task 1.3)
         await supabase.from('logs_matriculas').insert({
           usuario_id: userId,
           evento: 'matricula',
           curso_id: convite.curso_id,
           origem: 'convite',
           detalhes: { token, origem_convite: convite.origem }
         })
      }

      // 2.2 Marca convite como aceito
      await supabase
        .from('convites')
        .update({ 
           status: 'aceito', 
           aceito_em: new Date().toISOString(),
           user_id: userId 
        })
        .eq('id', convite.id)
    }
  }

  // Se tudo ok, redireciona para o login ou dashboard (se auto-logado)
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
