import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Layers, Plus, Pencil } from 'lucide-react'
import { deletePilar } from './actions'
import { DeleteButton } from './delete-button'

export default async function PilaresListPage() {
  const supabase = createAdminClient()

  const { data: pilares, error } = await supabase
    .from('pilares')
    .select('*')
    .order('ordem', { ascending: true })
        
  if (error) {
    console.error("Erro ao buscar pilares:", error)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-500" />
            Gestão de Pilares
          </h1>
          <p className="text-text-secondary text-sm mt-1">Categorias macroestruturais onde os cursos ficam alocados.</p>
        </div>
        <Link 
          href="/admin/pilares/novo" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Pilar
        </Link>
      </div>

      <div className="bg-surface border border-border-custom rounded-2xl overflow-hidden shadow-sm">
        {(!pilares || pilares.length === 0) ? (
          <div className="p-8 text-center text-text-secondary">
            Nenhum pilar cadastrado ainda.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border-custom text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold">Ordem</th>
                <th className="p-4 font-bold">Nome</th>
                <th className="p-4 font-bold">Cor_Badge</th>
                <th className="p-4 font-bold">Cursos Conectados</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {pilares.map(pilar => (
                <tr key={pilar.id} className="hover:bg-black/5 transition-colors">
                  <td className="p-4 text-sm font-mono text-text-muted">{pilar.ordem}</td>
                  <td className="p-4 font-bold text-text-primary">{pilar.nome}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 rounded border border-border-custom font-mono" style={{ color: pilar.cor_badge || '#000' }}>
                      {pilar.cor_badge || 'Padrão'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {pilar.cursos?.[0]?.count || 0} cursos
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/pilares/${pilar.id}`}
                      className="p-2 text-text-secondary hover:text-primary bg-background border border-border-custom hover:border-primary/30 rounded-lg transition-colors"
                      title="Editar Pilar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={pilar.id} action={deletePilar.bind(null, pilar.id)} />
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
