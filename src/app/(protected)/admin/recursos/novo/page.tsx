import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { createRecurso } from '../actions'

export default function NovoRecursoPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/recursos" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Recursos e Ferramentas
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Cadastrar Novo Recurso</h1>
        <p className="text-text-secondary text-sm mt-1">Materiais que podem ser vinculados como tipo de conteúdo em Aulas.</p>
      </div>

      <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
        <form action={createRecurso} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="titulo" className="block text-sm font-bold text-text-primary">Título do Recurso *</label>
              <input 
                type="text" 
                id="titulo" 
                name="titulo" 
                required
                placeholder="Ex: Planilha DRE ou Simulador de Juros"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="descricao" className="block text-sm font-bold text-text-primary">Descrição Curta</label>
              <textarea 
                id="descricao" 
                name="descricao" 
                rows={2}
                placeholder="Ex: Use esta planilha para avaliar a rentabilidade..."
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
              ></textarea>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="arquivo_url" className="block text-sm font-bold text-text-primary">URL / Endereço do Arquivo *</label>
              <input 
                type="url" 
                id="arquivo_url" 
                name="arquivo_url" 
                required
                placeholder="https://seu-site.com.br/simulador/index.html"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tipo" className="block text-sm font-bold text-text-primary">Tipo de Recurso</label>
              <select 
                id="tipo" 
                name="tipo" 
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="simulador">Simulador HTML</option>
                <option value="planilha">Planilha</option>
                <option value="pdf">PDF / Documento</option>
                <option value="link">Link Externo</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="abertura_tipo" className="block text-sm font-bold text-text-primary">Forma de Abertura (Aluno)</label>
              <select 
                id="abertura_tipo" 
                name="abertura_tipo" 
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="modal">Embed direto na Aula (Iframe)</option>
                <option value="nova_aba">Abrir em Nova Aba</option>
                <option value="download">Forçar Download</option>
              </select>
            </div>

            {/* Upload Imagem de Capa Simplificado */}
            <div className="space-y-2 md:col-span-2 pt-4 border-t border-border-custom">
               <label htmlFor="capa_image" className="block text-sm font-bold text-text-primary">Imagem de Capa (Opcional - caso queira vitrine)</label>
               <input 
                  type="file" 
                  id="capa_image" 
                  name="capa_image" 
                  accept="image/*"
                  className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer border border-border-custom bg-background rounded-xl p-2"
               />
               <p className="text-xs text-text-muted mt-1">Recomendado: 800x450px (Formato paisagem).</p>
            </div>

          </div>

          <div className="pt-6 border-t border-border-custom flex justify-end gap-3 mt-8 items-center justify-between">
            <div className="flex items-center gap-2">
               <input type="checkbox" id="status" name="status" defaultChecked className="w-4 h-4 text-primary bg-background border-border-custom rounded focus:ring-primary" />
               <label htmlFor="status" className="text-sm font-bold text-text-primary">Recurso Ativo</label>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/admin/recursos"
                className="px-6 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-black/5 font-medium transition-colors"
              >
                Cancelar
              </Link>
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save className="w-5 h-5" />
                Criar Recurso
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
