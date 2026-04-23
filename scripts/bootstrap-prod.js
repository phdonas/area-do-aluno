
const { createClient } = require('@supabase/supabase-js');

const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

const supabase = createClient(PROD_URL, PROD_KEY);

async function bootstrapProd() {
  console.log('🛠️ Instalando ferramentas de auditoria em Produção...');
  
  // Como não temos exec_sql em prod ainda, não podemos rodar via RPC.
  // Mas podemos rodar SQL se o projeto permitir via SQL Editor... 
  // OPA! Se não temos exec_sql, não conseguimos rodar comandos SQL via API de forma genérica.
  
  // Vou tentar criar a função básica via uma chamada que o Supabase aceita.
  // Na verdade, sem exec_sql, a única forma de rodar SQL em Prod é via Dashboard ou se houver outra RPC.
  
  // VOU TENTAR USAR O ENDPOINT DE SQL DO SUPABASE (se disponível)
  console.log('⚠️ Verificando se existe alguma função de execução em Prod...');
  const { data: funcs, error } = await supabase.rpc('get_modulos_curso', { p_curso_id: '00000000-0000-0000-0000-000000000000' });
  
  if (error && error.message.includes('function public.exec_sql(sql_query) does not exist')) {
     console.error('❌ ERRO CRÍTICO: O banco de Produção é "virgem" de funções administrativas.');
     console.log('💡 Ação necessária: Você precisará copiar o conteúdo do script abaixo e colar no SQL EDITOR da Supabase de PRODUÇÃO.');
  } else {
     // Vou tentar criar via RPC se por um milagre exec_sql já existir mas query_sql não
     const sql = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text) RETURNS json AS $$
        BEGIN EXECUTE sql_query; RETURN json_build_object('status', 'success');
        EXCEPTION WHEN OTHERS THEN RETURN json_build_object('status', 'error', 'message', SQLERRM); END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE OR REPLACE FUNCTION query_sql(sql_query text) RETURNS SETOF json AS $$
        BEGIN RETURN QUERY EXECUTE 'SELECT row_to_json(t) FROM (' || sql_query || ') t'; END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
     `;
     const { error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql });
     if (rpcError) console.log('❌ Falha ao criar funções via RPC:', rpcError.message);
     else console.log('✅ Ferramentas instaladas!');
  }
}

bootstrapProd();
