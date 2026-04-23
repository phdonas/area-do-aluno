
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v) env[k.trim()] = v.join('=').trim();
});

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function runAudit() {
    console.log('🔍 Iniciando Auditoria Profunda...');
    
    // 1. Verificar Tabelas
    const { data: tables, error: tErr } = await db.rpc('exec_sql', { 
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" 
    });
    
    if (tErr) {
        console.error('❌ Erro ao listar tabelas:', tErr);
        return;
    }

    console.log(`✅ Encontradas ${tables.length} tabelas.`);

    // 2. Contar Dados e Verificar FKs
    const auditData = [];
    for (let t of tables) {
        const tableName = t.table_name;
        const { count, error: cErr } = await db.from(tableName).select('*', { count: 'exact', head: true });
        
        const { data: fks } = await db.rpc('exec_sql', {
            sql: `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = '${tableName}' AND constraint_type = 'FOREIGN KEY'`
        });

        auditData.push({
            tabela: tableName,
            registros: count || 0,
            fks: (fks || []).map(f => f.constraint_name)
        });
    }

    console.table(auditData);
    
    // 3. Verificar Erro de Cache do PostgREST
    const { data: test, error: pErr } = await db.from('cursos').select('*').limit(1);
    if (pErr) {
        console.log('🚨 ERRO DE ACESSO AOS CURSOS:', pErr.message);
    } else {
        console.log('✅ Acesso à tabela "cursos" está OK via API.');
    }
}

runAudit();
