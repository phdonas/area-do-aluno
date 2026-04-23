
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

const queries = [
  // 1. Cursos <-> Módulos (Tabela de Junção se existir)
  `ALTER TABLE public.cursos_modulos DROP CONSTRAINT IF EXISTS cursos_modulos_curso_id_fkey;`,
  `ALTER TABLE public.cursos_modulos ADD CONSTRAINT cursos_modulos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;`,
  `ALTER TABLE public.cursos_modulos DROP CONSTRAINT IF EXISTS cursos_modulos_modulo_id_fkey;`,
  `ALTER TABLE public.cursos_modulos ADD CONSTRAINT cursos_modulos_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;`,

  // 2. Módulos <-> Aulas (Tabela de Junção se existir)
  `ALTER TABLE public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_modulo_id_fkey;`,
  `ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;`,
  `ALTER TABLE public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_aula_id_fkey;`,
  `ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;`,

  // 3. Vínculos Diretos (Fallback)
  `ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS modulos_curso_id_fkey;`,
  `ALTER TABLE public.modulos ADD CONSTRAINT modulos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;`,
  `ALTER TABLE public.aulas DROP CONSTRAINT IF EXISTS aulas_modulo_id_fkey;`,
  `ALTER TABLE public.aulas ADD CONSTRAINT aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE SET NULL;`,

  // 4. Assinaturas e Planos
  `ALTER TABLE public.assinaturas DROP CONSTRAINT IF EXISTS assinaturas_plano_id_fkey;`,
  `ALTER TABLE public.assinaturas ADD CONSTRAINT assinaturas_plano_id_fkey FOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE SET NULL;`,
  `ALTER TABLE public.planos_cursos DROP CONSTRAINT IF EXISTS planos_cursos_plano_id_fkey;`,
  `ALTER TABLE public.planos_cursos ADD CONSTRAINT planos_cursos_plano_id_fkey FOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE CASCADE;`,
  `ALTER TABLE public.planos_cursos DROP CONSTRAINT IF EXISTS planos_cursos_curso_id_fkey;`,
  `ALTER TABLE public.planos_cursos ADD CONSTRAINT planos_cursos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;`
];

async function restoreAllFKs() {
  console.log('🔗 Restaurando TODAS as chaves estrangeiras detectadas...');
  for (const sql of queries) {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      // Ignora erro se a tabela não existir, pois algumas são opcionais no schema
      if (error.message.includes('does not exist')) {
        console.log(`⚠️ Pulando (tabela não existe): ${sql.substring(0, 40)}...`);
      } else {
        console.error(`❌ Erro na query [${sql.substring(0, 50)}...]:`, error.message);
      }
    } else {
      console.log(`✅ Sucesso: ${sql.substring(0, 60)}...`);
    }
  }
  
  await supabase.rpc('exec_sql', { sql_query: "NOTIFY pgrst, 'reload schema';" });
  console.log('🏁 Relacionamentos restaurados e cache notificado!');
}

restoreAllFKs();
