'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deletePacote(id: string) {
  const supabase = await createClient()

  // Como há foreign keys on delete cascade, apagar o plano apaga suas associações em planos_cursos
  const { error } = await supabase.from('planos').delete().eq('id', id)
  if (error) {
    console.error('Erro ao excluir pacote:', error)
    throw new Error('Falha ao excluir o pacote/combo')
  }

  revalidatePath('/admin/pacotes')
  revalidatePath('/admin/')
}

export async function createPacote(formData: FormData) {
  const supabase = await createClient()

  const nome = formData.get('nome') as string
  const descricao = formData.get('descricao') as string
  const preco_mensal = formData.get('preco_mensal') ? parseFloat(formData.get('preco_mensal') as string) : null
  const preco_anual = formData.get('preco_anual') ? parseFloat(formData.get('preco_anual') as string) : null
  const is_global = formData.get('is_global') === 'on'
  const ativo = formData.get('ativo') === 'on' || formData.get('ativo') === 'true'

  const { data: pacote, error } = await supabase.from('planos').insert({
    nome,
    descricao,
    preco_mensal,
    preco_anual,
    is_global,
    ativo
  }).select('id').single()

  if (error || !pacote) {
    console.error('Erro ao criar pacote:', error)
    throw new Error('Falha ao criar o pacote')
  }

  // Handle selected courses
  const cursosSelecionados = formData.getAll('cursos') as string[]
  if (!is_global && cursosSelecionados.length > 0) {
    const planosCursosData = cursosSelecionados.map(curso_id => ({
      plano_id: pacote.id,
      curso_id
    }))
    
    await supabase.from('planos_cursos').insert(planosCursosData)
  }

  revalidatePath('/admin/pacotes')
  redirect('/admin/pacotes')
}

export async function updatePacote(id: string, formData: FormData) {
  const supabase = await createClient()

  const nome = formData.get('nome') as string
  const descricao = formData.get('descricao') as string
  const preco_mensal = formData.get('preco_mensal') ? parseFloat(formData.get('preco_mensal') as string) : null
  const preco_anual = formData.get('preco_anual') ? parseFloat(formData.get('preco_anual') as string) : null
  const is_global = formData.get('is_global') === 'on'
  const ativo = formData.get('ativo') === 'on' || formData.get('ativo') === 'true'

  const { error } = await supabase.from('planos').update({
    nome,
    descricao,
    preco_mensal,
    preco_anual,
    is_global,
    ativo
  }).eq('id', id)

  if (error) {
    console.error('Erro ao atualizar pacote:', error)
    throw new Error('Falha ao atualizar o pacote')
  }

  // Handle selected courses (delete all and replace)
  await supabase.from('planos_cursos').delete().eq('plano_id', id)

  const cursosSelecionados = formData.getAll('cursos') as string[]
  if (!is_global && cursosSelecionados.length > 0) {
    const planosCursosData = cursosSelecionados.map(curso_id => ({
      plano_id: id,
      curso_id
    }))
    
    await supabase.from('planos_cursos').insert(planosCursosData)
  }

  revalidatePath('/admin/pacotes')
  redirect('/admin/pacotes')
}
