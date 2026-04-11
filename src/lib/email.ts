import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
