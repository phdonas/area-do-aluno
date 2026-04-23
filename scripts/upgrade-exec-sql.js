
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
const devSupabase = createClient(envDev.NEXT_PUBLIC_SUPABASE_URL, envDev.NEXT_PUBLIC_SUPABASE_ROLE_KEY || envDev.SUPABASE_SERVICE_ROLE_KEY);

const upgradeSql = `
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    EXECUTE 'SELECT json_agg(t) FROM (' || sql || ') t' INTO result;
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM, 'sql', sql);
END;
$$;
`;

async function upgrade() {
    // Como exec_sql está quebrado, vamos tentar usar o SQL Editor ou rodar via pg se tivéssemos a URL.
    // Mas pera, se eu usar o supabase client, eu só posso rodar RPC se ela existir.
    // Vou tentar rodar a RPC antiga para criar a nova.
    
    console.log('🆙 Atualizando exec_sql...');
    const { data, error } = await devSupabase.rpc('exec_sql', { sql: upgradeSql });
    if (error) {
        console.error('❌ Erro:', error.message);
    } else {
        console.log('✅ Função atualizada! Rodando diagnóstico...');
        const { data: users } = await devSupabase.rpc('exec_sql', { sql: 'SELECT id, email, is_admin, role FROM public.usuarios' });
        console.log('👥 Usuários no Banco Dev:\n', JSON.stringify(users, null, 2));
    }
}

upgrade();
