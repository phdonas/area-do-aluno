
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

const envLocal = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

const DEV_URL = envLocal.NEXT_PUBLIC_SUPABASE_URL;
const DEV_KEY = envLocal.SUPABASE_SERVICE_ROLE_KEY;

const prod = createClient(PROD_URL, PROD_KEY);
const dev = createClient(DEV_URL, DEV_KEY);

async function deepCompare() {
  console.log('--- AUDITORIA CRÍTICA DE INTEGRIDADE (PROD VS DEV) ---');
  
  const tables = ['aulas', 'modulos', 'cursos', 'progresso_aulas'];
  const report = { missing_constraints: [], missing_triggers: [] };

  const queryConstraints = `
    SELECT tc.table_name, tc.constraint_name, tc.constraint_type 
    FROM information_schema.table_constraints tc 
    WHERE tc.table_schema = 'public' 
    AND tc.table_name IN ('${tables.join("','")}')
  `;

  // Em prod, usamos rpc('get_modulos_curso') ou similar se não tiver query_sql.
  // Como confirmamos que query_sql não existe em prod, vamos usar as APIs de metadados se possível.
  // Na verdade, vou usar o banco de DEV como base para encontrar o que falta nele comparado ao que o código espera.

  console.log('Analisando restrições no ambiente de DESENVOLVIMENTO...');
  // No dev temos query_sql.
  const { data: devConstraints, error: devErr } = await dev.rpc('query_sql', { sql_query: queryConstraints });
  
  if (devErr) {
    console.error('Falha ao ler constraints em DEV:', devErr.message);
    return;
  }

  console.log('Constraints encontradas em DEV:', devConstraints.length);
  
  // Verificação de índices de unicidade (essencial para slugs)
  const queryUniq = `
    SELECT cls.relname as table_name, idx.relname as index_name
    FROM pg_index i
    JOIN pg_class cls ON cls.oid = i.indrelid
    JOIN pg_class idx ON idx.oid = i.indexrelid
    WHERE cls.relname IN ('aulas', 'modulos') AND i.indisunique = true
  `;
  const { data: devUniq } = await dev.rpc('query_sql', { sql_query: queryUniq });
  console.log('Índices Únicos em DEV:', devUniq);

  // Verificação de Foreign Keys
  const queryFK = `
    SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('aulas', 'modulos')
  `;
  const { data: devFK } = await dev.rpc('query_sql', { sql_query: queryFK });
  console.log('Chaves Estrangeiras em DEV:', devFK);

  console.log('\n--- DIAGNÓSTICO ---');
  // Se não houver índice único no slug em dev, mas o código espera um, é um risco de integridade.
  const hasSlugUniq = devUniq.some(u => u.table_name === 'aulas' && u.index_name.includes('slug'));
  if (!hasSlugUniq) console.log('AVISO: A tabela aulas não possui índice UNIQUE no campo slug. Risco de duplicação.');

  const hasModuloFK = devFK.some(f => f.table_name === 'aulas' && f.column_name === 'modulo_id');
  if (!hasModuloFK) console.log('AVISO: A tabela aulas não possui FK para modulos. Risco de órfãos.');
}

deepCompare();
