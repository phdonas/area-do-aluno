const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeudppoqlfucwjqanbhm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forceReset(email, newPassword) {
  console.log(`Forçando a troca de senha para: ${email}...`);
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.error("Erro: Utilizador não encontrado!");
    return;
  }

  const { error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (error) {
    console.error("Erro ao forçar troca:", error.message);
  } else {
    console.log("✅ SUCESSO! Senha alterada com sucesso.");
    console.log(`Agora pode fazer login com: ${newPassword}`);
  }
}

forceReset('pdonassolo1@gmail.com', 'Paulo123!@#');
