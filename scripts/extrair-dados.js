
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Função simples para carregar chaves sem depender de dotenv externo
function parseEnv(path) {
  const content = fs.readFileSync(path, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim();
  });
  return env;
}

// Carregar chaves de produção
const prodEnv = parseEnv('.env.production.backup');
const supabaseProd = createClient(prodEnv.NEXT_PUBLIC_SUPABASE_URL, prodEnv.SUPABASE_SERVICE_ROLE_KEY);

const tables = [
  'pilares',
  'planos',
  'cursos',
  'planos_cursos',
  'modulos',
  'aulas',
  'materiais_anexos',
  'ferramentas_saas',
  'simuladores_roleplay',
  'usuarios',
  'assinaturas',
  'progresso_aulas'
];

async function generateDump() {
  console.log('Iniciando extração de dados de PRODUÇÃO...');
  let fullSql = '-- SCRIPT DE CLONAGEM DE DADOS (PROD -> DEV)\n';
  fullSql += '-- Gerado em: ' + new Date().toLocaleString() + '\n\n';
  fullSql += 'SET check_function_bodies = false;\n\n';

  for (const table of tables) {
    console.log(`Extraindo tabela: ${table}...`);
    const { data, error } = await supabaseProd.from(table).select('*');
    
    if (error) {
      console.error(`Erro ao ler ${table}:`, error.message);
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`Tabela ${table} está vazia.`);
      continue;
    }

    fullSql += `-- Dados da tabela: ${table}\n`;
    fullSql += `TRUNCATE public.${table} CASCADE;\n`; // Limpa o que tiver no DEV antes de inserir

    data.forEach(row => {
      const keys = Object.keys(row);
      const values = keys.map(k => {
        const val = row[k];
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return val;
      });

      fullSql += `INSERT INTO public.${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
    });
    fullSql += '\n';
  }

  fs.writeFileSync('CLONE_DADOS_PROD.sql', fullSql);
  console.log('CONCLUÍDO! O arquivo CLONE_DADOS_PROD.sql foi criado.');
}

generateDump();
