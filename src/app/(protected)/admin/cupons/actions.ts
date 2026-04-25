'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function listarCupons() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cupons')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erro ao listar cupons:', error)
    return { error: 'Ocorreu um erro ao carregar os cupons.' }
  }
  
  return { cupons: data }
}

export async function criarCupom(data: { 
  codigo: string; 
  tipo: 'porcentagem' | 'valor_fixo'; 
  valor: number; 
  data_inicio?: string; 
  data_fim?: string; 
  limite_uso?: number;
  ativo?: boolean;
  apenas_para_alunos?: boolean;
}) {
  const supabase = createAdminClient()
  
  const { error } = await supabase.from('cupons').insert({
    codigo: data.codigo.toUpperCase().trim(),
    tipo: data.tipo,
    valor: data.valor,
    validade_inicio: data.data_inicio || new Date().toISOString(),
    validade_fim: data.data_fim || null,
    limite_uso: data.limite_uso || null,
    ativo: data.ativo ?? true,
    apenas_para_alunos: data.apenas_para_alunos ?? false,
    uso_atual: 0
  })

  if (error) {
    console.error('DEBUG - Erro detalhado ao criar cupom:', JSON.stringify(error, null, 2))
    return { error: 'Erro ao criar o código promocional: ' + error.message }
  }

  revalidatePath('/admin/cupons')
  return { success: true }
}

export async function deletarCupom(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('cupons').delete().eq('id', id)
  
  if (error) return { error: 'Falha ao excluir cupom.' }
  
  revalidatePath('/admin/cupons')
  return { success: true }
}

export async function toggleAtivo(id: string, currentlyActive: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('cupons').update({ ativo: !currentlyActive }).eq('id', id)
  
  if (error) return { error: 'Falha ao atualizar status.' }
  
  revalidatePath('/admin/cupons')
  return { success: true }
}
