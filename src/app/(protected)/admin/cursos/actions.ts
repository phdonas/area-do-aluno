'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { ensureAdmin } from '@/lib/auth-check'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Helper para limpar preços vindos do formulário (Ex: "R$ 997,00" -> "997.00")
function cleanPrice(priceRaw: string | null): string | null {
  if (!priceRaw || priceRaw.trim() === '') return null
  const cleaned = priceRaw.replace(/[^\d.,-]/g, '')
  const normalized = cleaned.replace(',', '.')
  return normalized || null
}

export async function toggleAulaGratis(aulaId: string, isGratis: boolean, cursoId: string) {
  await ensureAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('aulas')
    .update({ is_gratis: isGratis })
    .eq('id', aulaId)

  if (error) {
    console.error('Erro ao alternar status grátis da aula:', error)
    throw new Error('Falha ao atualizar aula')
  }

  revalidatePath(`/admin/cursos/${cursoId}`)
  revalidatePath(`/player/${cursoId}/${aulaId}`)
  revalidatePath(`/catalogo/${cursoId}`)
}

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export async function createCurso(formData: FormData) {
  await ensureAdmin()
  const supabase = createAdminClient()

  const titulo = formData.get('titulo') as string
  let slug = formData.get('slug') as string
  if (!slug || slug.trim() === '') {
    slug = slugify(titulo)
  }
  const descricao = formData.get('descricao') as string
  const thumb_url = formData.get('thumb_url') as string
  const status = formData.get('status') as string || 'rascunho'
  const destaque_vitrine = formData.get('destaque_vitrine') === 'on'
  
  const objetivos = formData.get('objetivos') as string
  const publico_alvo = formData.get('publico_alvo') as string
  const resultados_esperados = formData.get('resultados_esperados') as string
  const preco = formData.get('preco') as string
  const preco_eur = formData.get('preco_eur') as string
  const formas_pagamento = formData.get('formas_pagamento') as string

  const { data, error } = await supabase.from('cursos').insert({
    titulo,
    slug,
    descricao,
    thumb_url,
    status,
    destaque_vitrine,
    objetivos: formData.get('objetivos') as string,
    publico_alvo: formData.get('publico_alvo') as string,
    resultados_esperados: formData.get('resultados_esperados') as string,
    ementa_resumida: formData.get('ementa_resumida') as string,
    pre_requisitos: formData.get('pre_requisitos') as string,
    video_vendas_url: formData.get('video_vendas_url') as string,
    garantia_dias: parseInt(formData.get('garantia_dias') as string || '7'),
    faq: JSON.parse(formData.get('faq') as string || '[]'),
    professor_id: formData.get('professor_id') as string || null,
    preco: cleanPrice(formData.get('preco') as string),
    preco_eur: cleanPrice(formData.get('preco_eur') as string),
    formas_pagamento
  }).select('id').single()

  if (error) {
    console.error('Erro ao criar curso', error)
    throw new Error('Erro na Base de Dados: ' + error.message)
  }

  // Redirecionamos direto para a página de edição (onde estará o montador N:N)
  revalidatePath('/admin/cursos')
  revalidatePath('/vitrine')
  redirect(`/admin/cursos/${data.id}`)
}

export async function updateCursoBasics(id: string, formData: FormData) {
  await ensureAdmin()
  const supabase = createAdminClient()

  const titulo = formData.get('titulo') as string
  let slug = formData.get('slug') as string
  if (!slug || slug.trim() === '') {
    slug = slugify(titulo)
  }
  const descricao = formData.get('descricao') as string
  const thumb_url = formData.get('thumb_url') as string
  const status = formData.get('status') as string
  const destaque_vitrine = formData.get('destaque_vitrine') === 'on'

  const objetivos = formData.get('objetivos') as string
  const publico_alvo = formData.get('publico_alvo') as string
  const resultados_esperados = formData.get('resultados_esperados') as string
  const preco = formData.get('preco') as string
  const preco_eur = formData.get('preco_eur') as string
  const formas_pagamento = formData.get('formas_pagamento') as string

  const { error } = await supabase.from('cursos').update({
    titulo,
    slug,
    descricao,
    thumb_url,
    status,
    destaque_vitrine,
    objetivos: formData.get('objetivos') as string,
    publico_alvo: formData.get('publico_alvo') as string,
    resultados_esperados: formData.get('resultados_esperados') as string,
    ementa_resumida: formData.get('ementa_resumida') as string,
    pre_requisitos: formData.get('pre_requisitos') as string,
    video_vendas_url: formData.get('video_vendas_url') as string,
    garantia_dias: parseInt(formData.get('garantia_dias') as string || '7'),
    faq: JSON.parse(formData.get('faq') as string || '[]'),
    professor_id: formData.get('professor_id') as string || null,
    preco: cleanPrice(formData.get('preco') as string),
    preco_eur: cleanPrice(formData.get('preco_eur') as string),
    formas_pagamento
  }).eq('id', id)

  if (error) {
    console.error('Erro ao atualizar curso', error)
    throw new Error('Erro na Base de Dados: ' + error.message)
  }

  revalidatePath('/admin/cursos')
  revalidatePath(`/admin/cursos/${id}`)
  revalidatePath('/vitrine')
}

