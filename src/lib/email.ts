import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function sendWelcomeEmail({ 
  to, 
  nome 
}: { 
  to: string; 
  nome: string; 
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Paulo Donassolo <contato@phdonassolo.com>', // Remetente Profissional
      to: [to],
      subject: 'Bem-vindo ao Treinamento! Seus acessos estão liberados 📚',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #4f46e5; text-align: center;">Olá, ${nome}! 👋</h1>
          
          <p>O <strong>Paulo Donassolo</strong> acabou de configurar seus acessos na nossa plataforma exclusiva de treinamento.</p>
          
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">Seu usuário de acesso:</p>
            <p style="font-size: 18px; color: #4f46e5; margin: 8px 0;">${to}</p>
          </div>

          <p>Para começar agora, basta seguir estes passos:</p>
          
          <ol style="line-height: 1.6;">
            <li>Acesse a área do aluno em <a href="https://phdonassolo.com/area-do-aluno" style="color: #4f46e5; font-weight: bold; text-decoration: none;">phdonassolo.com</a></li>
            <li>No primeiro acesso, clique em <strong>"Esqueci minha senha"</strong> ou <strong>"Cadastrar-se"</strong> usando este seu e-mail.</li>
            <li>Defina sua senha e pronto! Seus cursos e materiais já estarão lá esperando por você.</li>
          </ol>

          <div style="text-align: center; margin-top: 40px;">
            <a href="https://phdonassolo.com/area-do-aluno" style="background-color: #4f46e5; color: #ffffff; padding: 16px 32px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
              ACESSAR MEU PAINEL AGORA
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 40px 0;">
          
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            Dúvidas? Responda este e-mail ou entre em contato via WhatsApp.<br>
            Paulo Donassolo - Advanced Gestor
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Erro ao disparar e-mail:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Falha crítica no envio de e-mail:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotification({
  event,
  userData
}: {
  event: 'novo_cadastro' | 'nova_matricula';
  userData: any;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'contato@phdonassolo.com'; // E-mail que receberá os alertas
  
  const title = event === 'novo_cadastro' ? '🟢 Novo Usuário Cadastrado' : '💰 Nova Matrícula Confirmada';
  
  const detailsHtml = Object.entries(userData)
    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
    .join('');

  try {
    const { data, error } = await resend.emails.send({
      from: 'Sistema PHD Academy <onboarding@resend.dev>', // Ou seu domínio verificado
      to: [adminEmail],
      subject: `Alerta do Sistema: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1e293b; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">${title}</h2>
          </div>
          <div style="padding: 24px;">
            <p>Um novo evento foi registrado no sistema. Abaixo estão os detalhes:</p>
            <ul style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; list-style-type: none;">
              ${detailsHtml}
            </ul>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://phdonassolo.com/admin" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ver no Painel Admin</a>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Erro ao enviar notificação admin:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Falha crítica na notificação admin:', error);
    return { success: false, error };
  }
}
