
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

async function finalSweep() {
  console.log('--- Varredura Final de Tabelas Pivot ---');
  
  const tables = ['cursos_modulos', 'modulos_aulas', 'instrutores_cursos'];
  
  for (const table of tables) {
    const query = `SELECT kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = '${table}'`;
    
    const { data, error } = await supabase.rpc('query_sql', { sql_query: query });
    
    if (error) {
      console.error(`Erro ao verificar ${table}:`, error.message);
    } else {
      console.log(`${table}: PK =`, data.length > 0 ? data.map(d => d.attname).join(', ') : 'AUSENTE 🔴');
    }
  }
}

finalSweep();
