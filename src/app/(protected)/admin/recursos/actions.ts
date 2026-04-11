'use server'

import { createClient } from '@/lib/supabase/server'
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
  revalidatePath('/admin/')
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
  
  // Pegando a imagem (thumb_url) da store, para simplificar vamos apenas gerir o upload se vier arquivo
  let thumb_url = null
  const arquivo_capa = formData.get('capa_image') as File | null
  
  if (arquivo_capa && arquivo_capa.size > 0) {
    const fileExt = arquivo_capa.name.split('.').pop()
    const fileName = `recursos/${Date.now()}.${fileExt}`
    
    // Upload image to Supabase if you have 'images' bucket. 
    // Pra compatibilidade com setup padrão, salvamos num bucket genérico como 'aulas-arquivos'
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

  const { data: recurso, error } = await supabase.from('recursos').insert({
    titulo,
    descricao,
    arquivo_url,
    tipo,
    abertura_tipo,
    status,
    ...(thumb_url && { thumb_url })
  }).select('id').single()

  if (error || !recurso) {
    console.error('Erro ao criar recurso:', error)
    throw new Error('Falha ao criar o recurso')
  }

  revalidatePath('/admin/recursos')
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

  let dataObj: any = {
    titulo,
    descricao,
    arquivo_url,
    tipo,
    abertura_tipo,
    status
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

  const { error } = await supabase.from('recursos').update(dataObj).eq('id', id)

  if (error) {
    console.error('Erro ao atualizar recurso:', error)
    throw new Error('Falha ao atualizar o recurso')
  }

  revalidatePath('/admin/recursos')
  redirect('/admin/recursos')
}
