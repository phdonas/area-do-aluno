import { createAdminClient } from './supabase/admin'
import { CONVITE_EXPIRACAO_DIAS } from './constants'

/**
 * Processa um convite pendente após autenticação (cadastro novo ou login de aluno já existente):
 * valida o token, efetiva a matrícula no curso vinculado e marca o convite como usado.
 */
export async function processarConvitePosLogin(token: string, userId: string) {
  const supabaseAdmin = createAdminClient()

  const { data: convite, error } = await supabaseAdmin
    .from('convites_matricula')
    .select('*')
    .eq('token', token)
    .eq('usado', false)
    .maybeSingle()

  if (error || !convite) {
    return { error: 'Este convite é inválido ou já foi utilizado.' }
  }

  if (convite.revogado) {
    return { error: 'Este convite foi revogado.' }
  }

  const dataExpiracao = new Date(convite.created_at)
  dataExpiracao.setDate(dataExpiracao.getDate() + CONVITE_EXPIRACAO_DIAS)
  if (dataExpiracao < new Date()) {
    return { error: `Este convite expirou (validade de ${CONVITE_EXPIRACAO_DIAS} dias).` }
  }

  if (convite.curso_id) {
    const { data: plano } = await supabaseAdmin
      .from('planos')
      .select('id')
      .eq('is_global', convite.plano_tipo === 'vitalicio' || convite.plano_tipo === '1ano' || convite.plano_tipo === 'plano_vortex')
      .limit(1)
      .maybeSingle()

    await supabaseAdmin.from('assinaturas').insert({
      usuario_id: userId,
      plano_id: plano?.id,
      curso_id: convite.curso_id,
      status: 'ativa',
      data_inicio: new Date().toISOString(),
      data_vencimento: convite.plano_tipo === 'vitalicio'
        ? '9999-12-31T23:59:59Z'
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        via_convite: true,
        convite_id: convite.id,
        origem: convite.origem
      }
    })

    await supabaseAdmin.from('logs_matriculas').insert({
      usuario_id: userId,
      evento: 'matricula_via_convite',
      curso_id: convite.curso_id,
      origem: 'workflow_login_pos_convite',
      detalhes: { token, origem_convite: convite.origem }
    })
  }

  await supabaseAdmin
    .from('convites_matricula')
    .update({
      usado: true,
      usuario_id: userId,
      aceito_em: new Date().toISOString()
    })
    .eq('id', convite.id)

  return { success: true as const, cursoId: convite.curso_id as string | null }
}
