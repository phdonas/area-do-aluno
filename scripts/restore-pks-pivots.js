
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

async function restorePKs() {
  console.log('🛠️ Restaurando Chaves Primárias em Tabelas Pivot (DEV)...');
  
  const sql = `
    -- Remove duplicatas antes de criar PK (segurança)
    DELETE FROM public.cursos_modulos a USING public.cursos_modulos b WHERE a.ctid < b.ctid AND a.curso_id = b.curso_id AND a.modulo_id = b.modulo_id;
    DELETE FROM public.modulos_aulas a USING public.modulos_aulas b WHERE a.ctid < b.ctid AND a.modulo_id = b.modulo_id AND a.aula_id = b.aula_id;
    
    -- Adiciona as PKs
    ALTER TABLE public.cursos_modulos ADD PRIMARY KEY (curso_id, modulo_id);
    ALTER TABLE public.modulos_aulas ADD PRIMARY KEY (modulo_id, aula_id);
    ALTER TABLE public.instrutores_cursos ADD PRIMARY KEY (instrutor_id, curso_id);
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('Erro ao restaurar PKs:', error.message);
  } else {
    console.log('🚀 Estrutura de junção restaurada com sucesso!');
  }
}

restorePKs();
