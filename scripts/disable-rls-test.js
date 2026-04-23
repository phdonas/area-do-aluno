
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

const sql = `
-- Desativa o RLS temporariamente para teste de visibilidade
ALTER TABLE public.cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos_modulos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos_aulas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas DISABLE ROW LEVEL SECURITY;

-- Garante que o cache seja limpo
NOTIFY pgrst, 'reload schema';
`;

async function disableRLS() {
  console.log('🔓 Desativando RLS temporariamente para diagnóstico...');
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  console.log('✅ RLS desativado. Agora a função TEM que retornar os dados.');
}

disableRLS();
