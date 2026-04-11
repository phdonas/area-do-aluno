'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Busca os pilares ativos para mostrar na tela de ativação
 */
export async function getPilaresAtivos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pilares')
    .select('*')
    .order('ordem', { ascending: true })
  
  if (error) return []
  return data
}

/**
 * Salva o perfil completo do aluno e finaliza a ativação com suporte internacional
 */
export async function finalizarAtivacao(formData: FormData) {
  console.log('--- [FINALIZAR ATIVACAO] INICIANDO PROCESSO NO SERVIDOR ---')
  
  // 1. Cliente Padrão para pegar a Sessão do Usuário Logado
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  
  if (!user) {
    console.error('[ERRO] SESSÃO EXPIRADA OU NÃO ENCONTRADA')
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  // 2. Cliente ADMIN para Bypass de RLS e Gestão de Perfil Crítico
  const supabaseAdmin = createAdminClient()

  const password = formData.get('password') as string
  const nif = formData.get('nif') as string
  const pais = formData.get('pais') as string
  const cep = formData.get('cep') as string
  const rua = formData.get('rua') as string
  const numero = formData.get('numero') as string
  const bairro = formData.get('bairro') as string
  const cidade = formData.get('cidade') as string
  const estado = formData.get('estado') as string
  const pilares = formData.getAll('pilares') as string[]
  
  console.log('1. Dados Recebidos do Mago:', { 
    id: user.id,
    email: user.email,
    pais, 
    nif: !!nif, 
    cep: !!cep 
  })

  // RESGATE DE SEGURANÇA: Buscamos dados prévios
  const { data: usuarioAtual } = await supabaseAdmin.from('usuarios').select('pais').eq('id', user.id).single()
  
  let paisFinal = pais || usuarioAtual?.pais || 'Brasil'
  
  if (paisFinal.startsWith('Port') || paisFinal === 'PT' || paisFinal === 'Por') {
    paisFinal = 'Portugal'
  }

  console.log('2. Atualizando Auth (Removendo Flag needs_password_change)...')
  // Atualizar Senha no Auth e Limpar a Flag de Troca Obrigatória
  const { error: authError } = await supabaseUser.auth.updateUser({ 
    password,
    data: { 
      needs_password_change: false,
      onboarding_completed: true
    } 
  })
  
  if (authError) {
    console.error('[ERRO AUTH]:', authError.message)
    throw new Error('Erro ao atualizar senha: ' + authError.message)
  }

  console.log('3. Atualizando Banco Público (public.usuarios) com ADMIN CLIENT...')
  // Usamos o Admin Client aqui para garantir que senha_temporaria vire FALSE e o dado fiscal seja salvo
  // NOTA: Sintonizado com a Action do Admin que usa a coluna 'nif'
  const { error: dbError } = await supabaseAdmin
    .from('usuarios')
    .update({
      senha_temporaria: false,
      pais: paisFinal,
      nif: nif || null, // Sincronizado: o campo fiscal no banco é 'nif'
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      pilares_interesse: pilares,
      data_ativacao: new Date().toISOString()
    })
    .eq('id', user.id)

  if (dbError) {
    console.error('[ERRO CRÍTICO NO BANCO]:', dbError.message)
    // Fallback: Tentamos limpar pelo menos a flag de senha no Admin para não travar o usuário
    await supabaseAdmin
      .from('usuarios')
      .update({ senha_temporaria: false })
      .eq('id', user.id)
    
    throw new Error('Dados salvos parcialmente. Contacte o suporte.')
  }

  console.log('4. Processo Finalizado. Revalidando rotas...')
  
  revalidatePath('/dashboard')
  revalidatePath('/perfil')
  
  return { success: true }
}
