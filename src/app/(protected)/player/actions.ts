'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleAulaConcluida(aulaId: string, concluida: boolean, cursoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from('progresso_aulas')
    .upsert({
      usuario_id: user.id,
      curso_id: cursoId,
      aula_id: aulaId,
      concluida: concluida,
      ultima_visualizacao: new Date().toISOString()
    }, {
      onConflict: 'usuario_id,curso_id,aula_id'
    })

  if (error) {
    console.error('Erro ao salvar progresso:', error)
    return { error: 'Falha ao salvar progresso' }
  }

  if (cursoId) {
    revalidatePath(`/catalogo/${cursoId}`)
    revalidatePath(`/player/${cursoId}/${aulaId}`)
  }

  return { success: true }
}
