
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

async function normalize() {
  console.log('🔨 Iniciando Normalização Massiva do Banco...');
  
  const sql = `
    -- 1. Tabela de Aulas
    ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS slug TEXT;
    ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS video_url TEXT;
    ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS duracao_segundos INTEGER DEFAULT 0;
    ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS tipo_conteudo TEXT DEFAULT 'video';
    ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS questionario_id UUID;
    ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS recurso_id UUID;
    ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS liberacao_dias INTEGER DEFAULT 0;

    -- 2. Tabela de Materiais Anexos
    CREATE TABLE IF NOT EXISTS public.materiais_anexos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
      titulo TEXT NOT NULL,
      arquivo_url TEXT NOT NULL,
      tipo TEXT DEFAULT 'arquivo',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- 3. Habilitar RLS e Políticas para Materiais
    ALTER TABLE public.materiais_anexos ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admin_Full_Access" ON public.materiais_anexos;
    CREATE POLICY "Admin_Full_Access" ON public.materiais_anexos FOR ALL TO authenticated USING (public.is_admin());
    
    DROP POLICY IF EXISTS "Student_View_Materials" ON public.materiais_anexos;
    CREATE POLICY "Student_View_Materials" ON public.materiais_anexos FOR SELECT TO authenticated USING (true);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Erro:', error.message);
  } else {
    console.log('✅ Banco de dados normalizado com sucesso!');
  }
}

normalize();
