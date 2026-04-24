import { NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/email';

// Definição do formato esperado do Webhook do Supabase
interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  schema: string;
  old_record: any | null;
}

export async function POST(request: Request) {
  try {
    // Para segurança real no futuro, valide o header de assinatura do Supabase ou um Secret
    // const authHeader = request.headers.get('Authorization');
    // if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    // }

    const payload: SupabaseWebhookPayload = await request.json();

    // 1. Apenas reagir a Inserções
    if (payload.type !== 'INSERT') {
      return NextResponse.json({ message: 'Evento ignorado (não é INSERT)' }, { status: 200 });
    }

    let event: 'novo_cadastro' | 'nova_matricula';
    let emailData: any = {};

    // 2. Lógica para Tabela de Usuários/Perfis
    if (payload.table === 'usuarios' || payload.table === 'perfis') {
      event = 'novo_cadastro';
      emailData = {
        'Nome': payload.record.full_name || payload.record.nome || 'Não informado',
        'Email': payload.record.email || 'Não informado',
        'Aceita Marketing': payload.record.aceita_marketing ? 'Sim' : 'Não',
        'Aceita Termos': payload.record.aceita_termos ? 'Sim' : 'Não',
        'ID Usuário': payload.record.id,
        'Data': new Date().toLocaleString('pt-BR')
      };
    } 
    // 3. Lógica para Tabela de Matrículas/Assinaturas
    else if (payload.table === 'assinaturas' || payload.table === 'matriculas') {
      event = 'nova_matricula';
      emailData = {
        'ID do Curso/Plano': payload.record.curso_id || payload.record.plano_id || 'Não informado',
        'Status': payload.record.status,
        'ID Usuário': payload.record.usuario_id,
        'Data de Vencimento': payload.record.data_vencimento || 'Vitalício',
        'Data da Matrícula': new Date().toLocaleString('pt-BR')
      };
    } 
    // Outras tabelas são ignoradas
    else {
      return NextResponse.json({ message: `Tabela ${payload.table} ignorada` }, { status: 200 });
    }

    // 4. Dispara o E-mail usando o Resend
    const result = await sendAdminNotification({ event, userData: emailData });

    if (!result.success) {
      console.error('Falha no envio do email pelo Webhook:', result.error);
      return NextResponse.json({ error: 'Falha no envio do email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Notificação enviada com sucesso' }, { status: 200 });
    
  } catch (error) {
    console.error('Erro no processamento do Webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno no processamento do Webhook' }, 
      { status: 500 }
    );
  }
}
