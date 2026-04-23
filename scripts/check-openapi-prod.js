
const PROD_URL = "https://xeudppoqlfucwjqanbhm.supabase.co/rest/v1/";
const PROD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc";

async function checkOpenAPI() {
  const response = await fetch(PROD_URL, {
    headers: { 'apikey': PROD_KEY }
  });
  const data = await response.json();
  
  const rpcs = Object.keys(data.paths).filter(p => p.startsWith('/rpc/'));
  console.log('RPCs disponíveis em PROD:', rpcs);
  
  rpcs.forEach(rpc => {
    const post = data.paths[rpc].post;
    if (post && post.parameters) {
      console.log(`Parâmetros para ${rpc}:`, post.parameters[0].schema.properties);
    }
  });
}

checkOpenAPI();
