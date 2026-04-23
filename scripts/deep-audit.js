
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

async function deepAudit() {
  console.log('--- Auditoria Profunda de Tabelas ---');
  
  const queries = {
    triggers_aulas: "SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'aulas'",
    triggers_modulos: "SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'modulos'",
    cols_aulas: "SELECT column_name, is_nullable, column_default, data_type FROM information_schema.columns WHERE table_name = 'aulas'",
    cols_modulos: "SELECT column_name, is_nullable, column_default, data_type FROM information_schema.columns WHERE table_name = 'modulos'"
  };

  for (const [name, query] of Object.entries(queries)) {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    console.log(`${name.toUpperCase()}:`, data);
  }
  
  console.log('--- Fim da Auditoria ---');
}

deepAudit();
