'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureAdmin } from '@/lib/auth-check'
import { revalidatePath } from 'next/cache'
import { enviarEmailComunicacao } from '@/lib/email-service'
import { redirect } from 'next/navigation'

/**
 * Cria um novo aluno manualmente pela secretaria (Admin).
 */
export async function adminCreateUsuario(formData: FormData) {
  await ensureAdmin()
  const nome = formData.get('nome') as string
  const email = (formData.get('email') as string || '').toLowerCase().trim()
  const whatsapp = formData.get('whatsapp') as string
  const origem = formData.get('origem') as string
  const contato_preferencial = formData.get('contato_preferencial') as string
  let pais = (formData.get('pais') as string) || 'Brasil'
  
  if (pais.startsWith('Port') || pais === 'PT' || pais === 'Por') {
    pais = 'Portugal'
  }
  
  const nif = formData.get('nif') as string || formData.get('cpf') as string
  const supabase = createAdminClient()
  
  // 1. Gerar Senha Temporária
  const tempPassword = `PHVortex-${Math.floor(1000 + Math.random() * 9000)}`

  // 2. Tentar criar no Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: nome, needs_password_change: true }
  })

  let userId = ''

  if (authError) {
    if (authError.message.includes('already registered')) {
        // RESGATE DE ELITE: O usuário já existe. Buscamos o ID correto dele.
        // Tentamos primeiro no banco público (mais rápido)
        const { data: userDB } = await supabase.from('usuarios').select('id').eq('email', email).single()
        
        if (userDB) {
          userId = userDB.id
        } else {
          // Se não estiver no banco público, buscamos na listagem do Auth (último recurso)
          const { data: listData } = await supabase.auth.admin.listUsers()
          const existingUser = listData?.users.find(u => u.email === email)
          if (!existingUser) throw new Error('Usuário existe no Auth mas o ID é inacessível.')
          userId = existingUser.id
        }
    } else {
        throw new Error('Falha no Auth: ' + authError.message)
    }
  } else {
    userId = authData.user.id
  }

  // 3. UPSERT REAL: Usa o e-mail como âncora única
  const { data, error } = await supabase
    .from('usuarios')
    .upsert({
      id: userId,
      email,
      nome,
      whatsapp,
      origem,
      contato_preferencial,
      pais,
      nif,
      is_admin: false,
      is_staff: false,
      status: 'ativo',
      senha_temporaria: true 
    }, { onConflict: 'email' }) // CONFLITO PELO E-MAIL É A CHAVE DO SUCESSO
    .select()
    .single()

  if (error) throw new Error('Falha no perfi: ' + error.message)

  // 4. E-mail de Boas-Vindas
  await enviarEmailComunicacao({ email, password: tempPassword, tipo: 'boas_vindas' })

  revalidatePath('/admin/alunos')
  return data
}

/**
 * Altera daddos do aluno (CRUD - Alteração)
 */
export async function adminUpdateUsuario(id: string, formData: FormData) {
  await ensureAdmin()
  const supabase = createAdminClient()

  const data = {
    nome: formData.get('nome') as string || formData.get('full_name') as string,
    email: (formData.get('email') as string || '').toLowerCase().trim(),
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    whatsapp: formData.get('whatsapp') as string,
    origem: formData.get('origem') as string,
    contato_preferencial: formData.get('contato_preferencial') as string,
    pais: (formData.get('pais') as string) || 'Brasil',
    cep: formData.get('cep') as string,
    rua: formData.get('rua') as string,
    numero: formData.get('numero') as string,
    bairro: formData.get('bairro') as string,
    cidade: formData.get('cidade') as string,
    estado: formData.get('estado') as string,
    nif: formData.get('nif') as string || formData.get('cpf') as string,
    status: formData.get('status') as string 
  }

  // Normalização Elite no Update
  if (data.pais.startsWith('Port') || data.pais === 'PT' || data.pais === 'Por') {
    data.pais = 'Portugal'
  }

  // 1. Verificar se o e-mail mudou para sincronizar com o Auth
  const { data: usuarioAtual } = await supabase.from('usuarios').select('email').eq('id', id).single()

  if (usuarioAtual && usuarioAtual.email !== data.email) {
    // Sincroniza o e-mail de login no Supabase Auth
    await supabase.auth.admin.updateUserById(id, { 
      email: data.email,
      user_metadata: { email: data.email } // Opcional, mas boa prática
    })
  }

  const { error } = await supabase
    .from('usuarios')
    .update(data)
    .eq('id', id)

  if (error) throw new Error('Falha ao atualizar aluno: ' + error.message)

  revalidatePath('/admin/alunos')
  revalidatePath(`/admin/alunos/${id}`)
  return { success: true }
}

