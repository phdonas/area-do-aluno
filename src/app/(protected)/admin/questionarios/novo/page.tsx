import Link from 'next/link'
import { ChevronLeft, Save, FileQuestion } from 'lucide-react'
import { createQuestionario } from '../actions'

export default function NovoQuestionarioPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/questionarios" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Questionários
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Novo Questionário</h1>
        <p className="text-text-secondary text-sm mt-1">Crie avaliações contendo questões (múltipla escolha, V/F) para usar nas aulas.</p>
      </div>

      <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-xl font-bold text-text-primary">
          <FileQuestion className="w-5 h-5 text-rose-500" /> Detalhes da Avaliação
        </div>
        
        <form action={createQuestionario} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="titulo" className="block text-sm font-bold text-text-primary">Título *</label>
            <input 
              type="text" 
              id="titulo" 
              name="titulo" 
              required
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="descricao" className="block text-sm font-bold text-text-primary">Instruções / Descrição</label>
            <textarea 
              id="descricao" 
              name="descricao" 
              rows={3}
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
                defaultValue={70}
                min={0}
                max={100}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tentativas_permitidas" className="block text-sm font-bold text-text-primary">Tentativas Permitidas</label>
              <input 
                type="number" 
                id="tentativas_permitidas" 
                name="tentativas_permitidas" 
                required
                defaultValue={0}
                min={0}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
              />
              <p className="text-[10px] text-text-muted mt-1">Coloque 0 para indicar tentativas ilimitadas.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border-custom flex justify-end gap-3">
            <Link 
              href="/admin/questionarios"
              className="px-6 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-black/5 font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              Criar e Avançar para Questões
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
