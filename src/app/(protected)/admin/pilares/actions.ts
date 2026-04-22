'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    throw new Error('Acesso negado')
  }
  return supabase
}

export async function createPilar(formData: FormData) {
  const supabase = await assertAdmin()
  
  const nome = formData.get('nome') as string
  const slug = formData.get('slug') as string
  const subtitulo = formData.get('subtitulo') as string
  const icone = (formData.get('icone') as string) || 'Zap'
  const cor_badge = (formData.get('cor_badge') as string) || '#primary'
  const ordem = parseInt(formData.get('ordem') as string) || 0

  if (!nome) throw new Error('Nome é obrigatório')

  const { error } = await supabase.from('pilares').insert({
    nome,
    slug: slug || nome.toLowerCase().replace(/\s+/g, '-'),
    subtitulo,
    icone,
    cor_badge,
    ordem
  })

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/pilares')
  revalidatePath('/vitrine')
  revalidatePath('/catalogo')
  redirect('/admin/pilares')
}

export async function updatePilar(id: string, formData: FormData) {
  const supabase = await assertAdmin()
  
  const nome = formData.get('nome') as string
  const slug = formData.get('slug') as string
  const subtitulo = formData.get('subtitulo') as string
  const icone = (formData.get('icone') as string) || 'Zap'
  const cor_badge = (formData.get('cor_badge') as string) || '#primary'
  const ordem = parseInt(formData.get('ordem') as string) || 0

  if (!nome) throw new Error('Nome é obrigatório')

  const { error } = await supabase.from('pilares').update({
    nome,
    slug,
    subtitulo,
    icone,
    cor_badge,
    ordem
  }).eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/pilares')
  revalidatePath('/vitrine')
  revalidatePath('/catalogo')
  redirect('/admin/pilares')
}

export async function deletePilar(id: string) {
  const supabase = await assertAdmin()
  
  const { error } = await supabase.from('pilares').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/pilares')
  revalidatePath('/vitrine')
  revalidatePath('/catalogo')
}
