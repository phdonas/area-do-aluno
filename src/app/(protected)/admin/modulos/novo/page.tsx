import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { createModulo } from '../actions'

export default function NovoModuloPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/modulos" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Módulos
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Cadastrar Novo Módulo</h1>
        <p className="text-text-secondary text-sm mt-1">Crie a gaveta que guardará suas aulas na biblioteca. Pode ser atrelada a múltiplos cursos.</p>
      </div>

      <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
        <form action={createModulo} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="titulo" className="block text-sm font-bold text-text-primary">Título do Módulo *</label>
            <input 
              type="text" 
              id="titulo" 
              name="titulo" 
              required
              placeholder="Ex: Introdução ao Marketing"
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="descricao" className="block text-sm font-bold text-text-primary">Descrição Resumida</label>
            <textarea 
              id="descricao" 
              name="descricao" 
              rows={3}
              placeholder="O que o aluno vai aprender neste bloco de aulas?"
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="ordem" className="block text-sm font-bold text-text-primary">Ordem Padrão</label>
              <input 
                type="number" 
                id="ordem" 
                name="ordem" 
                defaultValue="0"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
              />
              <p className="text-xs text-text-muted">Ordem física. A ordem de exibição final será guiada pela tabela Pivot do curso.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="curso_id" className="block text-sm font-bold text-text-primary">Vínculo Direto (Legado)</label>
              <select 
                id="curso_id" 
                name="curso_id" 
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
              >
                <option value="null">✅ Global / Biblioteca (Recomendado)</option>
                {/* Aqui poderíamos puxar os cursos do banco para legado, mas manteremos Global por enquanto */}
              </select>
              <p className="text-xs text-text-muted">Deixe Global para adicionar aulas em massa e agrupar aos cursos depois.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border-custom flex justify-end gap-3">
            <Link 
              href="/admin/modulos"
              className="px-6 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-black/5 font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              Criar Módulo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
