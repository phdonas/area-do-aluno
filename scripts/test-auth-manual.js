const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(
    fs.readFileSync('c:\\Projetos\\phdonassolo-site\\area-do-aluno\\.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('='))
    .map(([k, ...v]) => [k.trim(), v.join('=').trim()])
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    console.log('🧪 Iniciando teste manual de inserção no Auth...');
    
    const sql = `
    WITH ins AS (
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, is_sso_user, is_anonymous
        ) VALUES (
            gen_random_uuid(), 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated', 
            'teste_manual_debug@gmail.com', 
            'dummy_hash', 
            now(), 
            '{"provider": "email", "providers": ["email"]}', 
            '{}', 
            now(), 
            now(), 
            false, 
            false
        ) RETURNING id
    ) SELECT id FROM ins`;

    const { data, error } = await db.rpc('exec_sql', { sql });
    
    if (error) {
        console.error('❌ Erro no RPC:', error.message);
    } else if (data.error) {
        console.error('❌ ERRO REAL DO BANCO:', data.error);
    } else {
        console.log('✅ SUCESSO! O banco aceitou o SQL manual.');
    }
}

test();
