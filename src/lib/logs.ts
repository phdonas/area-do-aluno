import { createAdminClient } from './supabase/admin'

export type LogLevel = 'info' | 'sucesso' | 'aviso' | 'erro'

interface LogData {
  usuario_id?: string
  email?: string
  evento: string
  nivel?: LogLevel
  origem?: string
  detalhes?: any
}

export async function registrarLogSistema({
  usuario_id,
  email,
  evento,
  nivel = 'info',
  origem = 'SISTEMA',
  detalhes = {}
}: LogData) {
  const supabase = createAdminClient()
  
  const { error } = await supabase.from('logs_sistema').insert({
    usuario_id,
    email,
    evento,
    nivel,
    origem: origem.toUpperCase(),
    detalhes
  })

  if (error) {
    console.error(`Erro ao registrar log [${evento}]:`, error.message)
  }
}
