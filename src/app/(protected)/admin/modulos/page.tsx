import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { FolderKanban, Plus, Pencil, Link as LinkIcon } from 'lucide-react'
import { deleteModulo } from './actions'
import { DeleteButton } from './delete-button'
import { formatDuration } from '@/lib/formatter'
import { Clock } from 'lucide-react'

import { ModulosFilters } from './modulos-filters'

export default async function ModulosListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = createAdminClient()

  const defaultParams = await searchParams;
  const tituloQuery = defaultParams.titulo as string | undefined;
  const statusQuery = defaultParams.status as string | undefined;
  const sortByQuery = defaultParams.sortBy as string | undefined;

  let query = supabase
    .from('modulos')
    .select(`
      *, 
      cursos_modulos(curso_id), 
      modulos_aulas(
        aulas(*)
      ), 
      aulas:aulas!aulas_modulo_id_fkey(*)
    `);

  if (tituloQuery) {
    query = query.ilike('titulo', `%${tituloQuery}%`);
  }

  if (statusQuery === 'global') {
    query = query.is('curso_id', null);
  } else if (statusQuery === 'isolado') {
    query = query.not('curso_id', 'is', null);
  }

  if (sortByQuery) {
    const [column, direction] = sortByQuery.split('-');
    if (column === 'titulo' || column === 'created_at') {
      query = query.order(column, { ascending: direction === 'asc' });
    } else if (column === 'status') {
      // Supabase sorting by nullable curso_id proxy.
      query = query.order('curso_id', { ascending: direction === 'asc', nullsFirst: direction === 'asc' });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: modulos, error } = await query;

  if (error) {
    console.error("Erro ao buscar módulos:", error.message, error.details, error.hint)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-500" />
            Gestão de Módulos
          </h1>
          <p className="text-text-secondary text-sm mt-1">Crie as sessões que organizarão as suas aulas. Módulos podem pertencer a 0 ou mais cursos.</p>
        </div>
        <Link 
          href="/admin/modulos/novo" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Módulo
        </Link>
      </div>

      <ModulosFilters />

      <div className="bg-surface border border-border-custom rounded-2xl overflow-hidden shadow-sm">
        {(!modulos || modulos.length === 0) ? (
          <div className="p-8 text-center text-text-secondary">
            Nenhum módulo cadastrado na biblioteca ainda.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border-custom text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold">Título do Módulo</th>
                <th className="p-4 font-bold">Status/Propriedade</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {modulos.map(modulo => {
                // Se curso_id for NULL o módulo é global (biblioteca pura)
                const isGlobal = modulo.curso_id === null;
                const conexoes = modulo.cursos_modulos?.length || 0;

                return (
                  <tr key={modulo.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <Link href={`/admin/modulos/${modulo.id}`} className="hover:underline decoration-primary">
                        <p className="font-bold text-text-primary">{modulo.titulo}</p>
                      </Link>
                      <p className="text-xs text-text-secondary truncate max-w-[250px]">{modulo.descricao}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {(() => {
                           const getDurSeg = (aula: any) => {
                               return (aula?.duracao_segundos || (aula?.duracao_minutos ? aula.duracao_minutos * 60 : 0));
                           };
                           const duracaoAulasVinculadasSeg = (modulo.modulos_aulas || []).reduce((acc: number, ma: any) => acc + getDurSeg(ma.aulas), 0);
                           const duracaoAulasDiretasSeg = (modulo.aulas || []).reduce((acc: number, a: any) => acc + getDurSeg(a), 0);
                           const totalSegundos = duracaoAulasVinculadasSeg + duracaoAulasDiretasSeg;
                           return (
                             <span className="text-[10px] text-text-muted flex items-center gap-1 bg-background border border-border-custom px-2 py-0.5 rounded font-mono">
                                <Clock className="w-3 h-3" /> {formatDuration(totalSegundos)}
                             </span>
                           )
                        })()}
                      </div>
                    </td>
                    <td className="p-4">
                      {isGlobal ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100/10 text-blue-500 border border-blue-500/20 w-fit">Global (Biblioteca)</span>
                          <span className="text-[10px] text-text-muted flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Conectado em {conexoes} curso(s)</span>
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100/10 text-orange-500 border border-orange-500/20 w-fit">Isolado/Legado</span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/modulos/${modulo.id}`}
                        className="p-2 text-text-secondary hover:text-primary bg-background border border-border-custom hover:border-primary/30 rounded-lg transition-colors"
                        title="Editar Módulo"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteButton id={modulo.id} action={deleteModulo.bind(null, modulo.id)} />
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
