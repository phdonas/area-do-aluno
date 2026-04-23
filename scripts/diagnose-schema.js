
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

const env = getEnv('.env.local');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function diagnose() {
  console.log('🔍 Iniciando diagnóstico de estrutura...');
  
  // 1. Verificar colunas de modulos_aulas
  const { data: columns } = await supabase.rpc('exec_sql', { 
    sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'modulos_aulas';" 
  });
  console.log('📊 Colunas de modulos_aulas:', columns);

  // 2. Verificar Foreign Keys
  const { data: fks } = await supabase.rpc('exec_sql', { 
    sql_query: `
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
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='modulos_aulas';
    ` 
  });
  console.log('🔗 Relacionamentos (FKs):', fks);

  // 3. Testar a query exata que a página faz
  console.log('🧪 Testando query da página...');
  const { data: test, error } = await supabase
    .from('aulas')
    .select('*, modulos_aulas(count)')
    .limit(5);
    
  if (error) {
    console.error('❌ Erro na query principal:', error);
  } else {
    console.log('✅ Query principal funcionou! Itens:', test.length);
  }
}

diagnose();
