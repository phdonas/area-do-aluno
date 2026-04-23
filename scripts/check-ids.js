
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

const envDev = getEnv('.env.local');
const devSupabase = createClient(envDev.NEXT_PUBLIC_SUPABASE_URL, envDev.SUPABASE_SERVICE_ROLE_KEY);

async function checkIds() {
  console.log('--- COMPARANDO IDs (AUTH vs PUBLIC) ---');
  
  // 1. Pegar do Auth (via admin API)
  const { data: { users }, error: authError } = await devSupabase.auth.admin.listUsers();
  const authUser = users.find(u => u.email === 'admin@phdonassolo.com');
  
  if (!authUser) {
    console.log('❌ Usuário não encontrado no Auth.');
    return;
  }
  console.log('Auth ID:', authUser.id);

  // 2. Pegar da tabela Public
  const { data: pubUser, error: pubError } = await devSupabase
    .from('usuarios')
    .select('id, email')
    .eq('email', 'admin@phdonassolo.com')
    .single();

  if (pubError) {
    console.log('❌ Usuário não encontrado na tabela public.usuarios.');
  } else {
    console.log('Public ID:', pubUser.id);
    
    if (authUser.id === pubUser.id) {
      console.log('✅ IDs COINCIDEM.');
    } else {
      console.log('🚨 IDs DIFERENTES! Isso quebra o RLS.');
    }
  }
}

checkIds();
