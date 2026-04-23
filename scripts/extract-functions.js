
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

const rpcNames = [
    'get_modulos_curso',
    'is_admin',
    'tem_acesso_curso',
    'get_user_role',
    'validar_cupom',
    'marcar_aula_concluida',
    'incrementar_acesso_aula',
    'obter_progresso_pilar',
    'calcular_ranking_geral'
];

async function extractFunctions() {
  console.log('🧪 Extraindo definições de funções RPC...');
  
  let functionsSql = '\n-- FUNÇÕES RPC (EXTRAÍDAS)\n';

  for (const name of rpcNames) {
    try {
      const query = `
        SELECT 
            pg_get_functiondef(p.oid) as definition
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = '${name}';
      `;
      
      const { data, error } = await prodSupabase.rpc('exec_sql', { sql: query });
      
      if (data && data[0] && data[0].definition) {
        functionsSql += `\n-- Função: ${name}\n`;
        functionsSql += data[0].definition + ';\n';
        console.log(`✅ Função ${name} extraída.`);
      } else {
        console.log(`⚠️ Função ${name} não encontrada ou sem acesso.`);
      }
    } catch (e) {
      console.log(`❌ Erro ao extrair ${name}:`, e.message);
    }
  }

  fs.appendFileSync('SCHEMA_PROD_REAL.sql', functionsSql);
  console.log('💾 Definições de funções salvas no SCHEMA_PROD_REAL.sql');
}

extractFunctions();
