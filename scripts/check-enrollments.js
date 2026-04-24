import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeudppoqlfucwjqanbhm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkEnrollments() {
  const email = 'paulo@phdonassolo.com'
  
  // Find the user ID
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) return console.error('List error:', listError)
  
  const user = users.users.find(u => u.email === email)
  if (!user) return console.log('User not found')

  console.log(`Checking assinaturas for user ${email} (ID: ${user.id})`)

  const { data: assinaturas, error } = await supabase
    .from('assinaturas')
    .select('curso_id, plano_id, status, cursos(id, titulo), planos(id, is_global)')
    .eq('usuario_id', user.id)

  if (error) {
    console.error('Fetch Error:', error)
  } else {
    console.log('Assinaturas:', JSON.stringify(assinaturas, null, 2))
  }
}

checkEnrollments()
