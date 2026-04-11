/**
 * SCRIPT DE TESTE: Simulação de Pagamento Mercado Pago (Fase 3)
 * Este script simula o envio de uma notificação de pagamento aprovado
 * para o seu webhook local, permitindo testar a matrícula automática.
 * 
 * USO: node scripts/simular-pagamento.js [EMAIL_DO_ALUNO] [CURSO_ID]
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function simularWebhook() {
  const email = process.argv[2] || 'aluno-teste@vortex.com';
  const cursoId = process.argv[3] || 'ID_DO_CURSO_NO_SUPABASE'; // Coloque um ID real aqui
  const paymentId = 'TEST-' + Math.floor(Math.random() * 1000000);

  console.log(`🚀 Iniciando simulação para: ${email}...`);

  // O Webhook do Mercado Pago recebe type=payment e data.id (ID do pagamento no gateway)
  // Como não temos o gateway real agora, o seu backend vai precisar de um MOCK do MP Client
  // para buscar os detalhes desse pagamento ID.
  
  // Simulação de parâmetros extras que o Mock do webhook usará localmente
  const url = `http://localhost:3000/api/webhooks/mercadopago?type=payment&data.id=${paymentId}&email=${encodeURIComponent(email)}&curso_id=${cursoId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // O corpo normalmente vem vazio ou com metadados no MP, 
      // mas os detalhes vêm da consulta ao ID do pagamento (data.id)
    });

    if (response.ok) {
      console.log('✅ Webhook disparado com sucesso!');
      console.log('🔗 Verifique agora a tabela logs_matriculas e convites no Supabase.');
    } else {
      console.error('❌ Erro no webhook:', await response.text());
    }
  } catch (err) {
    console.error('❌ Canal de comunicação falhou. Seu servidor Next.js está rodando (npm run dev)?');
  }
}

simularWebhook();
