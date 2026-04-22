'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function vincularCursoAoPlano(cursoId: string, planoId: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('planos_cursos')
    .upsert({ curso_id: cursoId, plano_id: planoId }, { onConflict: 'curso_id,plano_id' })
    
  if (error) return { error: error.message }
  
  revalidatePath('/admin/planos')
  revalidatePath('/catalogo')
  return { success: true }
}

export async function removerVinculoPlano(cursoId: string, planoId: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('planos_cursos')
    .delete()
    .eq('curso_id', cursoId)
    .eq('plano_id', planoId)
    
  if (error) return { error: error.message }
  
  revalidatePath('/admin/planos')
  return { success: true }
}

export async function criarNovoPlano(data: any) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('planos')
    .insert(data)
    
  if (error) return { error: error.message }
  
  revalidatePath('/admin/planos')
  return { success: true }
}
