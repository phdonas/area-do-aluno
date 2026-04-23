
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

async function fixPK() {
  console.log('🔨 Tentando aplicar Chave Primária em progresso_aulas...');
  
  const sql = `
    -- Remove duplicatas antes de aplicar a PK (garantia de sucesso)
    DELETE FROM public.progresso_aulas a
    USING public.progresso_aulas b
    WHERE a.ctid < b.ctid 
      AND a.usuario_id = b.usuario_id 
      AND a.aula_id = b.aula_id;

    -- Adiciona a Chave Primária
    ALTER TABLE public.progresso_aulas 
    ADD PRIMARY KEY (usuario_id, aula_id);
  `;

  const { error } = await supabase.rpc('exec_sql_v2', { query: sql });
  
  if (error) {
    console.error('❌ Erro:', error.message);
  } else {
    console.log('✅ Chave Primária aplicada com sucesso!');
  }
}

fixPK();
