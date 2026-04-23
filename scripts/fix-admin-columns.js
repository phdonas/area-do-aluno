
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

async function fix() {
  console.log('🔨 Normalizando colunas de Admin na tabela usuarios...');
  
  const sql = `
    -- 1. Garantir que as colunas existem
    ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE;

    -- 2. Sincronizar dados
    UPDATE public.usuarios SET is_admin = TRUE WHERE role = 'admin';
    UPDATE public.usuarios SET is_admin = TRUE WHERE email = 'pdonassolo1@gmail.com';
    UPDATE public.usuarios SET is_admin = TRUE WHERE email = 'admin@phdonassolo.com';
    UPDATE public.usuarios SET is_admin = TRUE WHERE email = 'ph@phdonassolo.com';
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Erro:', error.message);
  } else {
    console.log('✅ Colunas de Admin sincronizadas com sucesso!');
  }
}

fix();
