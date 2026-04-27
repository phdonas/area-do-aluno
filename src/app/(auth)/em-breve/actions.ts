'use server'

import { sendEmail } from '@/lib/email-service'

export async function submitComingSoonForm(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const consent = formData.get('consent') === 'on'

  if (!consent) {
    return { error: 'Você precisa concordar com os termos da LGPD.' }
  }

  if (!name || !email) {
    return { error: 'Nome e e-mail são obrigatórios.' }
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #1a2744;">Novo Interesse na Área do Aluno</h2>
      <p>Um novo interessado preencheu o formulário de aviso para a liberação da Área do Aluno.</p>
      <div style="background: #f4f6f9; padding: 15px; border-radius: 8px;">
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 20px;">
        Este e-mail foi enviado automaticamente pelo site phdonassolo.com
      </p>
    </div>
  `

  const { error } = await sendEmail({
    to: 'contato@phdonassolo.com',
    subject: `[Pré-cadastro] Novo interessado: ${name}`,
    html
  })

  if (error) {
    console.error('Erro ao enviar e-mail:', error)
    return { error: 'Ocorreu um erro ao enviar seus dados. Por favor, tente novamente mais tarde.' }
  }

  return { success: true }
}
