
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

async function checkRLS() {
  console.log('--- Auditoria de RLS (DEV) ---');
  
  const query = `
    SELECT tablename, policyname, cmd, qual 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename IN ('modulos', 'aulas')
  `;
  
  const { data, error } = await supabase.rpc('query_sql', { sql_query: query });
  
  if (error) {
    console.error('Erro ao verificar RLS:', error.message);
  } else {
    console.log('Políticas Ativas:', data);
    
    const hasAdminPolicy = data.some(p => p.policyname.toLowerCase().includes('admin'));
    if (!hasAdminPolicy) {
      console.log('⚠️ AVISO: Nenhuma política explicitamente de ADMIN encontrada. Isso pode bloquear o acesso.');
    }
  }
}

checkRLS();