export async function deleteCurso(id: string) {
  await ensureAdmin()
  const supabase = createAdminClient()

  // 1. Verificação de Blindagem: Não deletar se houver módulos ementados
  const { count: countModulos } = await supabase
    .from('cursos_modulos')
    .select('*', { count: 'exact', head: true })
    .eq('curso_id', id)

  if (countModulos && countModulos > 0) {
    return { success: false, error: 'Não é possível excluir um curso que possui módulos cadastrados na ementa. Remova os módulos primeiro ou inative o curso.' }
  }

  // 2. Verificação de Alunos (Assinaturas)
  const { count: countMatriculas } = await supabase
    .from('assinaturas')
    .select('*', { count: 'exact', head: true })
    .eq('curso_id', id)

  if (countMatriculas && countMatriculas > 0) {
    return { success: false, error: 'Não é possível excluir um curso que possui alunos matriculados (ativos ou inativos).' }
  }

  // Se passou pelas travas, remove relações pivot de menor impacto
  await supabase.from('cursos_pilares').delete().eq('curso_id', id)
  await supabase.from('planos_cursos').delete().eq('curso_id', id)
  
  // 4. Finalmente, deletar o curso
  const { error } = await supabase.from('cursos').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar curso', error)
    return { success: false, error: `Falha ao deletar curso: ${error.message}` }
  }

  revalidatePath('/admin/cursos')
  revalidatePath('/vitrine')
  return { success: true }
}

// Action para associar pilar
export async function togglePilarCurso(cursoId: string, pilarId: string, associar: boolean) {
  await ensureAdmin()
  const supabase = createAdminClient()
  if (associar) {
    await supabase.from('cursos_pilares').insert({ curso_id: cursoId, pilar_id: pilarId })
  } else {
    await supabase.from('cursos_pilares').delete().match({ curso_id: cursoId, pilar_id: pilarId })
  }
  revalidatePath(`/admin/cursos/${cursoId}`)
}

// Helper para normalizar a ordem de todos os módulos de um curso
async function normalizeModulosOrdemInternal(cursoId: string, supabase: any) {
  const { data: currentModulos } = await supabase
    .from('cursos_modulos')
    .select('modulo_id')
    .eq('curso_id', cursoId)
    .order('ordem', { ascending: true })
    .order('modulo_id', { ascending: true })

  if (!currentModulos) return

  for (let i = 0; i < currentModulos.length; i++) {
    await supabase
      .from('cursos_modulos')
      .update({ ordem: i + 1 })
      .match({ curso_id: cursoId, modulo_id: currentModulos[i].modulo_id })
  }
}

// Action para adicionar módulo e ordenar
export async function associarModuloCurso(cursoId: string, moduloId: string, ordem: number) {
  await ensureAdmin()
  const supabase = createAdminClient()
  await supabase.from('cursos_modulos').insert({ curso_id: cursoId, modulo_id: moduloId, ordem })
  revalidatePath(`/admin/cursos/${cursoId}`)
}

export async function associarMultiplosModulosCurso(cursoId: string, moduloIds: string[], startOrdem: number) {
  await ensureAdmin()
  const supabase = createAdminClient()
  const inserts = moduloIds.map((modulo_id, index) => ({
    curso_id: cursoId,
    modulo_id,
    ordem: startOrdem + index
  }))
  await supabase.from('cursos_modulos').insert(inserts)
  
  // Normaliza para garantir que não haja duplicatas ou buracos
  await normalizeModulosOrdemInternal(cursoId, supabase)
  
  revalidatePath(`/admin/cursos/${cursoId}`)
}

export async function desassociarModuloCurso(cursoId: string, moduloId: string) {
  await ensureAdmin()
  const supabase = createAdminClient()
  await supabase.from('cursos_modulos').delete().match({ curso_id: cursoId, modulo_id: moduloId })
  
  // Normaliza após remover
  await normalizeModulosOrdemInternal(cursoId, supabase)
  
  revalidatePath(`/admin/cursos/${cursoId}`)
}

export async function reordenarModuloCurso(cursoId: string, moduloIds: string[]) {
  await ensureAdmin()
  const supabase = createAdminClient()
  
  // Atualiza todos os módulos passados com a nova ordem sequencial
  for (let i = 0; i < moduloIds.length; i++) {
    const { error } = await supabase
      .from('cursos_modulos')
      .update({ ordem: i + 1 })
      .match({ curso_id: cursoId, modulo_id: moduloIds[i] })
    
    if (error) console.error(`Erro ao ordenar módulo ${moduloIds[i]}:`, error)
  }

  revalidatePath(`/admin/cursos/${cursoId}`)
}

