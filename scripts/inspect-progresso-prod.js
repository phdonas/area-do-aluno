
const { createClient } = require('@supabase/supabase-js');

const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

const supabase = createClient(PROD_URL, PROD_KEY);

async function inspectProgresso() {
  console.log('🧐 Inspecionando colunas de PROGRESSO_AULAS em Produção...');
  
  const { data, error } = await supabase.from('progresso_aulas').select('*').limit(1);
  
  if (error) {
    console.error('❌ Erro ao ler tabela:', error.message);
  } else if (data && data.length > 0) {
    console.log('✅ Colunas encontradas:', Object.keys(data[0]));
  } else {
    // Se a tabela estiver vazia, tentamos pegar as colunas via error de select inválido
    const { error: errCol } = await supabase.from('progresso_aulas').select('non_existent_column');
    console.log('💡 Dica do banco (erro proposital):', errCol.message);
  }
}

inspectProgresso();
