import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Layers, Plus, Pencil, Zap, Target, Brain, Leaf, Users, Award, Sparkles } from 'lucide-react'
import { deletePilar } from './actions'
import { DeleteButton } from './delete-button'

const IconMap: Record<string, any> = {
  Brain, Target, Leaf, Users, Zap, Award, Sparkles
}

export default async function PilaresListPage() {
  const supabase = createAdminClient()

  const { data: pilares, error } = await supabase
    .from('pilares')
    .select('*, cursos_pilares(count)')
    .order('ordem', { ascending: true })
        
  if (error) {
    console.error("Erro ao buscar pilares:", error)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 italic uppercase">
            <Layers className="w-8 h-8 text-primary" />
            Gestão de Pilares
          </h1>
          <p className="text-text-secondary text-sm font-medium">Estrutura estratégica e marketing da vitrine.</p>
        </div>
        <Link 
          href="/admin/pilares/novo" 
          className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" /> Novo Pilar
        </Link>
      </div>

      <div className="bg-surface border border-border-custom rounded-[2.5rem] overflow-hidden shadow-xl">
        {(!pilares || pilares.length === 0) ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <Layers className="w-10 h-10 text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Nenhum pilar cadastrado</h3>
            <p className="text-text-secondary text-sm max-w-xs mx-auto">Comece criando os temas principais da sua Academia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border-custom text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  <th className="p-6 font-black">Ordem</th>
                  <th className="p-6 font-black">Identidade</th>
                  <th className="p-6 font-black">Slug / Filtro</th>
                  <th className="p-6 font-black">Associações</th>
                  <th className="p-6 font-black text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {pilares.map(pilar => {
                  const Icon = IconMap[pilar.icone] || Zap
                  const qtdCursos = pilar.cursos_pilares?.[0]?.count || 0
                  
                  return (
                    <tr key={pilar.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-6">
                        <span className="w-8 h-8 flex items-center justify-center bg-background rounded-lg border border-border-custom text-xs font-black text-text-muted">
                          {pilar.ordem}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-background border border-border-custom text-primary group-hover:bg-primary group-hover:text-white transition-all">
                              <Icon className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="font-black text-text-primary uppercase italic">{pilar.nome}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: pilar.cor_badge || '#2563EB' }} />
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{pilar.cor_badge || '#2563EB'}</span>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <code className="px-3 py-1 bg-background border border-border-custom rounded-lg text-[10px] font-mono text-primary">
                          {pilar.slug || '-'}
                        </code>
                      </td>
                      <td className="p-6">
                        <span className="text-xs font-bold text-text-secondary">
                          {qtdCursos} treinamentos
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={`/admin/pilares/${pilar.id}`}
                            className="p-3 text-text-secondary hover:text-primary bg-background border border-border-custom hover:border-primary/20 rounded-xl transition-all shadow-sm"
                            title="Editar Pilar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeleteButton id={pilar.id} action={deletePilar.bind(null, pilar.id)} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
