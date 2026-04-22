import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Save } from 'lucide-react'
import { updatePilar } from '../actions'

export default async function EditarPilarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pilar } = await supabase
    .from('pilares')
    .select('*')
    .eq('id', id)
    .single()

  if (!pilar) {
    notFound()
  }

  // Bind the id to the server action
  const updatePilarWithId = updatePilar.bind(null, pilar.id)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link 
          href="/admin/pilares" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Pilares
        </Link>
        <h1 className="text-3xl font-black text-text-primary italic">Editar Pilar</h1>
        <p className="text-text-secondary text-sm mt-1">Configurações estratégicas para: <span className="font-bold text-primary">{pilar.nome}</span></p>
      </div>

      <div className="bg-surface border border-border-custom p-8 md:p-10 rounded-[2.5rem] shadow-xl">
        <form action={updatePilarWithId} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="nome" className="block text-xs font-black uppercase tracking-widest text-text-primary">Nome do Pilar *</label>
              <input 
                type="text" 
                id="nome" 
                name="nome" 
                required
                defaultValue={pilar.nome}
                className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="block text-xs font-black uppercase tracking-widest text-text-primary">Slug (URL/Filtro) *</label>
              <input 
                type="text" 
                id="slug" 
                name="slug" 
                required
                defaultValue={pilar.slug}
                className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-mono text-xs"
                placeholder="ex: ecoinovacao-estrategia"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subtitulo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Subtítulo / Descrição Curta (Vitrine)</label>
            <textarea 
              id="subtitulo" 
              name="subtitulo" 
              defaultValue={pilar.subtitulo}
              rows={3}
              className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-medium resize-none"
              placeholder="Descreva brevemente o objetivo deste pilar na vitrine de vendas..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 text-center md:text-left">
              <label htmlFor="icone" className="block text-xs font-black uppercase tracking-widest text-text-primary">Ícone (Lucide)</label>
              <select 
                id="icone" 
                name="icone" 
                defaultValue={pilar.icone || 'Zap'}
                className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-bold"
              >
                <option value="Zap">Zap (Energia)</option>
                <option value="Target">Target (Alvo)</option>
                <option value="Brain">Brain (Mente)</option>
                <option value="Leaf">Leaf (Eco/Sustentável)</option>
                <option value="Users">Users (Liderança)</option>
                <option value="Award">Award (Conquista)</option>
              </select>
            </div>

            <div className="space-y-2">
               <label htmlFor="cor_badge" className="block text-xs font-black uppercase tracking-widest text-text-primary">Cor de Destaque</label>
               <input 
                  type="color" 
                  id="cor_badge" 
                  name="cor_badge" 
                  defaultValue={pilar.cor_badge || '#2563EB'}
                  className="w-full h-14 bg-background border border-border-custom rounded-2xl p-2 cursor-pointer"
               />
            </div>

            <div className="space-y-2">
              <label htmlFor="ordem" className="block text-xs font-black uppercase tracking-widest text-text-primary">Ordem</label>
              <input 
                type="number" 
                id="ordem" 
                name="ordem" 
                defaultValue={pilar.ordem || 0}
                className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-mono"
              />
            </div>
          </div>

          <div className="pt-10 border-t border-border-custom flex flex-col sm:flex-row justify-end gap-4">
            <Link 
              href="/admin/pilares"
              className="px-8 py-4 rounded-2xl border border-border-custom text-text-secondary hover:bg-black/5 font-bold transition-all text-xs uppercase tracking-widest text-center"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="px-10 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
            >
              <Save className="w-5 h-5 font-black" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
