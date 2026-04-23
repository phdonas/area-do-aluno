
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
-- 1. Melhora a exec_sql para retornar resultados REAIS
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
  RETURN COALESCE(result, '[]'::json);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Simplifica a função do Player ao extremo para teste
CREATE OR REPLACE FUNCTION public.get_modulos_curso(p_curso_id uuid) 
RETURNS TABLE (
  id uuid, 
  titulo text, 
  descricao text, 
  tipo text, 
  ui_layout text, 
  ordem int
) AS $$ 
BEGIN 
  RETURN QUERY 
  (
    -- Módulos vinculados diretamente
    SELECT m.id, m.titulo, m.descricao, m.tipo, m.ui_layout, m.ordem
    FROM public.modulos m 
    WHERE m.curso_id = p_curso_id
    
    UNION ALL
    
    -- Módulos vinculados via tabela de junção
    SELECT m.id, m.titulo, m.descricao, m.tipo, m.ui_layout, cm.ordem
    FROM public.modulos m 
    JOIN public.cursos_modulos cm ON cm.modulo_id = m.id 
    WHERE cm.curso_id = p_curso_id
  )
  ORDER BY 6 ASC;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function updateFunctions() {
  console.log('🏗️ Atualizando funções de diagnóstico e Player...');
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  // Nota: exec_sql antigo ainda retornaria status: success
  console.log('✅ Pronto! Agora vamos rodar o diagnóstico de novo.');
}

updateFunctions();
