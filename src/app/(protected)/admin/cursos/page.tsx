import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { deleteCurso } from './actions'
import { DeleteButton } from './delete-button'
import { formatDuration } from '@/lib/formatter'
import { BookOpen, Plus, Pencil, Blocks, Layers, Clock } from 'lucide-react'

export default async function CursosListPage() {
  const supabase = createAdminClient()

  // Buscamos cursos e contamos quantos pilares e modulos eles possuem nas tabelas pivot
  const { data: cursos, error } = await supabase
    .from('cursos')
    .select(`
       *, 
       cursos_pilares(pilar_id), 
       cursos_modulos(
         modulo_id,
         modulos(
           id,
           modulos_aulas(
             aulas(duracao_segundos)
           ),
           aulas:aulas!aulas_modulo_id_fkey(duracao_segundos)
         )
       )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erro ao buscar cursos:", error)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            Estruturas de Cursos
          </h1>
          <p className="text-text-secondary text-sm mt-1">Crie as vitrines (Cursos) e associe Pilares e Módulos para formar a grade curricular.</p>
        </div>
        <Link 
          href="/admin/cursos/novo" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Cadastrar Curso
        </Link>
      </div>

      <div className="bg-surface border border-border-custom rounded-2xl overflow-hidden shadow-sm">
        {(!cursos || cursos.length === 0) ? (
          <div className="p-8 text-center text-text-secondary">
            Nenhum curso montado ainda.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border-custom text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold">Curso</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Grade Curricular</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {cursos.map(curso => {
                const qtdPilares = (curso.cursos_pilares || []).length;
                const qtdModulos = (curso.cursos_modulos || []).length;

                return (
                  <tr key={curso.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {curso.thumb_url ? (
                          <img src={curso.thumb_url} className="w-12 h-12 rounded object-cover border border-border-custom" alt="Thumb" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-background border border-border-custom flex items-center justify-center text-text-muted">
                            <BookOpen className="w-5 h-5 opacity-50" />
                          </div>
                        )}
                        <div>
                           <Link href={`/admin/cursos/${curso.id}`} className="hover:underline decoration-primary">
                             <p className="font-bold text-text-primary text-sm">{curso.titulo}</p>
                           </Link>
                           <p className="text-xs text-text-secondary text-mono">/{curso.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {curso.status === 'publicado' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100/10 text-green-500 border border-green-500/20 w-fit">Publicado</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100/10 text-orange-500 border border-orange-500/20 w-fit">Rascunho</span>
                      )}
                    </td>
                    <td className="p-4">
                       <div className="flex gap-2">
                          <span className="text-[10px] text-text-secondary flex items-center gap-1 bg-background border border-border-custom px-2 py-1 rounded">
                             <Layers className="w-3 h-3"/> {qtdPilares} Pilares
                          </span>
                           <span className="text-[10px] text-text-secondary flex items-center gap-1 bg-background border border-border-custom px-2 py-1 rounded">
                              <Blocks className="w-3 h-3"/> {qtdModulos} Módulos
                           </span>
                           {(() => {
                              let totalCursoSegundos = 0;
                              (curso.cursos_modulos || []).forEach((cm: any) => {
                                 const m = cm.modulos;
                                 if (m) {
                                    const duracaoAulasVinculadas = (m.modulos_aulas || []).reduce((acc: number, ma: any) => acc + (ma.aulas?.duracao_segundos || 0), 0);
                                    const duracaoAulasDiretas = (m.aulas || []).reduce((acc: number, a: any) => acc + (a.duracao_segundos || 0), 0);
                                    totalCursoSegundos += (duracaoAulasVinculadas + duracaoAulasDiretas);
                                 }
                              });
                              return (
                                <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 bg-indigo-500/5 border border-indigo-500/10 px-2 py-1 rounded">
                                   <Clock className="w-3 h-3" /> {formatDuration(totalCursoSegundos)}
                                </span>
                              )
                           })()}
                        </div>
                     </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/cursos/${curso.id}`}
                        className="p-2 text-text-secondary hover:text-primary bg-background border border-border-custom hover:border-primary/30 rounded-lg transition-colors"
                        title="Vitrines e Pivot"
                        target="_blank"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteButton id={curso.id} action={deleteCurso.bind(null, curso.id)} />
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
