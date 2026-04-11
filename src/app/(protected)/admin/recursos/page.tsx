import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Wrench, Plus, Pencil, Link as LinkIcon, FileSpreadsheet, LayoutTemplate } from 'lucide-react'
import { deleteRecurso } from './actions'
import { DeleteButton } from '../aulas/delete-button'
import Image from 'next/image'

export default async function RecursosListPage() {
  const supabase = await createClient()

  const { data: recursos, error } = await supabase
    .from('recursos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erro ao buscar recursos:", error)
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'simulador': return <LayoutTemplate className="w-4 h-4 text-purple-500" />
      case 'planilha': return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
      default: return <LinkIcon className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Wrench className="w-6 h-6 text-purple-500" />
            Recursos e Ferramentas
          </h1>
          <p className="text-text-secondary text-sm mt-1">Materiais avulsos, planilhas e simuladores HTML que enriquecem as aulas.</p>
        </div>
        <Link 
          href="/admin/recursos/novo" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Recurso
        </Link>
      </div>

      <div className="bg-surface border border-border-custom rounded-2xl overflow-hidden shadow-sm">
        {(!recursos || recursos.length === 0) ? (
          <div className="p-8 text-center text-text-secondary">
            Nenhum recurso cadastrado ainda.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border-custom text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold w-16">Capa</th>
                <th className="p-4 font-bold">Recurso</th>
                <th className="p-4 font-bold">Abertura / Tipo</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {recursos.map(recurso => (
                <tr key={recurso.id} className="hover:bg-black/5 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-background border border-border-custom rounded-lg overflow-hidden flex flex-shrink-0 items-center justify-center">
                      {recurso.thumb_url ? (
                        <Image src={recurso.thumb_url} alt="Capa" width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <Wrench className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/recursos/${recurso.id}`} className="hover:underline decoration-primary">
                      <p className="font-bold text-text-primary">{recurso.titulo}</p>
                    </Link>
                    <a href={recurso.arquivo_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate max-w-[200px] block mt-1">
                      {recurso.arquivo_url}
                    </a>
                  </td>
                  <td className="p-4">
                     <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-1 text-xs text-text-primary capitalize font-medium">
                          {getTypeIcon(recurso.tipo)} {recurso.tipo}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Abre em: {recurso.abertura_tipo}</span>
                     </div>
                  </td>
                  <td className="p-4">
                     <span className={`text-xs px-2 py-0.5 rounded-full border font-bold inline-flex ${
                        recurso.status === 'ativo' ? 'bg-green-100/10 text-green-500 border-green-500/20' : 'bg-gray-100/10 text-gray-500 border-gray-500/20'
                     }`}>
                        {recurso.status === 'ativo' ? 'Ativo' : 'Inativo'}
                     </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/recursos/${recurso.id}`}
                      className="p-2 text-text-secondary hover:text-primary bg-background border border-border-custom hover:border-primary/30 rounded-lg transition-colors"
                      title="Editar Recurso"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={recurso.id} action={deleteRecurso.bind(null, recurso.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
