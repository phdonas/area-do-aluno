
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

async function extractDeepMetadata() {
  console.log('🔍 Iniciando Extração Profunda de Metadados (Funções e Regras)...');

  // Tentar extrair código das funções via routines
  const queryFunctions = `
    SELECT 
        routine_name, 
        routine_definition,
        data_type
    FROM information_schema.routines 
    WHERE routine_schema = 'public';
  `;

  // Tentar extrair triggers
  const queryTriggers = `
    SELECT 
        trigger_name, 
        event_object_table as table_name,
        action_statement as definition
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
  `;

  try {
    const { data: functions, error: fError } = await prodSupabase.rpc('exec_sql', { sql: queryFunctions });
    if (functions) {
        let sql = '\n-- CÓDIGO ORIGINAL DAS FUNÇÕES (PRODUÇÃO)\n';
        functions.forEach(f => {
            if (f.routine_definition) {
                sql += `CREATE OR REPLACE FUNCTION public.${f.routine_name}() RETURNS ${f.data_type} AS $$\n${f.routine_definition}\n$$ LANGUAGE plpgsql;\n\n`;
                console.log(`✅ Função ${f.routine_name} capturada.`);
            }
        });
        fs.appendFileSync('SCHEMA_PROD_REAL.sql', sql);
    }

    const { data: triggers, error: tError } = await prodSupabase.rpc('exec_sql', { sql: queryTriggers });
    if (triggers) {
        let sql = '\n-- GATILHOS (TRIGGERS)\n';
        triggers.forEach(t => {
            sql += `-- Trigger: ${t.trigger_name} na tabela ${t.table_name}\n-- ${t.definition}\n\n`;
            console.log(`✅ Gatilho ${t.trigger_name} mapeado.`);
        });
        fs.appendFileSync('SCHEMA_PROD_REAL.sql', sql);
    }

  } catch (e) {
    console.log('❌ Falha na extração profunda:', e.message);
  }
}

extractDeepMetadata();
