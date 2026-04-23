
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

const envDev = getEnv('.env.local');
const devSupabase = createClient(envDev.NEXT_PUBLIC_SUPABASE_URL, envDev.SUPABASE_SERVICE_ROLE_KEY);

async function resetAndApply() {
  console.log('🧹 Limpando schema public no Dev...');
  
  // Limpeza total
  const { error: dropError } = await devSupabase.rpc('exec_sql', { 
    sql: 'DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;' 
  });

  if (dropError) {
      console.error('❌ Erro ao limpar schema:', dropError.message);
      return;
  }
  console.log('✨ Schema public limpo com sucesso.');

  console.log('🚀 Aplicando SCHEMA_CONSOLIDADO_FINAL.sql...');
  const sql = fs.readFileSync('SCHEMA_CONSOLIDADO_FINAL.sql', 'utf8');
  
  // Enviar em blocos (separados por ;) para evitar timeout e falhas de parser
  const statements = sql.split(/;\s*$/m);
  
  for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      const { error } = await devSupabase.rpc('exec_sql', { sql: stmt + ';' });
      if (error) {
          console.error(`⚠️ Erro no bloco ${i+1}:`, error.message);
          console.log('SQL do bloco:', stmt.substring(0, 100) + '...');
      }
  }

  console.log('🏁 Processo de aplicação concluído!');
}

resetAndApply();
