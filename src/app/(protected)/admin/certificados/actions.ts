'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function saveCertificateConfig(data: any) {
  const supabase = createAdminClient()
  
  const { id, ...rest } = data

  if (id) {
    const { error } = await supabase
      .from('certificados_config')
      .update({
        ...rest,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('certificados_config')
      .insert([rest])
    if (error) throw error
  }

  revalidatePath('/admin/certificados/config')
}

export async function deleteCertificateConfig(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('certificados_config')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/admin/certificados/config')
}

export async function emitirCertificadoManual(formData: FormData) {
  const supabase = createAdminClient()
  
  const usuario_id = formData.get('usuario_id') as string
  const config_id = formData.get('config_id') as string
  
  if (!usuario_id || !config_id) throw new Error('Dados incompletos para emissão.')

  // Buscar o curso_id a partir da config
  const { data: config } = await supabase
    .from('certificados_config')
    .select('curso_id')
    .eq('id', config_id)
    .single()

  if (!config) throw new Error('Configuração de certificado não encontrada.')

  const curso_id = config.curso_id

  // Backup: Verificar se o aluno já tem certificado para este curso
  const { data: existente } = await supabase
    .from('certificados_emitidos')
    .select('id')
    .eq('usuario_id', usuario_id)
    .eq('curso_id', curso_id)
    .single()

  if (existente) throw new Error('Este aluno já possui um certificado emitido para este curso.')

  // Gerar código único de verificação (Vortex Style)
  const prefix = 'PHD'
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  const codigo = `${prefix}-${randomPart}`

  const { error } = await supabase
    .from('certificados_emitidos')
    .insert([{
      usuario_id,
      curso_id,
      config_id,
      codigo_verificacao: codigo,
      data_emissao: new Date().toISOString()
    }])

  if (error) throw error
  
  revalidatePath('/admin/certificados/emissao')
}
