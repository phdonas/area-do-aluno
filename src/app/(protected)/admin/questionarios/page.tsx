import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileQuestion, Plus, Pencil, Trash2 } from 'lucide-react'
import { deleteQuestionario } from './actions'
import { DeleteButton } from '../aulas/delete-button'

export default async function QuestionariosListPage() {
  const supabase = await createClient()

  const { data: questionarios, error } = await supabase
    .from('questionarios')
    .select('*, questoes(count)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erro ao buscar questionarios:", error)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-rose-500" />
            Acervo de Simulados e Avaliações
          </h1>
          <p className="text-text-secondary text-sm mt-1">Crie avaliações contendo questões que poderão ser vinculadas de forma intercambiável dentro dos módulos.</p>
        </div>
        <Link 
          href="/admin/questionarios/novo" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nova Avaliação
        </Link>
      </div>

      <div className="bg-surface border border-border-custom rounded-2xl overflow-hidden shadow-sm">
        {(!questionarios || questionarios.length === 0) ? (
          <div className="p-8 text-center text-text-secondary">
            Nenhum questionário cadastrado ainda.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border-custom text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold">Questionário</th>
                <th className="p-4 font-bold">Regras</th>
                <th className="p-4 font-bold">Volume</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {questionarios.map(q => {
                const qtdQuestoes = q.questoes?.[0]?.count || 0;
                return (
                  <tr key={q.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <Link href={`/admin/questionarios/${q.id}`} className="hover:underline decoration-primary">
                        <p className="font-bold text-text-primary">{q.titulo}</p>
                      </Link>
                      <p className="text-xs text-text-secondary truncate max-w-[250px]">{q.descricao}</p>
                    </td>
                    <td className="p-4">
                       <div className="flex flex-col gap-1">
                          <span className="text-xs text-text-muted bg-background border border-border-custom px-2 py-0.5 rounded w-fit">Corte: {q.nota_corte}%</span>
                          <span className="text-[10px] text-text-muted">Tentativas: {q.tentativas_permitidas === 0 ? 'Ilimitadas' : q.tentativas_permitidas}</span>
                       </div>
                    </td>
                    <td className="p-4">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100/10 text-rose-500 border border-rose-500/20 w-fit">{qtdQuestoes} Questões</span>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/questionarios/${q.id}`}
                        className="p-2 text-text-secondary hover:text-primary bg-background border border-border-custom hover:border-primary/30 rounded-lg transition-colors"
                        title="Editar Questionário"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteButton id={q.id} action={deleteQuestionario.bind(null, q.id)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