export async function criarModuloExclusivo(cursoId: string, titulo: string, nextOrdem: number) {
  await ensureAdmin()
  const supabase = createAdminClient()
  
  // 1. Cria o módulo marcado com curso_id (Isolado/Legado)
  const { data: novoModulo, error: modErr } = await supabase
    .from('modulos')
    .insert({ titulo, curso_id: cursoId })
    .select('id')
    .single()
    
  if (modErr || !novoModulo) {
    console.error('Erro ao criar módulo exclusivo', modErr)
    throw new Error('Falha ao criar módulo exclusivo')
  }

  // 2. Coloca ele na tabela pivot para gerenciar a ordem junto com os globais
  await supabase.from('cursos_modulos').insert({
    curso_id: cursoId,
    modulo_id: novoModulo.id,
    ordem: nextOrdem
  })

  // 3. Normaliza tudo
  await normalizeModulosOrdemInternal(cursoId, supabase)

  revalidatePath(`/admin/cursos/${cursoId}`)
}

export async function reordenarAulaModulo(cursoId: string, moduloId: string, aulaIds: string[]) {
  await ensureAdmin()
  const supabase = createAdminClient()

  for (let i = 0; i < aulaIds.length; i++) {
    const aulaId = aulaIds[i]
    // Tenta atualizar na tabela direta de aulas
    const { data: directMatch } = await supabase
      .from('aulas')
      .select('id')
      .eq('id', aulaId)
      .eq('modulo_id', moduloId)
      .single()

    if (directMatch) {
      await supabase.from('aulas').update({ ordem: i + 1 }).eq('id', aulaId)
    } else {
      // Se não for direta, tenta na tabela pivot modulos_aulas
      await supabase.from('modulos_aulas').update({ ordem: i + 1 }).match({ modulo_id: moduloId, aula_id: aulaId })
    }
  }

  revalidatePath(`/admin/cursos/${cursoId}`)
}

export async function separarModuloCurso(cursoId: string, originalModuloId: string, novoTitulo: string) {
  await ensureAdmin()
  const supabase = createAdminClient()

  // 1. Pegar a ordem do módulo original neste curso
  const { data: relOriginal } = await supabase
    .from('cursos_modulos')
    .select('ordem')
    .match({ curso_id: cursoId, modulo_id: originalModuloId })
    .single()

  const ordem = relOriginal ? relOriginal.ordem : 999;

  // 2. Busca a descricao original
  const { data: modOriginal } = await supabase.from('modulos').select('descricao').eq('id', originalModuloId).single();
  const descricao = modOriginal?.descricao || null;

  const { data: novoModulo, error: modErr } = await supabase
    .from('modulos')
    .insert({ 
      titulo: novoTitulo, 
      descricao,
      ordem: 0,
      curso_id: cursoId // Marca como exclusivo deste curso
    })
    .select('id')
    .single()

  if (modErr || !novoModulo) {
    console.error('Erro ao separar módulo', modErr)
    throw new Error('Falha ao separar módulo: ' + (modErr?.message ?? 'módulo não retornado'))
  }

  // 3. Substituir no curso (remove o antigo, coloca o novo na mesma ordem)
  await supabase.from('cursos_modulos').delete().match({ curso_id: cursoId, modulo_id: originalModuloId })
  
  await supabase.from('cursos_modulos').insert({
    curso_id: cursoId,
    modulo_id: novoModulo.id,
    ordem: ordem
  })

  // 4. Copiar o vínculo das aulas para o novo módulo
  const { data: pivotAulas } = await supabase.from('modulos_aulas').select('aula_id, ordem').eq('modulo_id', originalModuloId)
  const { data: directAulas } = await supabase.from('aulas').select('id, ordem').eq('modulo_id', originalModuloId)

  const insercoesPivot: any[] = []

  if (pivotAulas) {
    pivotAulas.forEach(item => {
      if (item.aula_id) {
        insercoesPivot.push({ modulo_id: novoModulo.id, aula_id: item.aula_id, ordem: item.ordem })
      }
    })
  }

  if (directAulas) {
    directAulas.forEach(item => {
      // Como a relação direta era 1:N, na cópia nós colocamos na pivot N:N para não duplicar o registro da aula original
      insercoesPivot.push({ modulo_id: novoModulo.id, aula_id: item.id, ordem: item.ordem })
    })
  }

  // Remove duplicates based on aula_id
  const uniqInsercoesPivot = Array.from(new Map(insercoesPivot.map(item => [item.aula_id, item])).values())

  if (uniqInsercoesPivot.length > 0) {
    await supabase.from('modulos_aulas').insert(uniqInsercoesPivot)
  }

  // 5. Normalizar ordens
  await normalizeModulosOrdemInternal(cursoId, supabase)

  revalidatePath(`/admin/cursos/${cursoId}`)
}
