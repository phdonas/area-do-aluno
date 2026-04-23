
const { createClient } = require('@supabase/supabase-js');

const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

const supabase = createClient(PROD_URL, PROD_KEY);

async function finalProdCheck() {
  console.log('🧐 Verificação Final de Produção (com nomes corretos)...');
  
  // Tenta ler usando o nome que o código realmente usa
  const { data, error } = await supabase.from('progresso_aulas').select('concluida, posicao_s').limit(1);
  
  if (error) {
    console.error('❌ Erro inesperado:', error.message);
  } else {
    console.log('✅ SUCESSO! O banco de produção responde perfeitamente aos nomes usados no código.');
    console.log('Campos validados: concluida, posicao_s');
  }
}

finalProdCheck();
