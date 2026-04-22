'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureAdmin } from '@/lib/auth-check'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteRecurso(id: string) {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('recursos').delete().eq('id', id)
  if (error) {
    console.error('Erro ao excluir recurso:', error)
    throw new Error('Falha ao excluir o recurso/ferramenta')
  }

  revalidatePath('/admin/recursos')
  revalidatePath('/vitrine')
}

export async function createRecurso(formData: FormData) {
  await ensureAdmin()
  const supabase = await createClient()

  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const arquivo_url = formData.get('arquivo_url') as string
  const tipo = formData.get('tipo') as string || 'simulador'
  const abertura_tipo = formData.get('abertura_tipo') as string || 'modal'
  const status = formData.get('status') === 'on' || formData.get('status') === 'true' ? 'ativo' : 'inativo'
  const destaque_vitrine = formData.get('destaque_vitrine') === 'on'
  
  let thumb_url = null
  const arquivo_capa = formData.get('capa_image') as File | null
  
  if (arquivo_capa && arquivo_capa.size > 0) {
    const fileExt = arquivo_capa.name.split('.').pop()
    const fileName = `recursos/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('aulas-arquivos')
      .upload(fileName, arquivo_capa)

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('aulas-arquivos')
        .getPublicUrl(fileName)
      thumb_url = publicUrl
    }
  }

  const objetivo = formData.get('objetivo') as string
  const quando_usar = formData.get('quando_usar') as string
  const como_usar = formData.get('como_usar') as string
  const resultados_esperados = formData.get('resultados_esperados') as string

  const supabaseAdmin = createAdminClient()
  const { data: recurso, error } = await supabaseAdmin.from('recursos').insert({
    titulo,
    descricao,
    arquivo_url,
    tipo,
    abertura_tipo,
    status,
    destaque_vitrine,
    objetivo,
    quando_usar,
    como_usar,
    resultados_esperados,
    ...(thumb_url && { thumb_url })
  }).select('id').single()

  if (error || !recurso) {
    console.error('Erro ao criar recurso:', error)
    throw new Error(`Falha ao criar o recurso: ${error?.message || 'Erro desconhecido'}`)
  }

  revalidatePath('/admin/recursos')
  revalidatePath('/vitrine')
  redirect('/admin/recursos')
}

export async function updateRecurso(id: string, formData: FormData) {
  await ensureAdmin()
  const supabase = await createClient()

  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const arquivo_url = formData.get('arquivo_url') as string
  const tipo = formData.get('tipo') as string || 'simulador'
  const abertura_tipo = formData.get('abertura_tipo') as string || 'modal'
  const status = formData.get('status') === 'on' || formData.get('status') === 'true' ? 'ativo' : 'inativo'
  const destaque_vitrine = formData.get('destaque_vitrine') === 'on'

  let dataObj: any = {
    titulo,
    descricao,
    arquivo_url,
    tipo,
    abertura_tipo,
    status,
    destaque_vitrine,
    objetivo: formData.get('objetivo') as string,
    quando_usar: formData.get('quando_usar') as string,
    como_usar: formData.get('como_usar') as string,
    resultados_esperados: formData.get('resultados_esperados') as string
  }

  const arquivo_capa = formData.get('capa_image') as File | null
  if (arquivo_capa && arquivo_capa.size > 0) {
    const fileExt = arquivo_capa.name.split('.').pop()
    const fileName = `recursos/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('aulas-arquivos')
      .upload(fileName, arquivo_capa)

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('aulas-arquivos')
        .getPublicUrl(fileName)
      dataObj.thumb_url = publicUrl
    }
  }

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from('recursos').update(dataObj).eq('id', id)

  if (error) {
    console.error('Erro ao atualizar recurso:', error)
    throw new Error(`Falha ao atualizar o recurso: ${error.message}`)
  }

  revalidatePath('/admin/recursos')
  revalidatePath(`/admin/recursos/${id}`)
  revalidatePath('/vitrine')
  redirect('/admin/recursos')
}
