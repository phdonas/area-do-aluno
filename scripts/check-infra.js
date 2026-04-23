
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

const envDev = getEnv('.env.local');
const devSupabase = createClient(envDev.NEXT_PUBLIC_SUPABASE_URL, envDev.SUPABASE_SERVICE_ROLE_KEY);

const tablesToCheck = [
  'assinaturas', 'aulas', 'badges_aluno', 'configuracoes', 'convites', 'cupons', 
  'cursos', 'cursos_pilares', 'faq', 'ferramentas_saas', 'logs_matriculas', 
  'materiais_anexos', 'metas_aluno', 'metadados_marketing', 'modulos', 
  'modulos_aulas', 'pagamentos', 'pilares', 'planos', 'prefixos_limpeza', 
  'professores', 'progresso_aulas', 'questionarios', 'recursos', 'usuarios'
];

async function runAudit() {
  console.log('--- AUDIT DE TABELAS (DEV) ---');
  const missing = [];
  const existing = [];

  for (const table of tablesToCheck) {
    const { error } = await devSupabase.from(table).select('count', { count: 'exact', head: true }).limit(1);
    if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
      missing.push(table);
    } else {
      existing.push(table);
    }
  }

  console.log('✅ Existentes:', existing.join(', '));
  console.log('❌ Faltantes:', missing.join(', '));

  console.log('\n--- STATUS DO SEU USUÁRIO ---');
  const { data: user, error: userError } = await devSupabase
    .from('usuarios')
    .select('id, email, is_admin, is_staff, role, status')
    .eq('email', 'admin@phdonassolo.com')
    .single();

  if (userError) {
    console.log('Erro ao buscar usuário:', userError.message);
  } else {
    console.log('Dados encontrados:', JSON.stringify(user, null, 2));
  }
}

runAudit();
