import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Save } from 'lucide-react'
import { updateAula } from '../actions'
import { AnexosGerenciador } from './AnexosGerenciador'
import { formatDuration } from '@/lib/formatter'

export default async function EditarAulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: aula } = await supabase
    .from('aulas')
    .select('*')
    .eq('id', id)
    .single()

  if (!aula) {
    notFound()
  }

  const { data: questionarios } = await supabase
    .from('questionarios')
    .select('id, titulo')
    .order('titulo')

  const { data: recursos } = await supabase
    .from('recursos')
    .select('id, titulo')
    .order('titulo')

  // Bind the id to the server action
  const updateAulaWithId = updateAula.bind(null, aula.id)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/aulas" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Aulas
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Editar Aula</h1>
        <p className="text-text-secondary text-sm mt-1">Alterando informações e vídeo da aula atual.</p>
      </div>

      <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
        <form action={updateAulaWithId} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="titulo" className="block text-sm font-bold text-text-primary">Título da Aula *</label>
              <input 
                type="text" 
                id="titulo" 
                name="titulo" 
                required
                defaultValue={aula.titulo}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="slug" className="block text-sm font-bold text-text-primary">URL/Slug Opcional</label>
              <input 
                type="text" 
                id="slug" 
                name="slug" 
                defaultValue={aula.slug || ''}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="descricao" className="block text-sm font-bold text-text-primary">Resumo / Textos da Aula</label>
            <textarea 
              id="descricao" 
              name="descricao" 
              rows={4}
              defaultValue={aula.descricao || ''}
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
            ></textarea>
          </div>

          <div className="space-y-2">
             <label htmlFor="video_url" className="block text-sm font-bold text-text-primary">Link do Vídeo</label>
             <input 
               type="url" 
               id="video_url" 
               name="video_url" 
               defaultValue={aula.video_url || ''}
               className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="duracao" className="block text-sm font-bold text-text-primary">Duração (hh:mm:ss)</label>
              <input 
                type="text" 
                id="duracao" 
                name="duracao" 
                defaultValue={formatDuration(aula.duracao_segundos)}
                placeholder="00:00:00"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="modulo_id" className="block text-sm font-bold text-text-primary">Vínculo Direto</label>
              <select 
                id="modulo_id" 
                name="modulo_id" 
                defaultValue={aula.modulo_id === null ? "null" : aula.modulo_id}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
              >
                <option value="null">✅ Acervo Global (Recomendado)</option>
                {aula.modulo_id && (
                  <option value={aula.modulo_id}>🛑 Vinculada Fixa a um Módulo Específico</option>
                )}
              </select>
            </div>
          </div>

          <div className="p-4 border border-border-custom rounded-xl bg-background/50 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label htmlFor="tipo_conteudo" className="block text-sm font-bold text-text-primary">Formato Funcional</label>
                  <select 
                    id="tipo_conteudo" 
                    name="tipo_conteudo" 
                    defaultValue={aula.tipo_conteudo || "video"}
                    className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-all text-sm appearance-none font-bold text-primary"
                  >
                    <option value="video">Vídeo Destaque</option>
                    <option value="texto">Apenas Leitura / Texto</option>
                    <option value="questionario">Simulado / Prova Interativa</option>
                    <option value="ferramenta">Recurso / Ferramenta (Embed)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="liberacao_dias" className="block text-sm font-bold text-text-primary">Liberação (Dias após Matrícula)</label>
                  <input 
                    type="number" 
                    id="liberacao_dias" 
                    name="liberacao_dias" 
                    defaultValue={aula.liberacao_dias || 0}
                    min={0}
                    className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-all font-bold text-primary"
                  />
                  <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest">0 = IMEDIATA</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="questionario_id" className="block text-sm font-bold text-text-primary">Vincular Questionário</label>
                  <select 
                    id="questionario_id" 
                    name="questionario_id" 
                    defaultValue={aula.questionario_id || "null"}
                    className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-all text-sm appearance-none"
                  >
                    <option value="null">-- Nenhum (Não é prova) --</option>
                    {questionarios?.map((q: any) => (
                      <option key={q.id} value={q.id}>📝 {q.titulo}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="recurso_id" className="block text-sm font-bold text-text-primary">Vincular Recurso/Ferramenta</label>
                  <select 
                    id="recurso_id" 
                    name="recurso_id" 
                    defaultValue={aula.recurso_id || "null"}
                    className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-all text-sm appearance-none"
                  >
                    <option value="null">-- Nenhum (Não é ferramenta) --</option>
                    {recursos?.map((r: any) => (
                      <option key={r.id} value={r.id}>🔧 {r.titulo}</option>
                    ))}
                  </select>
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-border-custom flex justify-end gap-3 mt-8">
            <Link 
              href="/admin/aulas"
              className="px-6 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-black/5 font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      <AnexosGerenciador aulaId={aula.id} />
    </div>
  )
}
