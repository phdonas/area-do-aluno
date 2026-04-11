'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { registrarLogSistema } from '@/lib/logs'
import { enviarEmailComunicacao } from '@/lib/mail'

/**
 * Simula o fluxo de matrícula com senha temporária para novos alunos.
 */
export async function simularMatricula(cursoId: string, email: string) {
  try {
    const supabase = createAdminClient()
    const paymentId = `SIMULADO-${Date.now()}`
    const normalizedEmail = email.toLowerCase().trim()
    
    // 0. Gerar Senha Temporária (caso necessário)
    const tempPassword = `PHVortex-${Math.floor(1000 + Math.random() * 9000)}`

    // 1. Verificar se usuário já existe no Auth (Fallback seguro para listUsers)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    let authUser = users.find(u => u.email?.toLowerCase() === normalizedEmail)
    let isNovoUsuario = false

    if (!authUser) {
      // CRIAR USUÁRIO NO AUTH (Admin bypass)
      const { data: { user: newUser }, error: createAuthError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { 
          source: 'simulacao_vortex',
          needs_password_change: true 
        }
      })

      if (createAuthError) throw createAuthError
      authUser = newUser!
      isNovoUsuario = true
    }

    // 2. Garantir Perfil na tabela 'usuarios'
    // Se o usuário já existir, preservamos os dados atuais dele
    const { data: perfilExistente } = await supabase
      .from('usuarios')
      .select('nome, pais')
      .eq('id', authUser.id)
      .single()

    const { error: upsertError } = await supabase
      .from('usuarios')
      .upsert({
        id: authUser.id,
        email: normalizedEmail,
        nome: perfilExistente?.nome || authUser.user_metadata?.full_name || 'Aluno Vortex',
        senha_temporaria: isNovoUsuario // Somente novos ganham o marcador de troca
      }, { onConflict: 'id' })

    if (upsertError) {
       console.warn('Nota: Coluna senha_temporaria pode não existir no banco ainda ou erro no upsert.', upsertError.message)
       // Fallback caso a coluna 'senha_temporaria' não tenha sido criada via SQL ainda
       await supabase.from('usuarios').upsert({ 
         id: authUser.id, 
         email: normalizedEmail, 
         nome: perfilExistente?.nome || 'Aluno Vortex' 
       })
    }

    // 3. Registrar Matrícula (Assinatura)
    const { error: matriculaError } = await supabase.from('assinaturas').insert({
      usuario_id: authUser.id,
      curso_id: cursoId,
      status: 'ativa',
      data_inicio: new Date().toISOString(),
      data_vencimento: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
      metadata: { mp_payment_id: paymentId, via: 'simulacao_vortex' }
    })

    if (matriculaError) {
      // Se der erro por já existir a matrícula, apenas seguimos (evita erro de duplicidade no teste)
      if (!matriculaError.message.includes('duplicate key')) {
        throw matriculaError
      }
    }

    // 4. Enviar E-mail de Boas-Vindas
    const { data: curso } = await supabase.from('cursos').select('titulo, preco, preco_eur').eq('id', cursoId).single()
    
    await enviarEmailComunicacao({
      email: normalizedEmail,
      password: isNovoUsuario ? tempPassword : undefined, 
      cursoNome: curso?.titulo || 'Seu novo treinamento',
      tipo: 'boas_vindas'
    })

    // 5. Registrar Log de Auditoria
    const isPortugal = perfilExistente?.pais === 'Portugal'
    const valorSimulado = isPortugal ? (curso?.preco_eur || 0) : (curso?.preco || 0)
    const moedaSimulada = isPortugal ? 'EUR' : 'BRL'

    await registrarLogSistema({
      usuario_id: authUser.id,
      email: normalizedEmail,
      evento: isNovoUsuario ? 'NOVO_ALUNO_SIMULADO' : 'MATRICULA_EXISTENTE_SIMULADA',
      nivel: 'sucesso',
      origem: 'SIMULADOR_VORTEX',
      detalhes: { 
        curso_id: cursoId, 
        payment_id: paymentId, 
        senha_enviada: isNovoUsuario,
        valor: valorSimulado,
        moeda: moedaSimulada,
        pais: perfilExistente?.pais || 'Brasil'
      }
    })

    revalidatePath('/dashboard')
    revalidatePath(`/loja/curso/${cursoId}`)

    return { success: true, isNovo: isNovoUsuario }
  } catch (error: any) {
    console.error('Erro na simulação de matrícula:', error)
    return { error: error.message }
  }
}
