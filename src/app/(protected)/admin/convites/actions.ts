'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { enviarEmailComunicacao } from '@/lib/mail'

export async function criarConvite(data: { email: string; curso_id?: string; plano_tipo?: string; origem: string }) {
  const supabase = createAdminClient()

  const email = data.email.toLowerCase().trim()

  // 1. Verifica se já possui convite pendente
  const { data: existente } = await supabase
    .from('convites_matricula')
    .select('id')
    .eq('email', email)
    .eq('usado', false)
    .maybeSingle()

  if (existente) {
    return { error: 'Este e-mail já possui um convite pendente.' }
  }

  // 2. Cria o convite
  const token = crypto.randomUUID()
  const { error } = await supabase.from('convites_matricula').insert({
    email,
    curso_id: data.curso_id || null,
    plano_tipo: data.plano_tipo || 'venda_direta',
    origem: data.origem,
    token,
    usado: false
  })

  if (error) {
    console.error('Erro ao criar convite:', error)
    return { error: 'Falha ao gravar convite no banco.' }
  }

  // 3. Buscar nome do curso para o e-mail
  let cursoNome = ''
  if (data.curso_id) {
    const { data: curso } = await supabase.from('cursos').select('titulo').eq('id', data.curso_id).single()
    cursoNome = curso?.titulo || ''
  }

  // 4. Enviar E-mail
  const { error: mailError } = await enviarEmailComunicacao({
    email,
    token,
    cursoNome,
    tipo: 'convite'
  })

  // 5. Log
  await supabase.from('logs_matriculas').insert({
    evento: 'convite_manual_criado',
    curso_id: data.curso_id || null,
    origem: 'admin_panel',
    detalhes: { email_aluno: email, token, mail_sent: !mailError }
  })

  revalidatePath('/admin/convites')
  return { success: true, token }
}

export async function importarCSVContatos(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'Arquivo CSV ausente.' }

  const text = await file.text()
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.includes('@'))
  
  const supabase = createAdminClient()
  let successCount = 0

  for (const emailRaw of lines) {
    const res = await criarConvite({
      email: emailRaw,
      origem: 'importacao_csv'
    })
    if (!res.error) successCount++
  }

  revalidatePath('/admin/convites')
  return { success: true, successCount }
}
