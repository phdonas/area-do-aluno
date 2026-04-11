'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { ensureAdmin } from '@/lib/auth-check'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function upsertProfessor(formData: FormData) {
  await ensureAdmin()
  const supabase = createAdminClient()

  const id = formData.get('id') as string
  const nome = formData.get('nome') as string
  const biografia = formData.get('biografia') as string
  const avatar_url = formData.get('avatar_url') as string
  const video_url = formData.get('video_url') as string
  const site_url = formData.get('site_url') as string
  
  let links = []
  try {
    const linksRaw = formData.get('links') as string
    links = JSON.parse(linksRaw || '[]')
  } catch (e) {
    console.error('Erro ao processar links do professor:', e)
  }

  const payload = {
    nome,
    biografia,
    avatar_url,
    video_url,
    site_url,
    links
  }

  if (id) {
    const { error } = await supabase.from('professores').update(payload).eq('id', id)
    if (error) throw new Error(`Erro ao atualizar professor: ${error.message}`)
  } else {
    const { error } = await supabase.from('professores').insert(payload)
    if (error) throw new Error(`Erro ao cadastrar professor: ${error.message}`)
  }

  revalidatePath('/admin/professores')
  revalidatePath('/admin')
  redirect('/admin/professores')
}

export async function deleteProfessor(id: string) {
  await ensureAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase.from('professores').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/professores')
}
