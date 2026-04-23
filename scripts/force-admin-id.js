
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
const adminEmail = 'admin@phdonassolo.com';

async function forceUpdate() {
    console.log('🔨 Iniciando atualização forçada de ID...');
    
    const sql = `
    DO $$ 
    BEGIN
        -- Desabilitar gatilhos e FKs
        SET session_replication_role = 'replica';
        
        -- Deletar possível duplicado (usuário limpo do dev)
        DELETE FROM public.usuarios WHERE id = '${targetId}';
        
        -- Atualizar o perfil de Admin com o ID novo
        UPDATE public.usuarios 
        SET id = '${targetId}', 
            is_admin = TRUE, 
            role = 'admin', 
            is_staff = TRUE,
            status = 'ativo'
        WHERE email = '${adminEmail}';
        
        -- Reabilitar gatilhos
        SET session_replication_role = 'origin';
    END $$;
    `;

    const { data, error } = await devSupabase.rpc('exec_sql', { sql });
    
    if (error) {
        console.error('❌ Erro no Banco:', error.message);
    } else {
        console.log('✅ Comando enviado. Verificando resultado...');
        const { data: check } = await devSupabase.rpc('exec_sql', { 
            sql: `SELECT id, email, is_admin FROM public.usuarios WHERE id = '${targetId}'` 
        });
        console.log('👤 Perfil no Banco:', JSON.stringify(check, null, 2));
    }
}

forceUpdate();
