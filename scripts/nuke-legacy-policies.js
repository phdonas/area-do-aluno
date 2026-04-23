
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

async function nuke() {
  console.log('🔨 Limpando políticas legadas e resetando segurança...');
  
  const sql = `
    -- Limpeza total
    DROP POLICY IF EXISTS "Admin full access" ON public.modulos;
    DROP POLICY IF EXISTS "Student view access" ON public.modulos;
    DROP POLICY IF EXISTS "Admin_Full_Access" ON public.modulos;
    DROP POLICY IF EXISTS "Student_Read_Assigned_Modules" ON public.modulos;
    
    DROP POLICY IF EXISTS "Admin_Full_Access" ON public.aulas;
    DROP POLICY IF EXISTS "Student_Read_Assigned_Lessons" ON public.aulas;

    -- Recriação Limpa
    CREATE POLICY "Admin_Full_Access" ON public.modulos FOR ALL TO authenticated USING (public.is_admin());
    CREATE POLICY "Student_Read_Assigned_Modules" ON public.modulos FOR SELECT TO authenticated USING (TRUE);
    
    CREATE POLICY "Admin_Full_Access" ON public.aulas FOR ALL TO authenticated USING (public.is_admin());
    CREATE POLICY "Student_Read_Assigned_Lessons" ON public.aulas FOR SELECT TO authenticated USING (TRUE);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Erro:', error.message);
  } else {
    console.log('✅ Políticas resetadas e limpas com sucesso!');
  }
}

nuke();
