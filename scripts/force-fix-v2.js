
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v) env[k.trim()] = v.join('=').trim();
});

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const commands = [
    // 1. Limpeza
    "DELETE FROM public.cursos_modulos WHERE curso_id NOT IN (SELECT id FROM public.cursos)",
    "DELETE FROM public.cursos_modulos WHERE modulo_id NOT IN (SELECT id FROM public.modulos)",
    "DELETE FROM public.modulos_aulas WHERE modulo_id NOT IN (SELECT id FROM public.modulos)",
    "DELETE FROM public.modulos_aulas WHERE aula_id NOT IN (SELECT id FROM public.aulas)",
    "DELETE FROM public.aulas WHERE modulo_id IS NOT NULL AND modulo_id NOT IN (SELECT id FROM public.modulos)",
    
    // 2. Relacionamentos (Standard App Names)
    "ALTER TABLE public.cursos_modulos DROP CONSTRAINT IF EXISTS cursos_modulos_curso_id_fkey",
    "ALTER TABLE public.cursos_modulos ADD CONSTRAINT cursos_modulos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE",
    
    "ALTER TABLE public.cursos_modulos DROP CONSTRAINT IF EXISTS cursos_modulos_modulo_id_fkey",
    "ALTER TABLE public.cursos_modulos ADD CONSTRAINT cursos_modulos_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE",
    
    "ALTER TABLE public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_modulo_id_fkey",
    "ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE",
    
    "ALTER TABLE public.modulos_aulas DROP CONSTRAINT IF EXISTS modulos_aulas_aula_id_fkey",
    "ALTER TABLE public.modulos_aulas ADD CONSTRAINT modulos_aulas_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE",
    
    "ALTER TABLE public.aulas DROP CONSTRAINT IF EXISTS aulas_modulo_id_fkey",
    "ALTER TABLE public.aulas ADD CONSTRAINT aulas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE SET NULL",
    
    "NOTIFY pgrst, 'reload schema'"
];

async function forceFix() {
    console.log('🚀 Iniciando Força Bruta de Vínculos...');
    for (let cmd of commands) {
        console.log(`📡 Executando: ${cmd.substring(0, 50)}...`);
        const { error } = await db.rpc('exec_sql', { sql: cmd });
        if (error) console.error(`❌ Erro em [${cmd}]:`, error.message);
    }
    console.log('✅ Tudo pronto! Refresh no App agora.');
}

forceFix();
