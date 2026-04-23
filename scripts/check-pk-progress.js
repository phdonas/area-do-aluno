
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

async function checkPK() {
  console.log('--- Verificando Chave Primária de progresso_aulas ---');
  const { data, error } = await supabase.rpc('exec_sql_v2', { 
    query: "SELECT kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'progresso_aulas' AND tc.constraint_type = 'PRIMARY KEY'" 
  });
  if (error) {
    console.error('Erro:', error.message);
  } else {
    console.log('Colunas da PK:', data);
  }
}

checkPK();
