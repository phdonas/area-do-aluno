
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

const supabase = createClient(PROD_URL, PROD_KEY);

async function runProdAudit() {
  console.log('🚀 INICIANDO AUDITORIA DE PRODUÇÃO (phdonassolo.com) 🚀');
  const report = {
    tables: {},
    functions: {},
    policies: {},
    issues: []
  };

  async function safeQuery(query) {
    try {
      // Usando query_sql se existir, senão usando select direto na information_schema
      const { data, error } = await supabase.rpc('query_sql', { sql_query: query });
      if (error) {
        // Fallback para queries diretas via REST se possível (limitado)
        return { error: error.message };
      }
      return { data };
    } catch (e) {
      return { error: e.message };
    }
  }

  console.log('\n--- 1. Verificando Tabelas e Colunas ---');
  const checkCols = `
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name IN ('aulas', 'modulos', 'usuarios', 'progresso_aulas')
  `;
  const colsRes = await safeQuery(checkCols);
  
  if (colsRes.error) {
    console.error('❌ Não foi possível ler colunas (query_sql pode não existir em PROD):', colsRes.error);
    report.issues.push("A função 'query_sql' não existe em Produção. Precisamos criá-la para auditoria.");
  } else {
    const cols = colsRes.data;
    const tableMap = {};
    cols.forEach(c => {
      if (!tableMap[c.table_name]) tableMap[c.table_name] = [];
      tableMap[c.table_name].push(c.column_name);
    });

    // Auditoria de Aulas
    const aulasCols = tableMap['aulas'] || [];
    ['slug', 'video_url', 'duracao_segundos', 'tipo_conteudo'].forEach(col => {
      if (!aulasCols.includes(col)) report.issues.push(`AULAS: Falta coluna crítica '${col}'`);
    });

    // Auditoria de Módulos
    const modulosCols = tableMap['modulos'] || [];
    ['curso_id', 'ui_layout'].forEach(col => {
      if (!modulosCols.includes(col)) report.issues.push(`MÓDULOS: Falta coluna crítica '${col}'`);
    });

    // Auditoria de Usuários
    const usuariosCols = tableMap['usuarios'] || [];
    ['is_admin', 'is_staff'].forEach(col => {
      if (!usuariosCols.includes(col)) report.issues.push(`USUÁRIOS: Falta coluna de permissão '${col}'`);
    });

    report.tables = tableMap;
  }

  console.log('\n--- 2. Verificando Chaves Primárias ---');
  const pkQuery = `
    SELECT tc.table_name 
    FROM information_schema.table_constraints tc 
    JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
    WHERE constraint_type = 'PRIMARY KEY' AND tc.table_name = 'progresso_aulas'
  `;
  const pkRes = await safeQuery(pkQuery);
  if (pkRes.data && pkRes.data.length === 0) {
    report.issues.push("PROGRESSO_AULAS: Tabela sem Chave Primária (Upsert vai falhar)");
  }

  console.log('\n--- RESULTADO FINAL DA AUDITORIA ---');
  if (report.issues.length === 0) {
    console.log('✅ TUDO PRONTO! O banco de produção está saudável.');
  } else {
    console.log('⚠️ PROBLEMAS ENCONTRADOS:');
    report.issues.forEach(i => console.log(' - ' + i));
  }
}

runProdAudit();
