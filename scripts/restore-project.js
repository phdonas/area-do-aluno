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

async function restore() {
    try {
        console.log('1. Removendo travas fantasmas no esquema Auth...');
        const constraints = [
            '16498_16499_2_not_null',
            '16498_16499_33_not_null',
            '16498_16499_35_not_null'
        ];
        
        for (const c of constraints) {
            console.log(`   Removendo ${c}...`);
            const sql = `ALTER TABLE auth.users DROP CONSTRAINT IF EXISTS "${c}"`;
            await db.rpc('exec_sql', { sql });
        }

        console.log('2. Restaurando o gatilho original (limpo)...');
        const sqlTrigger = `
            CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ 
            BEGIN 
                INSERT INTO public.usuarios (id, email, nome, role, status) 
                VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Aluno'), 'student', 'ativo') 
                ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now(); 
                RETURN NEW; 
            END; $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;
        await db.rpc('exec_sql', { sql: sqlTrigger });

        console.log('3. Tentando criar o Admin novamente...');
        const { error: adminErr } = await db.auth.admin.createUser({ 
            email: 'admin@phdonassolo.com', 
            password: 'Password123!', 
            email_confirm: true 
        });
        
        if (adminErr) console.log('   Admin falhou:', adminErr.message);
        else console.log('   ✅ Admin RESTAURADO!');

        console.log('4. Tentando criar o Paulo...');
        const { error: pauloErr } = await db.auth.admin.createUser({ 
            email: 'pdonassolo1@gmail.com', 
            password: '123456', 
            email_confirm: true 
        });
        
        if (pauloErr) console.log('   Paulo falhou:', pauloErr.message);
        else console.log('   ✅ Paulo CRIADO!');

    } catch (e) {
        console.error('❌ Erro na restauração:', e.message);
    }
}

restore();
