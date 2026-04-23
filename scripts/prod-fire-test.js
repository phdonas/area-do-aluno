
const { createClient } = require('@supabase/supabase-js');

const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

const supabase = createClient(PROD_URL, PROD_KEY);

async function fireTest() {
  console.log('🔥 TESTE DE FOGO: PROGRESSO_AULAS EM PRODUÇÃO 🔥');
  
  // Tenta um upsert (exige PK composta)
  const dummyData = {
    usuario_id: '00000000-0000-0000-0000-000000000000', // ID inexistente para teste
    aula_id: '00000000-0000-0000-0000-000000000000',
    concluido: false,
    ultima_posicao: 0
  };

  const { error } = await supabase.from('progresso_aulas').upsert(dummyData);
  
  if (error) {
    if (error.message.includes('primary key')) {
      console.log('🔴 FALHA: O banco de produção NÃO tem a chave primária composta.');
    } else if (error.message.includes('foreign key')) {
      console.log('✅ SUCESSO (Indireto): O erro de Foreign Key prova que o Upsert foi tentado (exige PK)!');
    } else {
      console.log('❓ Erro inesperado:', error.message);
    }
  } else {
    console.log('✅ SUCESSO: Upsert funcionou em Produção!');
  }
}

fireTest();