/**
 * Altera apenas o status (CRUD - Inativação)
 */
export async function adminToggleStatus(id: string, currentStatus: string) {
  await ensureAdmin()
  const supabase = createAdminClient()
  const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo'

  const { error } = await supabase
    .from('usuarios')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) throw new Error('Falha ao alterar status')

  revalidatePath('/admin/alunos')
  revalidatePath(`/admin/alunos/${id}`)
}

/**
 * Cria uma nova matrícula (Bypass RLS Error fixed)
 */
export async function createMatricula(formData: FormData) {
  await ensureAdmin()
  const supabase = createAdminClient()

  const usuario_id = formData.get('usuario_id') as string
  const target_id = formData.get('target_id') as string 
  const dataInicioForm = formData.get('data_inicio') as string
  const duracao = formData.get('duracao') as string 
  
  if (!target_id) throw new Error('Produto não selecionado')

  const isPlano = target_id.startsWith('plano_')
  const uid = target_id.replace('plano_', '').replace('curso_', '')

  const data_inicio = dataInicioForm ? new Date(dataInicioForm) : new Date()
  const data_vencimento = new Date(data_inicio)

  if (duracao === 'semestral') {
    data_vencimento.setDate(data_vencimento.getDate() + 180)
  } else if (duracao === 'vitalicio') {
    data_vencimento.setFullYear(data_vencimento.getFullYear() + 100)
  } else {
    data_vencimento.setDate(data_vencimento.getDate() + 365) // anual
  }

  const { error } = await supabase.from('assinaturas').insert({
    usuario_id,
    plano_id: isPlano ? uid : null,
    curso_id: isPlano ? null : uid,
    status: 'ativa',
    data_inicio: data_inicio.toISOString(),
    data_vencimento: data_vencimento.toISOString()
  })

  if (error) throw new Error('Falha ao matricular: ' + error.message)

  revalidatePath(`/admin/alunos/${usuario_id}`)
}

/**
 * Remove uma matrícula (Bypass RLS Error fixed)
 */
export async function deleteMatricula(id: string, usuario_id: string) {
  await ensureAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase.from('assinaturas').delete().eq('id', id)
  if (error) throw new Error('Falha ao cancelar matrícula')

  revalidatePath(`/admin/alunos/${usuario_id}`)
}

/**
 * Remove permanentemente o aluno (Apenas se NÃO houver matrículas)
 */
export async function adminDeleteUsuario(id: string) {
  await ensureAdmin()
  const supabase = createAdminClient()

  // 1. Verificar se existem matrículas (Blindagem)
  const { count, error: countError } = await supabase
    .from('assinaturas')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', id)

  if (countError) throw new Error('Falha ao verificar histórico do aluno')
  if (count && count > 0) {
    throw new Error('Não é possível excluir um aluno que possui matrículas ativas ou históricas. Inativa o perfil em vez de excluir.')
  }

  // 2. Apagar conta de Login (Supabase Auth) - Silencioso se não encontrar
  const { error: authError } = await supabase.auth.admin.deleteUser(id)
  if (authError && !authError.message.includes('User not found')) {
     throw new Error('Falha ao remover credenciais de acesso: ' + authError.message)
  }

  // 3. Apagar Perfil (Tabela usuarios)
  const { error: dbError } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id)

  if (dbError) throw new Error('Falha ao remover perfil do banco: ' + dbError.message)

  revalidatePath('/admin/alunos')
  redirect('/admin/alunos')
}
