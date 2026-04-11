import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, Plus, Pencil, CheckCircle2, XCircle } from 'lucide-react'
import { deletePacote } from './actions'
import { DeleteButton } from '../aulas/delete-button'

export default async function PacotesListPage() {
  const supabase = await createClient()

  // Buscamos os planos/pacotes e também a contagem de cursos vinculados (via planos_cursos)
  const { data: pacotes, error } = await supabase
    .from('planos')
    .select('*, planos_cursos(count)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erro ao buscar pacotes:", error)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-500" />
            Pacotes e Combos
          </h1>
          <p className="text-text-secondary text-sm mt-1">Produtos monetizados: Agrupe cursos para criar ofertas ou assinaturas.</p>
        </div>
        <Link 
          href="/admin/pacotes/novo" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Pacote
        </Link>
      </div>

      <div className="bg-surface border border-border-custom rounded-2xl overflow-hidden shadow-sm">
        {(!pacotes || pacotes.length === 0) ? (
          <div className="p-8 text-center text-text-secondary">
            Nenhum pacote/combo cadastrado ainda.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border-custom text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold">Produto</th>
                <th className="p-4 font-bold">Acesso Liberado</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {pacotes.map(pacote => {
                const qtdCursos = pacote.planos_cursos?.[0]?.count || 0;
                return (
                  <tr key={pacote.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <Link href={`/admin/pacotes/${pacote.id}`} className="hover:underline decoration-primary">
                        <p className="font-bold text-text-primary">{pacote.nome}</p>
                      </Link>
                      <p className="text-xs text-text-secondary truncate max-w-[250px]">{pacote.descricao}</p>
                    </td>
                    <td className="p-4">
                      {pacote.is_global ? (
                         <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100/10 text-emerald-500 border border-emerald-500/20 font-bold inline-flex items-center gap-1">
                           PASSAPORTE GLOBAL
                         </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100/10 text-indigo-500 border border-indigo-500/20 font-bold inline-flex items-center gap-1">
                           Restrito ({qtdCursos} Cursos)
                         </span>
                      )}
                    </td>
                    <td className="p-4">
                      {pacote.ativo ? (
                        <span className="text-xs text-green-500 flex items-center gap-1 font-bold"><CheckCircle2 className="w-4 h-4"/> Ativo</span>
                      ) : (
                        <span className="text-xs text-text-muted flex items-center gap-1"><XCircle className="w-4 h-4"/> Inativo</span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/pacotes/${pacote.id}`}
                        className="p-2 text-text-secondary hover:text-primary bg-background border border-border-custom hover:border-primary/30 rounded-lg transition-colors"
                        title="Editar Pacote"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteButton id={pacote.id} action={deletePacote.bind(null, pacote.id)} />
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
