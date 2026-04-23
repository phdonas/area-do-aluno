
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

async function audit() {
  console.log('--- Auditoria da Tabela Modulos ---');
  
  // PK
  const { data: pk } = await supabase.rpc('exec_sql', { 
    sql_query: "SELECT kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'modulos' AND tc.constraint_type = 'PRIMARY KEY'" 
  });
  console.log('Chave Primária:', pk);

  // Colunas
  const { data: cols } = await supabase.rpc('exec_sql', { 
    sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'modulos'" 
  });
  console.log('Colunas encontradas:', cols);

  console.log('--- Fim da Auditoria ---');
}

audit();
