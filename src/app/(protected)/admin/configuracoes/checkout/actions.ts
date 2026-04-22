'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCheckoutConfig() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('configuracoes_checkout')
    .select('*')
    .eq('key', 'default')
    .single()
  
  if (error) {
    console.error('Erro ao buscar config de checkout:', error)
    return null
  }
  
  return data
}

export async function saveCheckoutConfig(formData: FormData) {
  const supabase = await createClient()
  
  const updates = {
    badge_topo: formData.get('badge_topo') as string,
    tagline_topo: formData.get('tagline_topo') as string,
    texto_intro: formData.get('texto_intro') as string,
    beneficio_1_titulo: formData.get('beneficio_1_titulo') as string,
    beneficio_1_desc: formData.get('beneficio_1_desc') as string,
    beneficio_2_titulo: formData.get('beneficio_2_titulo') as string,
    beneficio_2_desc: formData.get('beneficio_2_desc') as string,
    beneficio_3_titulo: formData.get('beneficio_3_titulo') as string,
    beneficio_3_desc: formData.get('beneficio_3_desc') as string,
    beneficio_4_titulo: formData.get('beneficio_4_titulo') as string,
    beneficio_4_desc: formData.get('beneficio_4_desc') as string,
    checkout_card_tagline: formData.get('checkout_card_tagline') as string,
    texto_seguranca: formData.get('texto_seguranca') as string,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('configuracoes_checkout')
    .update(updates)
    .eq('key', 'default')

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/checkout/[id]', 'page')
  revalidatePath('/admin/configuracoes/checkout')
  
  return { success: true }
}
export async function getFinancialConfig() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('configuracoes_financeiras')
    .select('*')
    .single()
  
  if (error) {
    console.error('Erro ao buscar config financeira:', error)
    return null
  }
  return data
}

export async function saveFinancialConfig(formData: FormData) {
  const supabase = await createClient()
  
  const updates = {
    chave_pix_br: formData.get('chave_pix_br') as string,
    favorecido_br: formData.get('favorecido_br') as string,
    banco_nome_br: formData.get('banco_nome_br') as string,
    mbway_telemovel_pt: formData.get('mbway_telemovel_pt') as string,
    iban_pt: formData.get('iban_pt') as string,
    favorecido_pt: formData.get('favorecido_pt') as string,
    email_notificacao_admin: formData.get('email_notificacao_admin') as string,
    atualizado_em: new Date().toISOString()
  }

  const { error } = await supabase
    .from('configuracoes_financeiras')
    .update(updates)
    .eq('id', (await getFinancialConfig()).id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/configuracoes/checkout')
  return { success: true }
}
