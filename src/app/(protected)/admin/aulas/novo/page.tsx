import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { createAula } from '../actions'
import { createClient } from '@/lib/supabase/server'
import { AnexosCriacao } from './AnexosCriacao'

export default async function NovaAulaPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const curso_return = params.curso_return as string | undefined;
  const default_modulo_id = params.modulo_id as string | undefined;

  const supabase = await createClient();
  const { data: modulos } = await supabase
    .from('modulos')
    .select('id, titulo, curso_id')
    .order('titulo');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link 
          href={curso_return ? `/admin/cursos/${curso_return}` : "/admin/aulas"}
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Cadastrar Nova Aula</h1>
        <p className="text-text-secondary text-sm mt-1">Insira os vídeos e conteúdos no acervo geral da plataforma.</p>
      </div>

      <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
        <form action={createAula} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="titulo" className="block text-sm font-bold text-text-primary">Título da Aula *</label>
              <input 
                type="text" 
                id="titulo" 
                name="titulo" 
                required
                placeholder="Ex: Como configurar o tráfego"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="slug" className="block text-sm font-bold text-text-primary">URL/Slug Opcional</label>
              <input 
                type="text" 
                id="slug" 
                name="slug" 
                placeholder="Ex: conf-trafego (vazio = auto)"
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
              placeholder="Descreva o que será ensinado aqui. Este texto aparece abaixo do vídeo no player."
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
            ></textarea>
          </div>

          <div className="space-y-2">
             <label htmlFor="video_url" className="block text-sm font-bold text-text-primary">Link do Vídeo</label>
             <input 
               type="url" 
               id="video_url" 
               name="video_url" 
               placeholder="Ex: https://vimeo.com/76979871"
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
                defaultValue="00:00:00"
                placeholder="00:00:00"
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="modulo_id" className="block text-sm font-bold text-text-primary">Vínculo Direto</label>
              <select 
                id="modulo_id" 
                name="modulo_id" 
                defaultValue={default_modulo_id || "null"}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
              >
                <option value="null">✅ Acervo Global (Recomendado)</option>
                {modulos?.map(mod => (
                  <option key={mod.id} value={mod.id}>
                    {mod.curso_id ? '🔒 [Exclusivo] ' : '📚 [Global] '}{mod.titulo}
                  </option>
                ))}
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
                    defaultValue="video"
                    className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-all text-sm appearance-none font-bold text-primary"
                  >
                    <option value="video">Vídeo Destaque</option>
                    <option value="texto">Apenas Leitura / Texto</option>
                    <option value="questionario">Simulado / Prova Interativa</option>
                    <option value="ferramenta">Recurso / Simulador HTML (Embed)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="liberacao_dias" className="block text-sm font-bold text-text-primary">Liberação (Dias após Matrícula)</label>
                  <input 
                    type="number" 
                    id="liberacao_dias" 
                    name="liberacao_dias" 
                    defaultValue={0}
                    min={0}
                    className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-all font-bold text-primary"
                  />
                  <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest">0 = IMEDIATA</p>
                </div>
             </div>
          </div>

          <AnexosCriacao />

          {curso_return && (
             <input type="hidden" name="curso_return" value={curso_return} />
          )}

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
              Inserir Aula no Acervo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
