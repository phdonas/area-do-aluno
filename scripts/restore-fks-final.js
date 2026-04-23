
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
  // 1. Relacionamentos de Cursos e Módulos
  `ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS modulos_curso_id_fkey;`,
  `ALTER TABLE public.modulos ADD CONSTRAINT modulos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;`,
  
  // 2. Relacionamentos de Aulas e Módulos (Direto)
  `ALTER TABLE public.aulas DROP CONSTRAINT IF EXISTS aulas_modulo_id_fkey;`,
  `ALTER TABLE public.aulas ADD CONSTRAINT aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE SET NULL;`,

  // 3. Relacionamentos de Tabela de Ligação (modulos_aulas)
  `ALTER TABLE public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_modulo_id_fkey;`,
  `ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;`,
  
  `ALTER TABLE public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_aula_id_fkey;`,
  `ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;`,

  // 4. Relacionamentos de Assinaturas
  `ALTER TABLE public.assinaturas DROP CONSTRAINT IF EXISTS assinaturas_usuario_id_fkey;`,
  `ALTER TABLE public.assinaturas ADD CONSTRAINT assinaturas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;`,
  
  `ALTER TABLE public.assinaturas DROP CONSTRAINT IF EXISTS assinaturas_curso_id_fkey;`,
  `ALTER TABLE public.assinaturas ADD CONSTRAINT assinaturas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;`,

  // 5. Relacionamentos de Progresso
  `ALTER TABLE public.progresso_aulas DROP CONSTRAINT IF EXISTS progresso_aulas_usuario_id_fkey;`,
  `ALTER TABLE public.progresso_aulas ADD CONSTRAINT progresso_aulas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;`,
  
  `ALTER TABLE public.progresso_aulas DROP CONSTRAINT IF EXISTS progresso_aulas_aula_id_fkey;`,
  `ALTER TABLE public.progresso_aulas ADD CONSTRAINT progresso_aulas_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;`
];

async function restoreFKs() {
  console.log('🔗 Restaurando chaves estrangeiras (relacionamentos)...');
  for (const sql of queries) {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.error(`❌ Erro na query [${sql.substring(0, 50)}...]:`, error.message);
    } else {
      console.log(`✅ Sucesso: ${sql.substring(0, 60)}...`);
    }
  }
  
  // Notifica o PostgREST para recarregar o cache de esquema
  await supabase.rpc('exec_sql', { sql_query: "NOTIFY pgrst, 'reload schema';" });
  
  console.log('🏁 Relacionamentos restaurados! O cache do Supabase será atualizado em instantes.');
}

restoreFKs();
