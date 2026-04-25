'use server'
 
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
 
/**
 * Vincula um curso a um plano com preço e configurações específicas
 */
export async function vincularCursoAoPlano(
  cursoId: string, 
  planoId: string, 
  valorVenda: number, 
  valorOriginal?: number,
  isFeatured: boolean = false
) {
  const supabase = createAdminClient()
  
  // Se estiver definindo como destaque, remove o destaque de outros planos para este curso
  if (isFeatured) {
    await supabase
      .from('planos_cursos')
      .update({ is_featured: false })
      .eq('curso_id', cursoId)
  }

  const { error } = await supabase
    .from('planos_cursos')
    .upsert({ 
      curso_id: cursoId, 
      plano_id: planoId,
      valor_venda: valorVenda,
      valor_original: valorOriginal || valorVenda,
      is_featured: isFeatured,
      ativo: true
    }, { onConflict: 'curso_id,plano_id' })
    
  if (error) return { error: error.message }
  
  revalidatePath('/admin/planos')
  revalidatePath('/catalogo')
  return { success: true }
}

/**
 * Alterna o status de destaque de um vínculo
 */
export async function alternarDestaqueVinculo(cursoId: string, planoId: string, isFeatured: boolean) {
  const supabase = createAdminClient()

  if (isFeatured) {
    // Garante que apenas um plano seja destaque por curso
    await supabase
      .from('planos_cursos')
      .update({ is_featured: false })
      .eq('curso_id', cursoId)
  }

  const { error } = await supabase
    .from('planos_cursos')
    .update({ is_featured: isFeatured })
    .eq('curso_id', cursoId)
    .eq('plano_id', planoId)

  if (error) return { error: error.message }
  revalidatePath('/admin/planos')
  return { success: true }
}

/**
 * Alterna o status ativo de um vínculo (soft delete)
 */
export async function alternarAtivoVinculo(cursoId: string, planoId: string, ativo: boolean) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('planos_cursos')
    .update({ ativo })
    .eq('curso_id', cursoId)
    .eq('plano_id', planoId)

  if (error) return { error: error.message }
  revalidatePath('/admin/planos')
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

/**
 * Exclui um plano. Agora suporta cascade via DB, mas recomenda-se cautela.
 */
export async function excluirPlano(id: string) {
  const supabase = createAdminClient()
  
  // Tenta excluir. O banco está configurado com CASCADE para assinaturas e SET NULL para logs.
  const { error } = await supabase
    .from('planos')
    .delete()
    .eq('id', id)
    
  if (error) {
    // Se ainda falhar por FK, oferecemos a opção de inativar
    return { 
      error: 'Erro ao excluir: ' + error.message,
      canDeactivate: true 
    }
  }
  
  revalidatePath('/admin/planos')
  return { success: true }
}

