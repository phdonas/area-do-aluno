
const { createClient } = require('@supabase/supabase-js');

const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

const supabase = createClient(PROD_URL, PROD_KEY);

async function auditProdPivots() {
  console.log('--- Auditoria de Integridade em PRODUÇÃO ---');
  
  // Como não sabemos se query_sql existe em Prod, vamos tentar via PostgREST
  // Se tentarmos um UPSERT em uma tabela sem PK, o PostgREST costuma reclamar ou falhar.
  // Mas a forma mais segura é tentar ler a estrutura se o usuário permitir RPC.
  
  // Vamos tentar verificar se o RPC exec_sql existe em Prod
  const { error: rpcError } = await supabase.rpc('query_sql', { sql_query: 'SELECT 1' });
  
  if (rpcError && rpcError.message.includes('function public.query_sql(text) does not exist')) {
    console.log('❌ O banco de PRODUÇÃO não possui a função query_sql. Precisamos criá-la.');
  } else {
    console.log('✅ O banco de PRODUÇÃO possui query_sql. Realizando auditoria profunda...');
    const query = `
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name IN ('cursos_modulos', 'modulos_aulas')
    `;
    const { data } = await supabase.rpc('query_sql', { sql_query: query });
    console.log('PKs encontradas em PROD:', data);
  }
}

auditProdPivots();
