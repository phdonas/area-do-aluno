const { createClient } = require('@supabase/supabase-js');

const PROD_URL = 'https://xeudppoqlfucwjqanbhm.supabase.co';
const PROD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWRwcG9xbGZ1Y3dqcWFuYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA0MTU3OSwiZXhwIjoyMDkwNjE3NTc5fQ.2Fq8_TpmekiQOGisBzJ166-jpL9OeYfr2bfRrp2LaXc';

const supabase = createClient(PROD_URL, PROD_KEY);

async function fixProd() {
  console.log('--- CONECTADO EM PRODUCAO ---');
  
  try {
    console.log('Removendo is_admin do pdonassolo1...');
    const { data: user1, error: e1 } = await supabase
      .from('usuarios')
      .update({ is_admin: false, is_staff: false })
      .eq('email', 'pdonassolo1@gmail.com')
      .select();
      
    if (e1) console.error('Erro ao atualizar pdonassolo1:', e1.message);
    else console.log('pdonassolo1 atualizado:', user1);

    const emails = ['admin@phdonassolo.com', 'ph@phdonassolo.com'];
    const newPass = 'PhdAdmin2026@!';
    
    for (const email of emails) {
      const { data: authUser, error: authErr } = await supabase.auth.admin.listUsers();
      if (authErr) {
          console.error('Erro ao listar auth users', authErr.message);
          continue;
      }
      
      const target = authUser.users.find(u => u.email === email);
      if (target) {
          console.log('Resetando senha para:', email);
          const { error: resetErr } = await supabase.auth.admin.updateUserById(target.id, { password: newPass });
          if (resetErr) console.error('Erro ao resetar', email, resetErr.message);
          else console.log('Senha alterada com sucesso para:', email);
      } else {
          console.log('Admin nao encontrado no Auth:', email);
      }
    }
  } catch (err) {
    console.error('ERRO FATAL:', err);
  } finally {
    process.exit(0);
  }
}

fixProd();
