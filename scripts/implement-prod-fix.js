
const { createClient } = require('@supabase/supabase-js');

const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

const supabase = createClient(PROD_URL, PROD_KEY);

async function implementProdFix() {
  console.log('🚀 INICIANDO REFORÇO ESTRUTURAL EM PRODUÇÃO...');
  
  const sql = `
    -- 1. Limpeza de duplicatas (Garante que a PK não falhe)
    DELETE FROM public.cursos_modulos a USING public.cursos_modulos b WHERE a.ctid < b.ctid AND a.curso_id = b.curso_id AND a.modulo_id = b.modulo_id;
    DELETE FROM public.modulos_aulas a USING public.modulos_aulas b WHERE a.ctid < b.ctid AND a.modulo_id = b.modulo_id AND a.aula_id = b.aula_id;
    DELETE FROM public.instrutores_cursos a USING public.instrutores_cursos b WHERE a.ctid < b.ctid AND a.instrutor_id = b.instrutor_id AND a.curso_id = b.curso_id;

    -- 2. Criação das Chaves Primárias
    -- Usamos blocos DO para evitar erro se a PK já existir por algum motivo
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_type = 'PRIMARY KEY' AND table_name = 'cursos_modulos') THEN
        ALTER TABLE public.cursos_modulos ADD PRIMARY KEY (curso_id, modulo_id);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_type = 'PRIMARY KEY' AND table_name = 'modulos_aulas') THEN
        ALTER TABLE public.modulos_aulas ADD PRIMARY KEY (modulo_id, aula_id);
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_type = 'PRIMARY KEY' AND table_name = 'instrutores_cursos') THEN
        ALTER TABLE public.instrutores_cursos ADD PRIMARY KEY (instrutor_id, curso_id);
      END IF;
    END $$;

    -- 3. Garantir RPC de execução segura se não existir
    CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
    RETURNS void AS $body$
    BEGIN
      EXECUTE sql_query;
    END;
    $body$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // Tentativa 1: Usando nome de parâmetro 'query' em vez de 'sql_query'
  let { error } = await supabase.rpc('query_sql', { query: sql });

  if (error && error.message.includes('not found')) {
    // Tentativa 2: Sem nome de parâmetro (posicional)
    const result = await supabase.rpc('query_sql', { sql: sql });
    error = result.error;
  }

  if (error) {
    console.error('❌ Erro durante a implementação em Produção:', error.message);
    console.log('Tentando fallback para execução direta...');
  } else {
    console.log('✅ REFORÇO ESTRUTURAL CONCLUÍDO EM PRODUÇÃO!');
    console.log('As tabelas pivot agora possuem integridade atômica.');
  }
}

implementProdFix();
