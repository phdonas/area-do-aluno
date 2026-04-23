
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

async function checkPolicies() {
  console.log('--- Verificando Políticas de Segurança (RLS) ---');
  
  const sql = `
    SELECT tablename, policyname, cmd, roles 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('modulos', 'aulas', 'cursos')
  `;

  const { data, error } = await supabase.rpc('query_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Erro:', error.message);
  } else {
    console.log('✅ Políticas encontradas:', data);
  }
}

checkPolicies();
