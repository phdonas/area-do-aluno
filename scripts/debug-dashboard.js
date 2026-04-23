
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
const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function debugDashboard() {
  console.log('--- DEBBUGING DASHBOARD QUERIES ---');
  
  const { data: user } = await supabaseAdmin.from('usuarios').select('id').eq('email', 'admin@phdonassolo.com').single();
  
  if (!user) {
    console.log('Usuário admin não encontrado para o teste.');
    return;
  }

  console.log('Testando query de assinaturas...');
  const { error: assError } = await supabaseAdmin
    .from('assinaturas')
    .select('curso_id, created_at, cursos(*), planos!left(is_global)')
    .eq('usuario_id', user.id)
    .limit(1);

  if (assError) {
    console.log('❌ Erro Assinaturas:', assError.message);
    console.log('Código:', assError.code);
    console.log('Detalhes:', assError.details);
    console.log('Dica:', assError.hint);
  } else {
    console.log('✅ Query Assinaturas funcionou!');
  }

  console.log('\nTestando query de gamificação...');
  const { error: gamError } = await supabaseAdmin
    .from('usuarios')
    .select('phd_coins_total, phd_nivel, streak_dias')
    .eq('id', user.id)
    .single();

  if (gamError) {
    console.log('❌ Erro Gamificação:', gamError.message);
  } else {
    console.log('✅ Query Gamificação funcionou!');
  }
}

debugDashboard();
