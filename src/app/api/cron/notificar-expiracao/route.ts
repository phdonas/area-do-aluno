import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  // Validação de Segurança
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // 1. Buscar Configurações Globais de E-mail
  const { data: config } = await supabase
    .from('configuracoes_email_expiracao')
    .select('*')
    .single()

  if (!config) {
    return NextResponse.json({ error: 'Configurações de e-mail não encontradas' }, { status: 500 })
  }

  const intervalos = [30, 10, 1]
  const resultados: any[] = []

  for (const dias of intervalos) {
    const dataAlvo = new Date()
    dataAlvo.setDate(dataAlvo.getDate() + dias)
    const dataFormatada = dataAlvo.toISOString().split('T')[0]

    // 2. Buscar assinaturas vencendo em T+dias
    const { data: expirando } = await supabase
      .from('assinaturas')
      .select(`
        id, 
        data_vencimento,
        curso_id,
        usuarios(email, nome),
        cursos(titulo, id)
      `)
      .eq('status', 'ativa')
      .gte('data_vencimento', `${dataFormatada}T00:00:00`)
      .lte('data_vencimento', `${dataFormatada}T23:59:59`)

    if (expirando) {
      for (const ass of expirando) {
        // 3. Verificar se já recebeu este aviso específico
        const { data: jaEnviado } = await supabase
          .from('logs_notificacoes_expiracao')
          .select('id')
          .eq('assinatura_id', ass.id)
          .eq('tipo_aviso', `${dias}d`)
          .single()

        if (!jaEnviado) {
          // 4. Disparar e-mail com os dados do banco
          const emailEnviado = await enviarEmailPremium(ass, `${dias}d`, config)
          
          if (emailEnviado) {
             await supabase.from('logs_notificacoes_expiracao').insert({
               assinatura_id: ass.id,
               tipo_aviso: `${dias}d`
             })
             const userEmail = (ass.usuarios as any)?.[0]?.email || (ass.usuarios as any)?.email;
             resultados.push({ email: userEmail, tipo: `${dias}d` })
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true, enviados: resultados.length, detalhes: resultados })
}

async function enviarEmailPremium(assinatura: any, tipo: string, config: any) {
  try {
    const usuario = (assinatura.usuarios as any)?.[0] || assinatura.usuarios
    const cursoObj = (assinatura.cursos as any)?.[0] || assinatura.cursos
    
    const email = usuario?.email
    const nome = usuario?.nome || 'Aluno'
    const curso = cursoObj?.titulo
    const cursoId = cursoObj?.id
    const dataVencimento = new Date(assinatura.data_vencimento).toLocaleDateString('pt-BR')
    
    // Link Dinâmico de Renovação
    const linkCheckout = `${config.link_base_checkout}${cursoId}`

    console.log(`[LOG] Disparando e-mail de ${tipo} para ${email}`)

    // TODO: Integrar com seu provedor de e-mail (Resend / SendGrid)
    // O template abaixo usa as variáveis da tabela public.configuracoes_email_expiracao
    
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 60px 40px; border-radius: 32px; border: 1px solid #222;">
        <img src="${config.logo_url}" style="height: 40px; margin-bottom: 40px;" alt="Logo" />
        
        <h1 style="font-size: 32px; font-weight: 900; font-style: italic; letter-spacing: -0.05em; line-height: 1; margin-bottom: 24px; color: #ff3366;">
          ${config.texto_principal}
        </h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #a0a0a0; margin-bottom: 32px;">
          Olá, <strong>${nome}</strong>. <br/><br/>
          Identificamos que seu acesso ao treinamento <strong>${curso}</strong> expira em breve: <br/>
          📅 Data de Encerramento: <strong>${dataVencimento}</strong>
        </p>

        <div style="background: #111; border: 1px solid #333; padding: 24px; border-radius: 20px; margin-bottom: 32px;">
          <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 8px;">Bônus de Renovação Antecipada:</p>
          <p style="font-size: 24px; font-weight: 900; color: #fff; margin: 0;">Use o cupom: <span style="color: #ff3366;">${config.cupom_desconto}</span></p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #888; margin-bottom: 40px;">
          Garanta a continuidade do seu aprendizado técnico e mantenha seu acesso a todas as aulas e atualizações futuras.
        </p>

        <a href="${linkCheckout}" style="background: #ff3366; color: #ffffff; padding: 20px 40px; text-decoration: none; font-weight: 900; border-radius: 16px; display: inline-block; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">
          RENOVAR MINHA JORNADA
        </a>

        <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #222; text-align: center;">
          <p style="font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 0.2em;">
            © 2026 PH Academy • Excelência Técnica <br/>
            Dúvidas? Entre em contato: ${config.suporte_email}
          </p>
        </div>
      </div>
    `

    // Aqui você chama a função real de envio de e-mail do seu projeto
    return true 
  } catch (err) {
    console.error('Falha no envio:', err)
    return false
  }
}
