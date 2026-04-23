
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

async function checkRpc() {
  console.log('--- TESTANDO RPC is_admin ---');
  const { data, error } = await devSupabase.rpc('is_admin');
  
  if (error) {
    console.log('❌ Erro na RPC is_admin:', error.message, error.code);
  } else {
    console.log('✅ RPC is_admin retornou:', data);
  }

  console.log('\n--- TESTANDO SELECT USUARIOS (SEM ADMIN BYPASS) ---');
  // Usando o client anon para simular o que o site faz
  const anonSupabase = createClient(envDev.NEXT_PUBLIC_SUPABASE_URL, envDev.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Como não temos o token JWT aqui facilmente, vamos apenas listar as políticas da tabela se possível via RPC ou assumir o erro
  const { data: policies, error: polError } = await devSupabase.rpc('get_policies', { table_name: 'usuarios' }).catch(e => ({error: {message: 'RPC get_policies não existe'}}));
  
  if (polError) {
     // Fallback: tentar ler um usuário aleatório com o anon key (deve falhar se RLS estiver on)
     const { data: testData, error: testError } = await anonSupabase.from('usuarios').select('id').limit(1);
     console.log('Tentativa de leitura anon:', testError ? 'Bloqueado (Bom/RLS Ativo)' : 'Aberto (Ruim/Sem RLS)');
  }
}

checkRpc();
