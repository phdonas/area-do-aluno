import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProfessorForm } from '../ProfessorForm'

export default function NovoProfessorPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="mb-4">
        <Link 
          href="/admin/professores" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Professores
        </Link>
        <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">Novo Gestor de Conhecimento</h1>
        <p className="text-text-secondary text-sm">Configure as informações que aparecerão para você e para seus alunos.</p>
      </div>

      <div className="bg-surface border border-border-custom p-8 md:p-12 rounded-[3rem] shadow-sm">
         <ProfessorForm professor={{ nome: '', links: [] }} />
      </div>
    </div>
  )
}
