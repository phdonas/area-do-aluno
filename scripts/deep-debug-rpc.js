
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

async function debug() {
  console.log('🔍 Diagnóstico Profundo...');
  
  // 1. Testa se o módulo existe
  const { data: m } = await supabase.from('modulos').select('id, titulo').eq('id', 'd589acca-4b89-43be-84f6-f7d4103fa030');
  console.log('📦 Módulo existe?', m?.length > 0 ? 'SIM' : 'NÃO');

  // 2. Testa se o vínculo existe
  const { data: c } = await supabase.from('cursos_modulos').select('*').eq('curso_id', '7da91d77-11b0-4d5f-ab60-8add450e6089');
  console.log('🔗 Vínculo existe?', c?.length > 0 ? 'SIM' : 'NÃO');

  // 3. Testa a query bruta via RPC
  const sql = `
    SELECT m.id, m.titulo 
    FROM public.modulos m 
    JOIN public.cursos_modulos cm ON m.id = cm.modulo_id 
    WHERE cm.curso_id = '7da91d77-11b0-4d5f-ab60-8add450e6089'
  `;
  const { data: result, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  console.log('🧪 Resultado SQL via RPC:', result);
  if (error) console.error('❌ Erro RPC:', error);

  // 4. Testa a função oficial novamente
  const { data: official } = await supabase.rpc('get_modulos_curso', { p_curso_id: '7da91d77-11b0-4d5f-ab60-8add450e6089' });
  console.log('📋 Resultado Função Oficial:', official);
}

debug();
