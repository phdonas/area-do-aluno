'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleAulaConcluida(aulaId: string, concluida: boolean, cursoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  let { error } = await supabase
    .from('progresso_aulas')
    .upsert({
      usuario_id: user.id,
      aula_id: aulaId,
      curso_id: cursoId,
      concluida: concluida,
      ultima_visualizacao: new Date().toISOString()
    }, {
      onConflict: 'usuario_id,aula_id,curso_id'
    })

  // Se falhar por falta da constraint (onConflict errado), tenta o padrão legado
  if (error) {
    console.warn('[Player] Falha no upsert (curso_id), tentando fallback...', error.message);
    const retry = await supabase
      .from('progresso_aulas')
      .upsert({
        usuario_id: user.id,
        aula_id: aulaId,
        curso_id: cursoId,
        concluida: concluida,
        ultima_visualizacao: new Date().toISOString()
      }, {
        onConflict: 'usuario_id,aula_id'
      })
    error = retry.error
  }

  if (error) {
    console.error('Erro ao salvar progresso:', error)
    return { error: 'Falha ao salvar progresso' }
  }

  if (cursoId) {
    revalidatePath(`/catalogo/${cursoId}`)
    revalidatePath(`/player/${cursoId}/${aulaId}`)
    revalidatePath(`/dashboard`) // Atualiza o radar e barras de progresso
  }

  return { success: true }
}

export async function updateAulaPosicao(aulaId: string, cursoId: string, posicao: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  console.log(`[Player] Salvando posição: ${posicao}s para aula ${aulaId}`);

  const { error } = await supabase
    .from('progresso_aulas')
    .upsert({
      usuario_id: user.id,
      curso_id: cursoId,
      aula_id: aulaId,
      posicao_s: posicao,
      ultima_visualizacao: new Date().toISOString()
    }, {
      onConflict: 'usuario_id,aula_id'
    })

  if (error) {
    console.error('Erro ao atualizar posição:', error)
    return { error: 'Falha ao atualizar posição' }
  }

  return { success: true }
}
