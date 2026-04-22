'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarPerfilProfissional(formData: {
  full_name: string;
  telefone: string;
  cargo: string;
  segmento_mercado: string;
  tamanho_empresa: string;
  experiencia_anos: string;
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    const supabaseAdmin = createAdminClient()

    // Usamos o Admin Client para garantir que o registro seja criado/atualizado 
    // independente de políticas restritivas de RLS no momento do onboarding.
    const { error } = await supabaseAdmin
      .from('usuarios')
      .upsert({
        id: user.id,
        email: user.email,
        nome: formData.full_name, // Resolvendo a constraint NOT NULL que causou o erro
        full_name: formData.full_name,
        telefone: formData.telefone,
        cargo: formData.cargo,
        segmento_mercado: formData.segmento_mercado,
        tamanho_empresa: formData.tamanho_empresa,
        experiencia_anos: parseInt(formData.experiencia_anos) || 0,
        perfil_completo_momento2: true,
        papel: 'visitante'
      })

    if (error) {
      console.error('Erro Supabase Admin ao salvar perfil:', error)
      return { error: error.message }
    }

    // Conceder 50 PHD Coins pelo perfil completo (Momento 2)
    await supabaseAdmin.from('phd_coins_log').insert({
      usuario_id: user.id,
      evento: 'perfil_completo',
      coins: 50
    })

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Erro crítico ao salvar perfil:', err)
    return { error: 'Ocorreu um erro interno ao processar seu cadastro.' }
  }
}
