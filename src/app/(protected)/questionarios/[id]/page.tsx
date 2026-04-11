import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { QuestionarioPlayer } from './QuestionarioPlayer'

export default async function QuestionarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: q, error } = await supabase
    .from('questionarios')
    .select('*, questoes(*, alternativas:questoes_alternativas(*))')
    .eq('id', id)
    .single()

  if (error || !q) {
    notFound()
  }

  // Ordenar questões e alternativas
  const questoesOrdenadas = (q.questoes || []).sort((a: any, b: any) => a.ordem - b.ordem).map((q: any) => ({
    ...q,
    alternativas: (q.alternativas || []).sort((a: any, b: any) => a.ordem - b.ordem)
  }))

  return (
    <div className="min-h-screen bg-background text-text-primary">
       <QuestionarioPlayer questionario={q} questoes={questoesOrdenadas} />
    </div>
  )
}
