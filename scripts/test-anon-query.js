import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeudppoqlfucwjqanbhm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDE1NzksImV4cCI6MjA5MDYxNzU3OX0.RxHmxPlWmq9cp4D1TINlQ9rMBMbvGoVorXtSEeJEBrw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const token = 'b7548493-16f4-41f1-8417-f53edacfa836'
  console.log('Testing anon query for token:', token)
  
  const { data, error } = await supabase
      .from('convites_matricula')
      .select('*')
      .eq('token', token)
      .eq('usado', false)
      .single()

  if (error) {
    console.error('SUPABASE ERROR:', error)
  } else {
    console.log('SUCCESS DATA:', data)
  }
}

test()
