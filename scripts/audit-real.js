
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function parseEnv(path) {
  const content = fs.readFileSync(path, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim();
  });
  return env;
}

const prodEnv = parseEnv('.env.production.backup');
const supabaseProd = createClient(prodEnv.NEXT_PUBLIC_SUPABASE_URL, prodEnv.SUPABASE_SERVICE_ROLE_KEY);

async function auditSchema() {
  console.log('--- INICIANDO AUDIT DE SCHEMA REAL (PRODUÇÃO) ---');
  
  // 1. Buscar todas as tabelas do schema public
  const { data: tables, error: tableError } = await supabaseProd.rpc('get_tables_info'); 
  
  // Se a RPC não existir, vamos usar uma query SQL direta via query builder se possível, 
  // mas o Supabase JS não permite rodar arbitrary SQL facilmente sem RPC.
  // Vou usar a tabela information_schema.columns que é acessível via API se não houver RLS (com service_role é ok).
  
  console.log('Coletando colunas do information_schema...');
  const { data: columns, error: colError } = await supabaseProd
    .from('columns')
    .select('table_name, column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public')
    .order('table_name', { ascending: true });

  if (colError) {
    // Se falhar o acesso direto à view do sistema (comum em algumas configs), tentaremos outra forma
    console.error('Erro ao acessar information_schema diretamente:', colError.message);
    return;
  }

  const schemaMap = {};
  columns.forEach(col => {
    if (!schemaMap[col.table_name]) schemaMap[col.table_name] = [];
    schemaMap[col.table_name].push(col);
  });

  let sql = '-- SCHEMA REAL EXTRAÍDO DA PRODUÇÃO\n';
  sql += '-- Gerado em: ' + new Date().toLocaleString() + '\n\n';

  for (const table in schemaMap) {
    sql += `CREATE TABLE IF NOT EXISTS public.${table} (\n`;
    const colDefs = schemaMap[table].map(c => {
      let def = `  ${c.column_name} ${c.data_type}`;
      if (c.is_nullable === 'NO') def += ' NOT NULL';
      if (c.column_default) def += ` DEFAULT ${c.column_default}`;
      return def;
    });
    sql += colDefs.join(',\n');
    sql += '\n);\n\n';
  }

  fs.writeFileSync('SCHEMA_PRODUCAO_REAL.sql', sql);
  console.log('--- AUDIT CONCLUÍDO! Arquivo SCHEMA_PRODUCAO_REAL.sql gerado. ---');
}

auditSchema();
