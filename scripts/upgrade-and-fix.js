
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

const upgradeSql = `
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    IF sql ~* '^\\s*(SELECT|WITH)' THEN
        EXECUTE 'SELECT json_agg(t) FROM (' || sql || ') t' INTO result;
    ELSE
        EXECUTE sql;
        result := '{"status": "success"}'::jsonb;
    END IF;
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM, 'sql', sql);
END;
$$;
`;

async function upgradeAndFix() {
    console.log('🆙 Atualizando exec_sql para V3...');
    await devSupabase.rpc('exec_sql', { sql: upgradeSql });
    
    console.log('🔗 Aplicando FIX_RELACOES_FINAL.sql...');
    const fixSql = fs.readFileSync('FIX_RELACOES_FINAL.sql', 'utf8');
    const { data, error } = await devSupabase.rpc('exec_sql', { sql: fixSql });
    
    if (error) {
        console.error('❌ Erro:', error.message);
    } else {
        console.log('✅ Relacionamentos corrigidos com sucesso!');
    }
}

upgradeAndFix();
