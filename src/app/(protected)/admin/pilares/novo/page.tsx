import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { createPilar } from '../actions'

export default function NovoPilarPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/pilares" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Pilares
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Cadastrar Novo Pilar</h1>
        <p className="text-text-secondary text-sm mt-1">Defina as categorias que agruparão seus cursos e trilhas.</p>
      </div>

      <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
        <form action={createPilar} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-bold text-text-primary">Nome do Pilar *</label>
            <input 
              type="text" 
              id="nome" 
              name="nome" 
              required
              placeholder="Ex: Formação Executiva"
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="cor_badge" className="block text-sm font-bold text-text-primary">Cor de Destaque</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  id="cor_badge" 
                  name="cor_badge" 
                  defaultValue="#2563EB"
                  className="w-14 h-14 bg-background border border-border-custom rounded-xl p-1 cursor-pointer"
                />
                <p className="text-xs text-text-muted">Clique no quadrado para abrir a paleta e escolher a cor principal do pilar.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="ordem" className="block text-sm font-bold text-text-primary">Ordem de Exibição</label>
              <input 
                type="number" 
                id="ordem" 
                name="ordem" 
                defaultValue="0"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
              />
              <p className="text-xs text-text-muted">0 é o primeiro, 1 o segundo...</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border-custom flex justify-end gap-3">
            <Link 
              href="/admin/pilares"
              className="px-6 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-black/5 font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              Criar Pilar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
