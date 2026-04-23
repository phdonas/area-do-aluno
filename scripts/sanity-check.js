
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

async function sanity() {
  console.log('🧪 Teste de Sanidade de Ambiente...');
  
  // 1. Quem sou eu no banco?
  const { data: envInfo } = await supabase.rpc('exec_sql', { sql_query: 'SELECT current_database(), current_schema(), current_user' });
  console.log('🌍 Ambiente Banco:', envInfo);

  // 2. Quantos módulos o RPC vê?
  const { data: rpcCount } = await supabase.rpc('exec_sql', { sql_query: 'SELECT count(*) FROM public.modulos' });
  console.log('📊 Módulos (via RPC):', rpcCount);

  // 3. Quantos módulos o Node vê?
  const { data: nodeCount } = await supabase.from('modulos').select('*', { count: 'exact', head: true });
  console.log('📊 Módulos (via Node):', nodeCount);

  // 4. Teste de ID específico
  const id = '7da91d77-11b0-4d5f-ab60-8add450e6089';
  const { data: idCheck } = await supabase.rpc('exec_sql', { sql_query: `SELECT id FROM public.cursos WHERE id = '${id}'` });
  console.log('🆔 Curso Existe no RPC?', idCheck);
}

sanity();
