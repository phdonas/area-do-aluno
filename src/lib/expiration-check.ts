import { createAdminClient } from './supabase/admin'
import { enviarEmailComunicacao } from './mail'

export async function processarAvisosExpiracao() {
  const supabase = createAdminClient()

  // 1. Buscar assinaturas que vencem em 7 dias
  const data7Dias = new Date()
  data7Dias.setDate(data7Dias.getDate() + 7)
  const data7DiasAmanha = new Date(data7Dias)
  data7DiasAmanha.setDate(data7DiasAmanha.getDate() + 1)

  const { data: vencendo7 } = await supabase
    .from('assinaturas')
    .select('*, usuarios(email), cursos(titulo)')
    .eq('status', 'ativa')
    .gt('data_vencimento', data7Dias.toISOString())
    .lt('data_vencimento', data7DiasAmanha.toISOString())

  // 2. Buscar assinaturas que vencem HOJE
  const hoje = new Date()
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)

  const { data: vencendoHoje } = await supabase
    .from('assinaturas')
    .select('*, usuarios(email), cursos(titulo)')
    .eq('status', 'ativa')
    .gt('data_vencimento', hoje.toISOString())
    .lt('data_vencimento', amanha.toISOString())

  const logs = []

  // Disparar e-mails para quem vence em 7 dias
  if (vencendo7) {
    for (const a of vencendo7) {
      if (a.usuarios?.email) {
        await enviarEmailComunicacao({
          email: a.usuarios.email,
          cursoNome: a.cursos?.titulo,
          tipo: 'expiracao_aviso'
        })
        logs.push(`Aviso 7 dias enviado para: ${a.usuarios.email}`)
      }
    }
  }

  // Disparar e-mails para quem vence hoje
  if (vencendoHoje) {
    for (const a of vencendoHoje) {
      if (a.usuarios?.email) {
        await enviarEmailComunicacao({
          email: a.usuarios.email,
          cursoNome: a.cursos?.titulo,
          tipo: 'expiracao_hoje'
        })
        logs.push(`Aviso HOJE enviado para: ${a.usuarios.email}`)
      }
    }
  }

  return { success: true, logs }
}
