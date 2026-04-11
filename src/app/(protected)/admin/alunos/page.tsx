import { createAdminClient } from '@/lib/supabase/admin'
import { Users } from 'lucide-react'
import { AlunosSearchableList } from './AlunosSearchableList'

export default async function AlunosListPage() {
  const supabase = createAdminClient()

  // Buscar alunos (ativos e manuais da secretaria)
  const { data: todosAlunos, error } = await supabase
    .from('usuarios')
    .select('*, assinaturas(count)')
    .order('created_at', { ascending: false })

  if (error) console.error("Erro ao buscar alunos:", error)

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between mb-10 mt-6 overflow-hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
               <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-black text-text-primary tracking-tighter">
              Alunos e Matrículas
            </h1>
          </div>
          <p className="text-text-secondary text-sm font-medium">Gestão centralizada de usuários e liberações manuais de acesso.</p>
        </div>
      </div>

        <AlunosSearchableList initialAlunos={todosAlunos || []} />
    </div>
  )
}
