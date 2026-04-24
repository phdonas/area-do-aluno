import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeudppoqlfucwjqanbhm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getPolicies() {
  const { data, error } = await supabase.rpc('get_policies_for_usuarios')
  if (error) {
    // try direct query
    const { data: d2, error: e2 } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'usuarios')
    console.log('policies:', d2, e2)
  }
}
getPolicies()
