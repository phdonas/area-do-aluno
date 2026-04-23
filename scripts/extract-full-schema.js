
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

const envProd = getEnv('.env.production.backup');
const prodSupabase = createClient(envProd.NEXT_PUBLIC_SUPABASE_URL, envProd.SUPABASE_SERVICE_ROLE_KEY);

async function extractSchema() {
  console.log('🚀 Iniciando Extração de Schema da Produção...');

  let tables;
  try {
    const { data, error } = await prodSupabase.rpc('exec_sql', {
      sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
    });
    if (error) throw error;
    tables = data;
  } catch (e) {
    console.log('⚠️ RPC exec_sql não disponível, tentando via PostgREST...');
    const { data } = await prodSupabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
    tables = data;
  }

  if (!tables || tables.length === 0) {
    console.error('❌ Não foi possível listar as tabelas. Verifique as permissões do Service Role Key.');
    return;
  }

  let sqlOutput = `-- ==============================================================================\n`;
  sqlOutput += `-- SCHEMA_PROD_REAL.sql\n`;
  sqlOutput += `-- Gerado em: ${new Date().toLocaleString()}\n`;
  sqlOutput += `-- ==============================================================================\n\n`;
  sqlOutput += `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;

  for (const tableRow of tables) {
    const tableName = tableRow.table_name || tableRow;
    console.log(`📦 Extraindo: ${tableName}...`);

    // Pegar colunas
    const { data: columns } = await prodSupabase.rpc('exec_sql', {
      sql: `SELECT column_name, data_type, column_default, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = '${tableName}' AND table_schema = 'public'
            ORDER BY ordinal_position`
    });

    if (columns) {
      sqlOutput += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
      const colDefs = columns.map(col => {
        let def = `  ${col.column_name} ${col.data_type.toUpperCase()}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) {
            // Limpar defaults complexos que podem falhar no restore direto
            if (!col.column_default.includes('nextval')) {
                def += ` DEFAULT ${col.column_default}`;
            }
        }
        return def;
      });
      sqlOutput += colDefs.join(',\n');
      sqlOutput += `\n);\n\n`;
    }
  }

  // 2. Extrair Chaves Estrangeiras (Relationships)
  console.log('🔗 Extraindo Relacionamentos...');
  const { data: fkeys } = await prodSupabase.rpc('exec_sql', {
    sql: `
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
    `
  });

  if (fkeys) {
    sqlOutput += `-- RELACIONAMENTOS (FOREIGN KEYS)\n`;
    fkeys.forEach(fk => {
      sqlOutput += `ALTER TABLE public.${fk.table_name} DROP CONSTRAINT IF EXISTS ${fk.table_name}_${fk.column_name}_fkey;\n`;
      sqlOutput += `ALTER TABLE public.${fk.table_name} ADD CONSTRAINT ${fk.table_name}_${fk.column_name}_fkey FOREIGN KEY (${fk.column_name}) REFERENCES public.${fk.foreign_table_name}(${fk.foreign_column_name}) ON DELETE CASCADE;\n\n`;
    });
  }

  fs.writeFileSync('SCHEMA_PROD_REAL.sql', sqlOutput);
  console.log('\n✅ Extração finalizada! Arquivo SCHEMA_PROD_REAL.sql gerado.');
}

extractSchema();
