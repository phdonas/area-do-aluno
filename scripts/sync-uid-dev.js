
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

async function syncUserUID() {
  console.log('🔄 Sincronizando UID de Autenticação com Tabela Usuarios (DEV)...');
  
  const targets = [
    { email: 'pdonassolo1@gmail.com' },
    { email: 'admin@phdonassolo.com' }
  ];

  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Erro ao listar usuários do Auth:', authError.message);
    return;
  }

  for (const target of targets) {
    const currentUser = users.find(u => u.email === target.email);

    if (currentUser) {
      const newUID = currentUser.id;
      const sql = `
        DELETE FROM public.usuarios WHERE email = '${target.email}' AND id != '${newUID}';
        INSERT INTO public.usuarios (id, email, role, is_admin)
        VALUES ('${newUID}', '${target.email}', 'admin', true)
        ON CONFLICT (id) DO UPDATE SET role = 'admin', is_admin = true;
      `;
      await supabase.rpc('exec_sql', { sql_query: sql });
      console.log(`✅ Sincronizado: ${target.email} -> ${newUID}`);
    }
  }
}

syncUserUID();
