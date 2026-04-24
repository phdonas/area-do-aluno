import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeudppoqlfucwjqanbhm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixLoop() {
  const sql = `
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Se o usuário não estiver logado (ex: tela de cadastro), retorna false imediatamente
  -- Isso quebra o loop infinito de recursão no RLS.
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT is_admin INTO v_is_admin FROM public.usuarios WHERE id = auth.uid();
  RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  const { error } = await supabase.rpc('exec_sql', { query: sql })
  console.log('Update Function:', error || 'SUCCESS')
}

fixLoop()
