import { createAdminClient } from './supabase/admin'

export async function validarCupom(codigo: string) {
  const supabase = createAdminClient()
  
  const { data: cupom, error } = await supabase
    .from('cupons')
    .select('*')
    .eq('codigo', codigo.toUpperCase().trim())
    .eq('ativo', true)
    .single()

  if (error || !cupom) {
    return { valid: false, error: 'Cupom inválido ou inexistente.' }
  }

  // Verificar Data de Início
  if (new Date(cupom.validade_inicio) > new Date()) {
    return { valid: false, error: 'Cupom ainda não está ativo.' }
  }

  // Verificar Data de Expiração
  if (cupom.validade_fim && new Date(cupom.validade_fim) < new Date()) {
    return { valid: false, error: 'Cupom expirado.' }
  }

  // Verificar Limite de Uso
  if (cupom.limite_uso && cupom.uso_atual >= cupom.limite_uso) {
    return { valid: false, error: 'Limite de uso atingido.' }
  }

  return { valid: true, cupom }
}

export function calcularDesconto(precoOriginal: number, cupom: any) {
  if (cupom.tipo === 'porcentagem') {
    const desconto = (precoOriginal * cupom.valor) / 100
    return {
      valorDesconto: Math.min(desconto, precoOriginal),
      precoFinal: Math.max(precoOriginal - desconto, 0)
    }
  } else {
    return {
      valorDesconto: Math.min(cupom.valor, precoOriginal),
      precoFinal: Math.max(precoOriginal - cupom.valor, 0)
    }
  }
}

export async function registrarUsoCupom(cupomId: string) {
  const supabase = createAdminClient()
  await supabase.rpc('incrementar_uso_cupom', { cupom_id: cupomId })
}
