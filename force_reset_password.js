const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Erro: As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não estão definidas.");
  process.exit(1);
}

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
