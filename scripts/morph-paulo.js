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

async function debugAuth() {
    try {
        console.log('1. Criando função de diagnóstico...');
        const sqlFunc = `
            CREATE OR REPLACE FUNCTION public.debug_auth_v2() RETURNS text AS $$ 
            BEGIN 
                INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, last_sign_in_at) 
                VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'debug_final@test.com', 'dummy', now(), now(), now(), now()); 
                RETURN 'SUCESSO'; 
            EXCEPTION WHEN OTHERS THEN 
                RETURN 'ERRO: ' || SQLERRM || ' | DETALHE: ' || SQLSTATE; 
            END; $$ LANGUAGE plpgsql SECURITY DEFINER;`;
            
        await db.rpc('exec_sql', { sql: sqlFunc });

        console.log('2. Executando inserção de teste...');
        const { data, error } = await db.rpc('exec_sql', { sql: 'SELECT public.debug_auth_v2() as msg' });
        
        if (error) throw error;
        console.log('🕵️‍♂️ REVELAÇÃO DO BANCO:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('❌ Erro no diagnóstico:', e.message);
    }
}

debugAuth();
