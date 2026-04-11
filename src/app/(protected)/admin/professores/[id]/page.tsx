import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProfessorForm } from '../ProfessorForm'

export default async function EditarProfessorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = createAdminClient()
  const { data: professor } = await supabase
    .from('professores')
    .select('*')
    .eq('id', id)
    .single()

  if (!professor) notFound()

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="mb-4">
        <Link 
          href="/admin/professores" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Professores
        </Link>
        <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">Editar Perfil do Gestor</h1>
        <p className="text-text-secondary text-sm">Configure as informações que aparecerão para você e para seus alunos.</p>
      </div>

      <div className="bg-surface border border-border-custom p-8 md:p-12 rounded-[3rem] shadow-sm">
         <ProfessorForm professor={professor} />
      </div>
    </div>
  )
}
