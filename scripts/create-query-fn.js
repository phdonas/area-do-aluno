
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv(filePath) {
  const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim();
  });
  return env;
}

const env = getEnv('.env.local');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function createQueryFn() {
  const sql = `
    CREATE OR REPLACE FUNCTION query_sql(sql_query text) 
    RETURNS SETOF json AS $$ 
    BEGIN 
      RETURN QUERY EXECUTE 'SELECT row_to_json(t) FROM (' || sql_query || ') t'; 
    END; 
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) console.error('Erro:', error.message);
  else console.log('✅ Função query_sql criada!');
}

createQueryFn();
