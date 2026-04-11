import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus, User, Link as LinkIcon, Trash2, Edit } from 'lucide-react'
import { deleteProfessor } from './actions'

export default async function ProfessoresAdminPage() {
  const supabase = createAdminClient()
  const { data: professores } = await supabase
    .from('professores')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">Gestores de Conhecimento</h1>
          <p className="text-text-secondary text-sm">Cadastre os professores e as suas redes sociais para a página de vendas.</p>
        </div>
        <Link 
          href="/admin/professores/novo" 
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-xs transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Novo Professor
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(professores || []).map((prof) => (
          <div key={prof.id} className="bg-surface border border-border-custom p-6 rounded-[2rem] shadow-sm flex items-start gap-4 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden">
               {prof.avatar_url ? (
                 <img src={prof.avatar_url} alt={prof.nome} className="w-full h-full object-cover" />
               ) : (
                 <User className="w-8 h-8 text-primary opacity-40" />
               )}
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-black text-text-primary uppercase tracking-tight italic">{prof.nome}</h3>
              <p className="text-xs text-text-muted line-clamp-2">{prof.biografia || 'Sem biografia cadastrada.'}</p>
              
              <div className="flex items-center gap-2 pt-2">
                 <LinkIcon className="w-3 h-3 text-emerald-500" />
                 <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    {Array.isArray(prof.links) ? prof.links.length : 0} Links Externos
                 </span>
              </div>

              <div className="flex items-center gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Link 
                   href={`/admin/professores/${prof.id}`}
                   className="p-2 rounded-lg bg-black/5 hover:bg-black/10 text-text-primary transition-colors"
                 >
                    <Edit className="w-4 h-4" />
                 </Link>
                 <form action={deleteProfessor.bind(null, prof.id)}>
                    <button className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-colors">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </form>
              </div>
            </div>
          </div>
        ))}

        {(!professores || professores.length === 0) && (
          <div className="col-span-full py-12 text-center bg-surface border border-dashed border-border-custom rounded-[2rem]">
             <p className="text-text-muted text-sm font-medium">Nenhum professor cadastrado. Comece agora!</p>
          </div>
        )}
      </div>
    </div>
  )
}
