import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('configuracoes_sistema')
    .select('valor')
    .eq('chave', 'lms_liberado')
    .single()

  const liberado = data?.valor === 'true'

  if (!liberado) {
    redirect('/em-breve')
  }

  redirect('/login')
}
