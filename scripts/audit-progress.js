
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

async function auditProgress() {
  console.log('--- Auditoria de Progresso de Aulas ---');
  
  const { data: cols } = await supabase.rpc('exec_sql_v2', { 
    query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'progresso_aulas'" 
  });
  console.log('Colunas:', cols);

  const { data: policies } = await supabase.rpc('exec_sql_v2', { 
    query: "SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'progresso_aulas'" 
  });
  console.log('Políticas RLS:', policies);

  const { data: sample } = await supabase.from('progresso_aulas').select('*').limit(1);
  console.log('Amostra de dados:', sample);

  console.log('--- Fim da Auditoria ---');
}

auditProgress();
