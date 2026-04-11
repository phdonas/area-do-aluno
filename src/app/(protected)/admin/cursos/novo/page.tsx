import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { createCurso } from '../actions'

export default function NovoCursoPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/cursos" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Cursos
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Iniciar Novo Curso Principal</h1>
        <p className="text-text-secondary text-sm mt-1">Primeiro criamos os metadados do curso. No próximo passo você montará a grade curricular (Pilares e Módulos).</p>
      </div>

      <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
        <form action={createCurso} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="titulo" className="block text-sm font-bold text-text-primary">Título Público do Curso *</label>
              <input 
                type="text" 
                id="titulo" 
                name="titulo" 
                required
                placeholder="Ex: Formação em Vendas Avançadas"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="slug" className="block text-sm font-bold text-text-primary">URL/Slug Opcional</label>
              <input 
                type="text" 
                id="slug" 
                name="slug" 
                placeholder="vazio = gerado auto do título"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="descricao" className="block text-sm font-bold text-text-primary">Comentário/Descrição</label>
            <textarea 
              id="descricao" 
              name="descricao" 
              rows={4}
              placeholder="O que o aluno aprende nesta jornada?"
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label htmlFor="thumb_url" className="block text-sm font-bold text-text-primary">Thumbnail URL (Capa)</label>
               <input 
                 type="url" 
                 id="thumb_url" 
                 name="thumb_url" 
                 placeholder="Ex: https://image.com/capa.jpg"
                 className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
               />
             </div>

             <div className="space-y-2">
               <label htmlFor="status" className="block text-sm font-bold text-text-primary">Visibilidade Inicial</label>
               <select 
                 id="status" 
                 name="status" 
                 className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
               >
                 <option value="rascunho">⚠️ Rascunho (Oculto aos alunos)</option>
                 <option value="publicado">✅ Publicado (Qualquer um com plano pode ver)</option>
               </select>
             </div>
          </div>

          <div className="pt-6 border-t border-border-custom flex justify-end gap-3 mt-8">
            <Link 
              href="/admin/cursos"
              className="px-6 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-black/5 font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              Avançar para Montagem <Save className="w-5 h-5 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
