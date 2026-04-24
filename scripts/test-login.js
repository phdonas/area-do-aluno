import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeudppoqlfucwjqanbhm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDE1NzksImV4cCI6MjA5MDYxNzU3OX0.RxHmxPlWmq9cp4D1TINlQ9rMBMbvGoVorXtSEeJEBrw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  const email = 'paulo@phdonassolo.com'
  const password = 'Teste2026@'
  
  console.log(`Testing login for ${email}...`)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('LOGIN ERROR:', error.message, error.name, error.status)
  } else {
    console.log('LOGIN SUCCESS! User ID:', data.user.id)
    
    // Test if we can read the public.usuarios table
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single()
      
    if (userError) {
      console.error('USER FETCH ERROR:', userError)
    } else {
      console.log('USER DATA:', userData)
    }
  }
}

testLogin()
