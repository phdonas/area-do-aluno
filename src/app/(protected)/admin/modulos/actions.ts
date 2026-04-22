'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth-check'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createModulo(formData: FormData) {
  await ensureAdmin()
  const supabase = await createClient()

  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const ordem = parseInt(formData.get('ordem') as string || '0')
  const curso_id_raw = formData.get('curso_id') as string
  
  const ui_layout = formData.get('ui_layout') as string || 'padrao'
  const curso_id = (curso_id_raw && curso_id_raw !== 'null' && curso_id_raw !== '') ? curso_id_raw : null

  const { error } = await supabase.from('modulos').insert({
    titulo,
    descricao,
    ordem,
    curso_id,
    ui_layout
  })

  if (error) {
    console.error('Erro ao criar módulo', error)
    throw new Error('Falha ao criar módulo')
  }

  revalidatePath('/admin/modulos')
  redirect('/admin/modulos')
}

export async function updateModulo(id: string, formData: FormData) {
  await ensureAdmin()
  const supabase = await createClient()

  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const ordem = parseInt(formData.get('ordem') as string || '0')
  const curso_id_raw = formData.get('curso_id') as string
  
  const ui_layout = formData.get('ui_layout') as string || 'padrao'
  const curso_id = (curso_id_raw && curso_id_raw !== 'null' && curso_id_raw !== '') ? curso_id_raw : null

  const { error } = await supabase.from('modulos').update({
    titulo,
    descricao,
    ordem,
    curso_id,
    ui_layout
  }).eq('id', id)

  if (error) {
    console.error('Erro ao atualizar módulo', error)
    throw new Error('Falha ao atualizar módulo')
  }

  revalidatePath('/admin/modulos')
  redirect('/admin/modulos')
}

export async function deleteModulo(id: string) {
  await ensureAdmin()
  const supabase = await createClient()

  // 1. Verificar se existem aulas vinculadas (Direto ou Pivot)
  const { count: countAulasDir } = await supabase
    .from('aulas')
    .select('*', { count: 'exact', head: true })
    .eq('modulo_id', id)

  const { count: countAulasPivot } = await supabase
    .from('modulos_aulas')
    .select('*', { count: 'exact', head: true })
    .eq('modulo_id', id)

  if ((countAulasDir && countAulasDir > 0) || (countAulasPivot && countAulasPivot > 0)) {
    throw new Error('Não é possível excluir um módulo que possui aulas cadastradas. Desvincule ou exclua as aulas primeiro.')
  }

  // 2. Verificar se está vinculado a algum curso (Tabela Pivot ou Direto)
  const { count: countCursos } = await supabase
    .from('cursos_modulos')
    .select('*', { count: 'exact', head: true })
    .eq('modulo_id', id)

  if (countCursos && countCursos > 0) {
    throw new Error('Não é possível excluir um módulo que está vinculado a um ou mais cursos.')
  }

  const { error } = await supabase.from('modulos').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar módulo', error)
    throw new Error('Falha ao deletar módulo: ' + error.message)
  }

  revalidatePath('/admin/modulos')
}

// Action para adicionar multiplas aulas (via pivot)
export async function associarMultiplasAulasModulo(moduloId: string, aulaIds: string[], startOrdem: number) {
  const supabase = await createClient()
  const inserts = aulaIds.map((aula_id, index) => ({
    modulo_id: moduloId,
    aula_id,
    ordem: startOrdem + index
  }))
  await supabase.from('modulos_aulas').insert(inserts)
  revalidatePath(`/admin/modulos/${moduloId}`)
}

export async function desassociarAulaModulo(moduloId: string, aulaId: string) {
  const supabase = await createClient()
  await supabase.from('modulos_aulas').delete().match({ modulo_id: moduloId, aula_id: aulaId })
  revalidatePath(`/admin/modulos/${moduloId}`)
}

export async function reordenarAulaModuloPivot(moduloId: string, aulaId: string, novaOrdem: number) {
  await ensureAdmin()
  const supabase = await createClient()
  
  // 1. Pegar o estado atual das aulas no módulo
  const { data: aulasPivot } = await supabase
    .from('modulos_aulas')
    .select('aula_id, ordem')
    .eq('modulo_id', moduloId)

  const { data: aulasDiretas } = await supabase
    .from('aulas')
    .select('id, ordem')
    .eq('modulo_id', moduloId)

  // 2. Unificar e ordenar pela ordem atual
  let lista = [
    ...(aulasPivot || []).map(p => ({ id: p.aula_id, ordem: p.ordem })),
    ...(aulasDiretas || []).map(d => ({ id: d.id, ordem: d.ordem }))
  ].sort((a, b) => a.ordem - b.ordem)

  // 3. Remover e reinserir na nova posição
  const itemIndex = lista.findIndex(l => l.id === aulaId)
  if (itemIndex === -1) return

  const [item] = lista.splice(itemIndex, 1)
  const targetIndex = Math.max(0, Math.min(novaOrdem - 1, lista.length))
  lista.splice(targetIndex, 0, item)

  // 4. Delegar para a função de lista que garante o sequencial 1..N
  const idsOrdenados = lista.map(l => l.id)
  return reordenarAulasModuloLista(moduloId, idsOrdenados)
}

/**
 * Função Definitiva para Reordenação de Módulo
 * Garante que todas as aulas do módulo recebam uma ordem sequencial (1, 2, 3...)
 * sem duplicidades, independente do tipo de vínculo (Direto ou Pivot).
 */
export async function reordenarAulasModuloLista(moduloId: string, idsOrdenados: string[]) {
  await ensureAdmin()
  const supabase = await createClient()

  // Executamos as atualizações em um loop. 
  // Nota: Para grandes volumes, o ideal seria uma RPC em PL/pgSQL para garantir atomicidade.
  // Como módulos costumam ter < 50 aulas, o impacto de rede é aceitável aqui.
  
  const updates = idsOrdenados.map(async (aulaId, index) => {
    const seqOrdem = index + 1

    // Tentamos atualizar em ambas as tabelas. 
    // O Supabase irá ignorar se o registro não existir (0 rows affected).
    const upd1 = supabase
      .from('modulos_aulas')
      .update({ ordem: seqOrdem })
      .match({ modulo_id: moduloId, aula_id: aulaId })

    const upd2 = supabase
      .from('aulas')
      .update({ ordem: seqOrdem })
      .eq('id', aulaId)
      .eq('modulo_id', moduloId)

    return Promise.all([upd1, upd2])
  })

  await Promise.all(updates)

  revalidatePath(`/admin/modulos/${moduloId}`)
  revalidatePath('/admin/modulos')
}

export async function desassociarAulaDireta(moduloId: string, aulaId: string) {
  const supabase = await createClient()
  // "Desassociar" from direct means setting modulo_id to null (making it global)
  await supabase.from('aulas').update({ modulo_id: null }).eq('id', aulaId)
  revalidatePath(`/admin/modulos/${moduloId}`)
}
