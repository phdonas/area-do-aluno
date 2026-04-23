
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler .env.local manualmente
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  console.log('--- Verificando Projeto DEV ---');
  console.log('URL:', supabaseUrl);
  
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Erro ao listar usuários:', error.message);
    return;
  }

  const user = users.users.find(u => u.email === 'admin@phdonassolo.com');

  if (user) {
    console.log('✅ Usuário ENCONTRADO!');
    console.log('ID:', user.id);
    console.log('Confirmado em:', user.email_confirmed_at);
    console.log('Último Login:', user.last_sign_in_at);
  } else {
    console.log('❌ Usuário NÃO ENCONTRADO neste projeto.');
    console.log('Usuários existentes:', users.users.map(u => u.email));
  }
}

checkUser();
