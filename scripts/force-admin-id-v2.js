
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

const targetId = '646a042e-ca37-4cd8-a579-d249dca08017';
const oldId = 'dc316917-5c38-4a67-8c77-364bb70c4ec3';

async function forceUpdateById() {
    console.log('🔨 Forçando troca de ID OLD -> NEW...');
    
    const sql = `
    DO $$ 
    BEGIN
        SET session_replication_role = 'replica';
        
        -- Deleta o ocupante do ID novo
        DELETE FROM public.usuarios WHERE id = '${targetId}';
        
        -- Troca o ID do registro existente
        UPDATE public.usuarios 
        SET id = '${targetId}', 
            is_admin = TRUE, 
            role = 'admin', 
            is_staff = TRUE
        WHERE id = '${oldId}';
        
        SET session_replication_role = 'origin';
    END $$;
    `;

    const { data, error } = await devSupabase.rpc('exec_sql', { sql });
    
    if (error) {
        console.error('❌ Erro:', error.message);
    } else {
        console.log('✅ Verificando...');
        const { data: check } = await devSupabase.rpc('exec_sql', { 
            sql: `SELECT id, email, is_admin FROM public.usuarios WHERE id = '${targetId}'` 
        });
        console.log('👤 Resultado:', JSON.stringify(check, null, 2));
    }
}

forceUpdateById();
