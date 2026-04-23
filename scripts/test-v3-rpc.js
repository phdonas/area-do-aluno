
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
-- Função NOVA com nome diferente para evitar qualquer cache
CREATE OR REPLACE FUNCTION public.get_modulos_v3(target_curso_id uuid) 
RETURNS JSON AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(t) FROM (
    SELECT DISTINCT
      m.id, 
      m.titulo, 
      m.descricao, 
      m.tipo, 
      m.ui_layout, 
      COALESCE(cm.ordem, m.ordem)::int as ordem 
    FROM public.modulos m 
    LEFT JOIN public.cursos_modulos cm ON cm.modulo_id = m.id 
    WHERE m.curso_id = target_curso_id OR cm.curso_id = target_curso_id 
    ORDER BY ordem ASC
  ) t INTO result;
  RETURN COALESCE(result, '[]'::json);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_modulos_v3(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_modulos_v3(uuid) TO anon;
`;

async function testV3() {
  console.log('🏗️ Criando get_modulos_v3...');
  await supabase.rpc('exec_sql', { sql_query: sql });
  
  console.log('🧪 Testando a NOVA função...');
  const { data, error } = await supabase.rpc('get_modulos_v3', { target_curso_id: '7da91d77-11b0-4d5f-ab60-8add450e6089' });
  console.log('RESULTADO V3:', JSON.stringify(data, null, 2));
}

testV3();
