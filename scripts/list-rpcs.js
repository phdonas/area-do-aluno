
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

async function listRpcs() {
  const url = `${envProd.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${envProd.SUPABASE_SERVICE_ROLE_KEY}`;
  const response = await fetch(url);
  const spec = await response.json();
  const rpcs = Object.keys(spec.paths).filter(p => p.startsWith('/rpc/')).map(p => p.replace('/rpc/', ''));
  console.log('RPCs encontrados na Produção:\n', rpcs.join('\n'));
}

listRpcs();
