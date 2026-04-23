
const fs = require('fs');
const path = require('path');

async function extractViaOpenAPI() {
    console.log('🚀 Extraindo Schema via OpenAPI Spec (Produção)...');
    
    // Ler .env da produção
    const content = fs.readFileSync('.env.production.backup', 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) env[key.trim()] = value.join('=').trim();
    });

    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${env.SUPABASE_SERVICE_ROLE_KEY}`;
    
    try {
        const response = await fetch(url);
        const spec = await response.json();
        
        let sql = `-- SCHEMA_PROD_REAL.sql (via OpenAPI)\n-- Gerado em: ${new Date().toISOString()}\n\n`;
        
        const tables = spec.definitions;
        if (!tables) {
            console.error('❌ Falha ao obter definições do OpenAPI. JSON recebido:', spec);
            return;
        }

        for (const [tableName, definition] of Object.entries(tables)) {
            console.log(`📦 Mapeando tabela: ${tableName}...`);
            sql += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
            
            const columns = [];
            for (const [colName, colInfo] of Object.entries(definition.properties)) {
                let type = colInfo.type === 'string' ? 'TEXT' : colInfo.type === 'integer' ? 'INTEGER' : 'TEXT';
                // Mapeamento básico de tipos PostgREST -> SQL
                if (colInfo.format) {
                    if (colInfo.format.includes('uuid')) type = 'UUID';
                    if (colInfo.format.includes('timestamp')) type = 'TIMESTAMPTZ';
                    if (colInfo.format.includes('boolean')) type = 'BOOLEAN';
                    if (colInfo.format.includes('json')) type = 'JSONB';
                }
                
                let colDef = `  ${colName} ${type}`;
                if (definition.required && definition.required.includes(colName)) {
                    colDef += ' NOT NULL';
                }
                if (colName === 'id' && type === 'UUID') {
                    colDef += ' PRIMARY KEY DEFAULT gen_random_uuid()';
                }
                columns.push(colDef);
            }
            
            sql += columns.join(',\n');
            sql += `\n);\n\n`;
        }

        fs.writeFileSync('SCHEMA_PROD_REAL.sql', sql);
        console.log('✅ Arquivo SCHEMA_PROD_REAL.sql gerado com sucesso via OpenAPI!');

    } catch (err) {
        console.error('❌ Erro na extração OpenAPI:', err.message);
    }
}

extractViaOpenAPI();
