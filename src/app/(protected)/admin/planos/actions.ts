'use server'
 
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
 
export async function vincularCursoAoPlano(cursoId: string, planoId: string, valorVenda: number, valorOriginal?: number) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('planos_cursos')
    .upsert({ 
      curso_id: cursoId, 
      plano_id: planoId,
      valor_venda: valorVenda,
      valor_original: valorOriginal || valorVenda
    }, { onConflict: 'curso_id,plano_id' })
    
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

export async function atualizarPlano(id: string, data: any) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('planos')
    .update(data)
    .eq('id', id)
    
  if (error) return { error: error.message }
  
  revalidatePath('/admin/planos')
  return { success: true }
}

export async function excluirPlano(id: string) {
  const supabase = createAdminClient()
  
  // Verifica se existem cursos vinculados antes de excluir
  const { count } = await supabase
    .from('planos_cursos')
    .select('*', { count: 'exact', head: true })
    .eq('plano_id', id)

  if (count && count > 0) {
    return { error: 'Não é possível excluir um plano que possui cursos vinculados. Desvincule os cursos primeiro.' }
  }

  const { error } = await supabase
    .from('planos')
    .delete()
    .eq('id', id)
    
  if (error) return { error: error.message }
  
  revalidatePath('/admin/planos')
  return { success: true }
}
