'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email-service'

export async function notificarPagamentoManual(formData: {
  cursoId: string,
  planoId: string,
  metodo: string,
  pais: string,
  valor: number,
  moeda: string,
  comprovanteUrl?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado.' }
    }

    const supabaseAdmin = createAdminClient()

    // 1. Busca dados do curso para o e-mail
    const { data: curso } = await supabaseAdmin
      .from('cursos')
      .select('titulo')
      .eq('id', formData.cursoId)
      .single()

    // 2. Busca e-mail do admin nas configurações
    const { data: configFin } = await supabaseAdmin
      .from('configuracoes_financeiras')
      .select('email_notificacao_admin')
      .single()

    const adminEmail = configFin?.email_notificacao_admin || 'admin@phdonassolo.com'

    // 3. Registra a assinatura com status 'pendente'
    const { data: assinatura, error: errorAssinatura } = await supabaseAdmin
      .from('assinaturas')
      .insert({
        usuario_id: user.id,
        plano_id: formData.planoId,
        curso_id: formData.cursoId,
        status: 'pendente', // Bloqueado até aprovação
        status_pagamento: 'pendente',
        metodo_pagamento: formData.metodo,
        pais_origem: formData.pais,
        valor_pago: formData.valor,
        moeda: formData.moeda,
        comprovante_url: formData.comprovanteUrl,
        data_inicio: new Date().toISOString(),
        data_vencimento: new Date().toISOString(), // Vencimento agora (bloqueado)
        metadata: { manual: true, alert_sent: true }
      })
      .select()
      .single()

    if (errorAssinatura) {
      console.error('Erro ao registrar intenção de pagamento:', errorAssinatura)
      return { error: 'Ocorreu um erro ao registrar seu aviso de pagamento.' }
    }

    // 4. Envia e-mail de alerta para o admin
    await sendEmail({
      to: adminEmail,
      subject: `[PLANO MANUAL] Novo Aviso de Pagamento - ${user.email}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #f59e0b;">Novo Pagamento Aguardando Conferência</h2>
          <p><strong>Aluno:</strong> ${user.email}</p>
          <p><strong>Treinamento:</strong> ${curso?.titulo}</p>
          <p><strong>Método:</strong> ${formData.metodo.toUpperCase()}</p>
          <p><strong>Valor:</strong> ${formData.moeda} ${formData.valor}</p>
          <hr />
          <p><strong>Ação Necessária:</strong> Confira sua conta bancária e acesse o painel administrativo para liberar o acesso.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/matriculas" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 5px;">Acessar Painel de Aprovação</a>
        </div>
      `
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('Erro crítico no aviso manual:', err)
    return { error: 'Erro inesperado ao processar aviso.' }
  }
}
