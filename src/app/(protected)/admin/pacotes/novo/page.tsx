import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { createPacote } from '../actions'

export default async function NovoPacotePage() {
  const supabase = await createClient()

  // Buscar todos os cursos para exibição no multiselect
  const { data: cursos } = await supabase
    .from('cursos')
    .select('id, titulo')
    .order('titulo')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/pacotes" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Pacotes
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Cadastrar Novo Produto / Pacote</h1>
        <p className="text-text-secondary text-sm mt-1">Crie um combo que dará acesso a um ou mais cursos cadastrados.</p>
      </div>

      <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
        <form action={createPacote} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="nome" className="block text-sm font-bold text-text-primary">Nome Comercial do Produto *</label>
              <input 
                type="text" 
                id="nome" 
                name="nome" 
                required
                placeholder="Ex: Formação Gestor Completo"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="descricao" className="block text-sm font-bold text-text-primary">Descrição Curta</label>
              <textarea 
                id="descricao" 
                name="descricao" 
                rows={2}
                placeholder="Ex: Acesso vitalício aos cursos de marketing e operações..."
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
              ></textarea>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="preco_mensal" className="block text-sm font-bold text-text-primary">Preço Mensalidade (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                id="preco_mensal" 
                name="preco_mensal" 
                placeholder="Opcional. Ex: 97.90"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="preco_anual" className="block text-sm font-bold text-text-primary">Preço Anuidade (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                id="preco_anual" 
                name="preco_anual" 
                placeholder="Opcional. Ex: 997.00"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="p-4 bg-background border border-border-custom rounded-xl flex items-center justify-between gap-4 mt-6">
             <div>
                <h4 className="font-bold text-text-primary">Passaporte Global?</h4>
                <p className="text-xs text-text-secondary mt-1">Se ativado, quem comprar este pacote ganha acesso a TODOS os cursos do site atual e futuro.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="is_global" className="sr-only peer" />
                <div className="w-11 h-6 bg-border-custom peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
             </label>
          </div>

          <div className="space-y-3 mt-6">
             <label className="block text-sm font-bold text-text-primary">Quais cursos fazem parte deste pacote?</label>
             <p className="text-xs text-text-muted mb-2">Selecione os cursos abaixo. Esta aba é ignorada se for "Passaporte Global". As teclas CTRL ou SHIFT ajudam a selecionar vários cliques.</p>
             <select 
               name="cursos" 
               multiple 
               className="w-full bg-background border border-border-custom rounded-xl p-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm h-48"
             >
                {cursos?.map(c => (
                   <option key={c.id} value={c.id} className="p-2 border-b border-border-custom/50 last:border-0 hover:bg-black/5">
                     📚 {c.titulo}
                   </option>
                ))}
             </select>
          </div>

          <div className="pt-6 border-t border-border-custom flex justify-end gap-3 mt-8 items-center justify-between">
            <div className="flex items-center gap-2">
               <input type="checkbox" id="ativo" name="ativo" defaultChecked className="w-4 h-4 text-primary bg-background border-border-custom rounded focus:ring-primary" />
               <label htmlFor="ativo" className="text-sm font-bold text-text-primary">Produto Ativo na Vitrine</label>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/admin/pacotes"
                className="px-6 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-black/5 font-medium transition-colors"
              >
                Cancelar
              </Link>
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save className="w-5 h-5" />
                Criar Produto
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
