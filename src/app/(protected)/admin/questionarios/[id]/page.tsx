import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Save, FileQuestion, HelpCircle } from 'lucide-react'
import { updateQuestionario } from '../actions'
import { QuestaoBuilder } from './QuestaoBuilder'

export default async function EditarQuestionarioPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Bind parameters
  const updateQuestAction = updateQuestionario.bind(null, id)

  // Odenar as questoes e alternativas para o frontend
  const questoesOrdenadas = (q.questoes || []).sort((a: any, b: any) => a.ordem - b.ordem).map((questao: any) => {
    return {
      ...questao,
      alternativas: (questao.alternativas || []).sort((a: any, b: any) => a.ordem - b.ordem)
    }
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/questionarios" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Questionários
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Construtor de Avaliação</h1>
        <p className="text-text-secondary text-sm mt-1">Configure o questionário e as perguntas na sequência abaixo.</p>
      </div>

      <div className="space-y-8">
        {/* Metadados */}
        <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-xl font-bold text-text-primary">
             <FileQuestion className="w-5 h-5 text-rose-500" /> Detalhes Prática/Prova
          </div>
          
          <form action={updateQuestAction} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="titulo" className="block text-sm font-bold text-text-primary">Título (Uso Interno) *</label>
              <input 
                type="text" 
                id="titulo" 
                name="titulo" 
                required
                defaultValue={q.titulo}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="descricao" className="block text-sm font-bold text-text-primary">Descritivo (Para o Aluno antes do Start)</label>
              <textarea 
                id="descricao" 
                name="descricao" 
                rows={3}
                defaultValue={q.descricao || ''}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="nota_corte" className="block text-sm font-bold text-text-primary">Nota de Corte (%) *</label>
                <input 
                  type="number" 
                  id="nota_corte" 
                  name="nota_corte" 
                  required
                  defaultValue={q.nota_corte}
                  min={0}
                  max={100}
                  className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tentativas_permitidas" className="block text-sm font-bold text-text-primary">Tentativas Re-teste</label>
                <input 
                  type="number" 
                  id="tentativas_permitidas" 
                  name="tentativas_permitidas" 
                  defaultValue={q.tentativas_permitidas}
                  min={0}
                  className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                />
                <p className="text-[10px] text-text-muted mt-1">Coloque 0 para indicar ilimitado.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border-custom flex justify-end gap-3">
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save className="w-5 h-5" />
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>

        {/* Builder de Questões */}
        <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-xl font-bold text-text-primary">
             <HelpCircle className="w-5 h-5 text-indigo-500" /> Caderno de Questões
          </div>
          
          <p className="text-sm text-text-secondary mb-6">
            Adicione questões, formule os enunciados e assinale as corretas. Isso definirá o gabarito. As questões são auto-salvas (blur).
          </p>

          <QuestaoBuilder questionarioId={q.id} questoesIniciais={questoesOrdenadas} />
        </div>
      </div>
    </div>
  )
}
