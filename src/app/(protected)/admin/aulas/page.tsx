import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { MonitorPlay, Pencil, Link as LinkIcon, Clock, Table } from 'lucide-react'
import { deleteAula } from './actions'
import { DeleteButton } from './delete-button'
import { formatDuration } from '@/lib/formatter'

import { AulasFilters } from './aulas-filters'

import { NovaAulaButton } from './nova-aula-button'

export default async function AulasListPage({
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
    .from('aulas')
    .select('*, modulos_aulas(count)')
    .limit(100);

  if (tituloQuery) {
    query = query.ilike('titulo', `%${tituloQuery}%`);
  }

  if (statusQuery === 'solto') {
    query = query.is('modulo_id', null);
  } else if (statusQuery === 'vinculado') {
    query = query.not('modulo_id', 'is', null);
  }

  if (sortByQuery) {
    const [column, direction] = sortByQuery.split('-');
    if (column === 'titulo' || column === 'created_at') {
      query = query.order(column, { ascending: direction === 'asc' });
    } else if (column === 'status') {
      // Supabase sorting by nullable modulo_id gives us an easy proxy.
      query = query.order('modulo_id', { ascending: direction === 'asc', nullsFirst: direction === 'asc' });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: aulas, error } = await query;

  if (error) {
    console.error("Erro ao buscar aulas:", error)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-indigo-500" />
            Acervo de Aulas
          </h1>
          <p className="text-text-secondary text-sm mt-1">Crie e edite as aulas. Podem existir sozinhas no acervo ou vinculadas aos módulos de cursos.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/aulas/lote" 
            className="bg-background border border-border-custom hover:border-indigo-500 text-text-primary hover:text-indigo-500 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Table className="w-4 h-4" /> Inclusão em Lote
          </Link>
          <NovaAulaButton />
        </div>
      </div>

      <AulasFilters />

      <div className="bg-surface border border-border-custom rounded-2xl overflow-hidden shadow-sm">
        {(!aulas || aulas.length === 0) ? (
          <div className="p-8 text-center text-text-secondary">
            Nenhuma aula cadastrada no acervo ainda.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border-custom text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold">Aula (Título e Duraçao)</th>
                <th className="p-4 font-bold">Status/Propriedade</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {aulas.map(aula => {
                const isGlobal = aula.modulo_id === null;
                const conexoes = aula.modulos_aulas?.[0]?.count || 0;

                return (
                  <tr key={aula.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <Link href={`/admin/aulas/${aula.id}`} className="hover:underline decoration-primary">
                        <p className="font-bold text-text-primary">{aula.titulo}</p>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted flex items-center gap-1 bg-background border border-border-custom px-2 py-0.5 rounded">
                           <Clock className="w-3 h-3" /> {formatDuration(aula.duracao_segundos)}
                        </span>
                        {aula.video_url && (
                          <span className="text-[10px] bg-green-500/10 text-green-600 px-1 py-0.5 rounded font-bold border border-green-500/20">Vídeo OK</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {isGlobal ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100/10 text-blue-500 border border-blue-500/20 w-fit">Acervo Solto</span>
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <LinkIcon className="w-3 h-3"/> Alocada em {conexoes} módulo(s)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100/10 text-orange-500 border border-orange-500/20 w-fit">Vinculada Estaticamente</span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                       <Link 
                        href={`/player/preview/${aula.id}`}
                        className="p-2 text-primary bg-primary/5 hover:bg-primary/20 border border-primary/20 hover:border-primary/50 rounded-lg transition-colors text-xs font-bold"
                        target="_blank"
                        title="Ver Player"
                       >
                         Preview
                       </Link>
                      <Link 
                        href={`/admin/aulas/${aula.id}`}
                        className="p-2 text-text-secondary hover:text-primary bg-background border border-border-custom hover:border-primary/30 rounded-lg transition-colors"
                        title="Editar Aula"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteButton id={aula.id} action={deleteAula.bind(null, aula.id)} />
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
