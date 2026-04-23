
const { createClient } = require('@supabase/supabase-js');

const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

const supabase = createClient(PROD_URL, PROD_KEY);

async function blindAudit() {
  console.log('🚀 INICIANDO AUDITORIA CEGA DE PRODUÇÃO 🚀');
  
  const report = { missing: [] };

  // Teste Aulas
  const { error: errAulas } = await supabase.from('aulas').select('slug, video_url, duracao_segundos, tipo_conteudo, questionario_id, recurso_id, liberacao_dias').limit(1);
  if (errAulas) {
    console.log('❌ AULAS: Problema detectado:', errAulas.message);
    report.missing.push(errAulas.message);
  } else {
    console.log('✅ AULAS: Todas as colunas críticas existem!');
  }

  // Teste Módulos
  const { error: errModulos } = await supabase.from('modulos').select('curso_id, ui_layout').limit(1);
  if (errModulos) {
    console.log('❌ MÓDULOS: Problema detectado:', errModulos.message);
    report.missing.push(errModulos.message);
  } else {
    console.log('✅ MÓDULOS: Todas as colunas críticas existem!');
  }

  // Teste Usuários
  const { error: errUsers } = await supabase.from('usuarios').select('is_admin, is_staff').limit(1);
  if (errUsers) {
    console.log('❌ USUÁRIOS: Problema detectado:', errUsers.message);
    report.missing.push(errUsers.message);
  } else {
    console.log('✅ USUÁRIOS: Todas as colunas críticas existem!');
  }

  // Teste de Funções Críticas
  const { error: errRPC } = await supabase.rpc('get_modulos_curso', { p_curso_id: '00000000-0000-0000-0000-000000000000' });
  if (errRPC && errRPC.message.includes('does not exist')) {
    console.log('❌ RPC: Função get_modulos_curso não existe!');
    report.missing.push('Função get_modulos_curso ausente');
  } else {
    console.log('✅ RPC: Funções de visualização estão presentes!');
  }

  console.log('\n--- CONCLUSÃO ---');
  if (report.missing.length === 0) console.log('🟢 O banco de produção está 100% compatível!');
  else console.log('🔴 O banco de produção PRECISA de atualizações.');
}

blindAudit();
