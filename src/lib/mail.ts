import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendInviteEmailParams {
  email: string
  password?: string
  cursoNome?: string
  tipo: 'boas_vindas' | 'matricula_direta'
}

export async function enviarEmailComunicacao({ email, password, cursoNome, tipo }: SendInviteEmailParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const loginLink = `${siteUrl}/login`
  
  const subjects = {
    boas_vindas: 'Boas Vindas ao Ecossistema do Prof. Paulo Donassolo. Seus acessos estão liberados!',
    matricula_direta: cursoNome ? `Matrícula Confirmada: ${cursoNome}` : 'Novo Treinamento Liberado - PH Donassolo'
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 48px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
       <div style="margin-bottom: 32px; text-align: center;">
          <h1 style="color: #0f172a; font-size: 28px; font-weight: 900; letter-spacing: -0.025em; line-height: 1.1; margin: 0;">PH DONASSOLO</h1>
          <p style="color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; tracking: 0.1em; margin-top: 8px;">Área do Aluno • Vortex</p>
       </div>

       <div style="background: #f8fafc; border-radius: 24px; padding: 32px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
          <h2 style="color: #1e293b; font-size: 20px; font-weight: 800; margin: 0 0 16px 0;">
             ${tipo === 'boas_vindas' ? 'Seja muito bem-vindo(a)!' : 'Nova Etapa Liberada!'}
          </h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">
             ${tipo === 'boas_vindas' 
                ? 'O Prof. Paulo Donassolo acabou de configurar seus acessos no ecossistema e seu treinamento já está disponível na plataforma.'
                : 'Seu novo treinamento acaba de ser liberado na sua conta. Continue sua evolução tática e técnica agora mesmo.'}
          </p>
       </div>
       
       ${cursoNome ? `
       <div style="margin-bottom: 32px; padding: 24px; border-left: 4px solid #4f46e5; background: #eff6ff; border-radius: 0 16px 16px 0;">
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #3b82f6; letter-spacing: 0.05em;">Treinamento Liberado</p>
          <h3 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 900; color: #1e3a8a;">${cursoNome}</h3>
       </div>
       ` : ''}

       ${password ? `
       <div style="background: #0f172a; border-radius: 24px; padding: 32px; margin-bottom: 32px; color: #ffffff;">
          <p style="font-size: 12px; text-transform: uppercase; font-weight: 800; color: #94a3b8; margin: 0 0 16px 0; letter-spacing: 0.1em;">Seus Dados de Acesso</p>
          <div style="margin-bottom: 12px;">
             <span style="color: #64748b; font-size: 13px;">E-mail:</span><br/>
             <strong style="font-size: 16px;">${email}</strong>
          </div>
          <div>
             <span style="color: #64748b; font-size: 13px;">Senha Temporária:</span><br/>
             <strong style="font-size: 16px; color: #fbbf24;">${password}</strong>
          </div>
          <p style="font-size: 11px; color: #475569; margin-top: 16px;">* Você poderá alterar sua senha após o primeiro login.</p>
       </div>
       ` : ''}

       <div style="text-align: center;">
          <a href="${loginLink}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 20px 48px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">
             ACESSAR MEU PAINEL AGORA
          </a>
       </div>

       <div style="margin-top: 48px; pt-32; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 24px 0 0 0;">
             Este é um e-mail automático enviado pela plataforma Vortex da PH Donassolo.<br/>
             Dúvidas? Entre em contato com nosso suporte exclusivo.
          </p>
          <p style="color: #cbd5e1; font-size: 10px; margin-top: 16px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">
             PH DONASSOLO • ALTA PERFORMANCE
          </p>
       </div>
    </div>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: 'Prof. Paulo Donassolo <contato@phdonassolo.com>',
      to: [email],
      subject: subjects[tipo],
      html
    })

    if (error) {
       console.error('❌ ERRO NO MOTOR RESEND:', error)
    } else {
       console.log('✅ E-MAIL ENVIADO COM SUCESSO:', data?.id)
    }

    return { data, error }
  } catch (err) {
    console.error('💥 FALHA CRÍTICA NO DISPARO:', err)
    return { error: err }
  }
}
