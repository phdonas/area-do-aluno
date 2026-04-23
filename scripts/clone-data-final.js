
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

const envProd = getEnv('.env.production.backup');
const envDev = getEnv('.env.local');

const prodSupabase = createClient(envProd.NEXT_PUBLIC_SUPABASE_URL, envProd.SUPABASE_SERVICE_ROLE_KEY);
const devSupabase = createClient(envDev.NEXT_PUBLIC_SUPABASE_URL, envDev.SUPABASE_SERVICE_ROLE_KEY);

// Ordem correta para evitar erros de FK
const tables = [
    'usuarios', 
    'pilares', 
    'professores', 
    'cursos', 
    'modulos', 
    'recursos', 
    'questionarios', 
    'aulas', // Agora vem depois de recursos e questionarios
    'questoes', 
    'questoes_alternativas',
    'planos', 
    'planos_cursos', 
    'assinaturas', 
    'modulos_aulas', 
    'cursos_modulos',
    'materiais_anexos', 
    'configuracoes_checkout', 
    'trilhas_estaticas',
    'badges_aluno', 
    'metas_aluno'
];

async function cloneData() {
    console.log('📡 Iniciando clonagem de dados corrigida...');

    for (const table of tables) {
        process.stdout.write(`📥 Clonando ${table}... `);
        try {
            const { data, error } = await prodSupabase.from(table).select('*');
            if (error) throw error;

            if (data && data.length > 0) {
                // Tenta inserir os dados. Usamos upsert para evitar duplicados se rodar de novo.
                const { error: insError } = await devSupabase.from(table).upsert(data);
                if (insError) throw insError;
                console.log(`✅ ${data.length} registros.`);
            } else {
                console.log('⚪ Vazia.');
            }
        } catch (e) {
            console.log(`❌ Erro: ${e.message}`);
        }
    }

    console.log('🏁 Clonagem concluída com sucesso!');
}

cloneData();
