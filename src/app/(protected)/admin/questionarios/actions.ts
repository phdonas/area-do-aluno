'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth-check'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createQuestionario(formData: FormData) {
  await ensureAdmin()
  const supabase = await createClient()

  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const nota_corte = parseInt(formData.get('nota_corte') as string || '70')
  const tentativas_permitidas = parseInt(formData.get('tentativas_permitidas') as string || '0')

  const { data, error } = await supabase
    .from('questionarios')
    .insert([{ titulo, descricao, nota_corte, tentativas_permitidas }])
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar questionário:", error)
    throw new Error('Falha ao criar questionário.')
  }

  revalidatePath('/admin/questionarios')
  redirect(`/admin/questionarios/${data.id}`)
}

export async function updateQuestionario(id: string, formData: FormData) {
  await ensureAdmin()
  const supabase = await createClient()

  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const nota_corte = parseInt(formData.get('nota_corte') as string || '70')
  const tentativas_permitidas = parseInt(formData.get('tentativas_permitidas') as string || '0')

  const { error } = await supabase
    .from('questionarios')
    .update({ titulo, descricao, nota_corte, tentativas_permitidas, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error("Erro ao atualizar questionário:", error)
    throw new Error('Falha ao atualizar questionário.')
  }

  revalidatePath(`/admin/questionarios/${id}`)
  revalidatePath('/admin/questionarios')
}

export async function deleteQuestionario(id: string) {
  await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('questionarios')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Erro ao deletar questionário:", error)
    throw new Error('Falha ao deletar questionário.')
  }

  revalidatePath('/admin/questionarios')
}

// Questões builder
export async function createQuestao(questionarioId: string) {
  const supabase = await createClient()
  
  // Pegar ultimo
  const { data: q } = await supabase.from('questoes').select('ordem').eq('questionario_id', questionarioId).order('ordem', { ascending: false }).limit(1).maybeSingle();
  const novaOrdem = q ? q.ordem + 1 : 1;

  const { data, error } = await supabase.from('questoes').insert([{
    questionario_id: questionarioId,
    enunciado: 'Nova Questão',
    tipo: 'escolha_simples',
    ordem: novaOrdem
  }]).select().single();

  if (error) throw new Error('Falha ao criar questão')

  // Criar pelo menos uma alternativa padrão
  await createAlternativa(data.id)

  revalidatePath(`/admin/questionarios/${questionarioId}`)
  return data
}

export async function updateQuestao(questaoId: string, payload: { enunciado?: string, tipo?: string, explicacao_correcao?: string, questionarioId?: string }) {
  const supabase = await createClient()
  const { error } = await supabase.from('questoes').update(payload).eq('id', questaoId)
  if (error) throw new Error('Erro ao atualizar questão')
  
  if (payload.questionarioId) {
    revalidatePath(`/admin/questionarios/${payload.questionarioId}`)
  }
}

export async function deleteQuestao(questaoId: string, questionarioId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('questoes').delete().eq('id', questaoId)
  if (error) throw new Error('Erro ao deletar questão')
  revalidatePath(`/admin/questionarios/${questionarioId}`)
}

export async function createAlternativa(questaoId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('questoes_alternativas').insert([{
    questao_id: questaoId,
    texto: 'Nova alternativa...',
    is_correta: false,
    explicacao: ''
  }])
  if (error) throw new Error('Erro ao criar alternativa')
  // We revalidate the questionario page if possible, otherwise rely on the frontend
}

export async function updateAlternativa(alternativaId: string, payload: { texto?: string, is_correta?: boolean, explicacao?: string }) {
  const supabase = await createClient()
  const { error } = await supabase.from('questoes_alternativas').update(payload).eq('id', alternativaId)
  if (error) throw new Error('Erro ao atualizar alternativa: ' + error.message)
}

export async function deleteAlternativa(alternativaId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('questoes_alternativas').delete().eq('id', alternativaId)
  if (error) throw new Error('Erro ao deletar alternativa')
}

export async function processCSVImport(questionarioId: string, csvLines: any[]) {
  const supabase = await createClient()
  
  for (const line of csvLines) {
    // line: { enunciado, tipo, explicacao_geral, alternativas: [{ texto, correta, explicacao }] }
    const { data: questao, error: qError } = await supabase.from('questoes').insert([{
      questionario_id: questionarioId,
      enunciado: line.enunciado,
      tipo: line.tipo, // escolha_simples, multipla_escolha, verdadeiro_falso
      explicacao_correcao: line.explicacao_geral,
      ordem: 0
    }]).select().single()

    if (qError || !questao) continue

    if (line.alternativas && line.alternativas.length > 0) {
      const formattedAlts = line.alternativas.map((a: any, index: number) => ({
        questao_id: questao.id,
        texto: a.texto,
        is_correta: a.correta,
        explicacao: a.explicacao,
        ordem: index
      }))
      await supabase.from('questoes_alternativas').insert(formattedAlts)
    }
  }
  
  revalidatePath(`/admin/questionarios/${questionarioId}`)
}
