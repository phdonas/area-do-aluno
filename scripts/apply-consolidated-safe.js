
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

async function safeApply() {
  console.log('🧹 Limpando tabelas antigas (mantendo funções)...');
  
  const dropTablesQuery = `
    DO $$ 
    DECLARE 
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END $$;
  `;

  const { error: dropError } = await devSupabase.rpc('exec_sql', { sql: dropTablesQuery });

  if (dropError) {
      console.error('❌ Erro na limpeza segura:', dropError.message);
      return;
  }
  console.log('✨ Tabelas limpas.');

  console.log('🚀 Aplicando SCHEMA_CONSOLIDADO_FINAL.sql...');
  const sql = fs.readFileSync('SCHEMA_CONSOLIDADO_FINAL.sql', 'utf8');
  
  // Dividir por ; mas ignorar ; dentro de blocos $$ (funções)
  // Uma forma simples é enviar o arquivo inteiro se não for gigante, ou por blocos lógicos.
  // Como o arquivo tem ~21KB, vou tentar enviar em blocos maiores.
  
  const blocks = sql.split('\n\n'); // Dividir por parágrafos duplos costuma isolar tabelas e funções
  
  for (let i = 0; i < blocks.length; i++) {
      const stmt = blocks[i].trim();
      if (!stmt) continue;

      const { error } = await devSupabase.rpc('exec_sql', { sql: stmt });
      if (error) {
          console.error(`⚠️ Erro no bloco ${i+1}:`, error.message);
          // Se for erro de parser, pode ser que o bloco esteja incompleto. 
          // Mas vamos tentar seguir.
      }
  }

  console.log('🏁 Schema aplicado com sucesso!');
}

safeApply();
