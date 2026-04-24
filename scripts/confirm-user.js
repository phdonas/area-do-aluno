import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeudppoqlfucwjqanbhm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function autoConfirm() {
  const email = 'paulo@phdonassolo.com'
  
  // Update the user via Admin API to auto-confirm their email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) return console.error('List error:', listError)
  
  const user = users.users.find(u => u.email === email)
  if (!user) return console.log('User not found')

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true
  })

  if (error) {
    console.error('Confirmation Error:', error)
  } else {
    console.log('Successfully confirmed email for:', email)
  }
}

autoConfirm()
