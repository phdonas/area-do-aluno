
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

async function auditOrphans() {
  console.log('--- Auditoria de Órfãos em DEV ---');
  
  // 1. Verificar contagem de tabelas de suporte
  const { count: qCount } = await supabase.from('questionarios').select('*', { count: 'exact', head: true });
  const { count: rCount } = await supabase.from('recursos').select('*', { count: 'exact', head: true });
  
  console.log('Questionários no banco:', qCount);
  console.log('Recursos no banco:', rCount);

  // 2. Buscar aulas que apontam para IDs inexistentes
  const query = `
    SELECT id, titulo, questionario_id, recurso_id 
    FROM public.aulas 
    WHERE 
      (questionario_id IS NOT NULL AND questionario_id NOT IN (SELECT id FROM public.questionarios))
      OR 
      (recurso_id IS NOT NULL AND recurso_id NOT IN (SELECT id FROM public.recursos))
  `;

  const { data: orphans, error } = await supabase.rpc('query_sql', { sql_query: query });
  
  if (error) {
    console.error('Erro na query:', error.message);
  } else {
    console.log('Total de Aulas Órfãs encontradas:', orphans.length);
    if (orphans.length > 0) {
      console.log('Amostra:', orphans.slice(0, 3));
    }
  }

  console.log('--- Fim da Auditoria ---');
}

auditOrphans();
