import Link from 'next/link'
import { ChevronLeft, Save, Video } from 'lucide-react'
import { createAula } from '../actions'
import { createClient } from '@/lib/supabase/server'
import { AnexosCriacao } from './AnexosCriacao'
import { redirect } from 'next/navigation'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'

export default async function NovaAulaPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const curso_return = params.curso_return as string | undefined;
  const default_modulo_id = params.modulo_id as string | undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdminRole } = await supabase.rpc('is_admin')
  const { data: userData } = await supabase.from('usuarios').select('is_staff').eq('id', user.id).single()
  
  const isAdmin = !!isAdminRole
  const isStaff = !!userData?.is_staff
  const role = isAdmin ? 'admin' : (isStaff ? 'staff' : 'user')

  const { data: modulos } = await supabase
    .from('modulos')
    .select('id, titulo, curso_id')
    .order('titulo');

  const { data: questionarios } = await supabase
    .from('questionarios')
    .select('id, titulo')
    .order('titulo');

  const { data: recursos } = await supabase
    .from('recursos')
    .select('id, titulo')
    .order('titulo');

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <Link 
          href={curso_return ? `/admin/cursos/${curso_return}` : "/admin/aulas"}
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-black text-text-primary italic uppercase tracking-tighter">Cadastrar Nova Aula</h1>
        <p className="text-text-secondary text-sm mt-1 uppercase tracking-widest font-bold opacity-60">Insira vídeos e conteúdos no acervo geral da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário Principal */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border-custom p-8 rounded-[2rem] shadow-xl">
            <form action={createAula} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="titulo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Título da Aula *</label>
                  <input 
                    type="text" id="titulo" name="titulo" required
                    placeholder="Ex: Como configurar o tráfego"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-medium"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="slug" className="block text-xs font-black uppercase tracking-widest text-text-primary">URL/Slug (Opcional)</label>
                  <input 
                    type="text" id="slug" name="slug"
                    placeholder="Ex: conf-trafego (vazio = auto)"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-mono text-xs"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="descricao" className="block text-xs font-black uppercase tracking-widest text-text-primary">Resumo / Conteúdo de Texto</label>
                  <textarea 
                    id="descricao" name="descricao" rows={5}
                    placeholder="Este texto aparece abaixo do vídeo no player."
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                  ></textarea>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="video_url" className="block text-xs font-black uppercase tracking-widest text-text-primary">Link do Vídeo (Vimeo/HLS/YouTube)</label>
                  <input 
                    type="text" id="video_url" name="video_url"
                    placeholder="Ex: https://vimeo.com/76979871"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="duracao" className="block text-xs font-black uppercase tracking-widest text-text-primary">Duração Estimada</label>
                  <input 
                    type="text" id="duracao" name="duracao" defaultValue="00:00:00"
                    placeholder="00:00:00"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="modulo_id" className="block text-xs font-black uppercase tracking-widest text-text-primary">Vínculo Direto (Opcional)</label>
                  <select 
                    id="modulo_id" name="modulo_id" defaultValue={default_modulo_id || "null"}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-bold appearance-none"
                  >
                    <option value="null">✅ Acervo Global (Recomendado)</option>
                    {modulos?.map(mod => (
                      <option key={mod.id} value={mod.id}>
                        {mod.curso_id ? '🔒 [Exclusivo] ' : '📚 [Global] '}{mod.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 p-6 bg-background/50 border border-border-custom rounded-3xl space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="tipo_conteudo" className="block text-xs font-black uppercase tracking-widest text-primary">Formato Funcional</label>
                      <select 
                        id="tipo_conteudo" name="tipo_conteudo" defaultValue="video"
                        className="w-full bg-surface border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-black"
                      >
                        <option value="video">🎥 Vídeo Principal</option>
                        <option value="texto">📄 Apenas Texto/Leitura</option>
                        <option value="questionario">📝 Simulado/Prova</option>
                        <option value="ferramenta">🛠️ Ferramenta/Simulador</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="liberacao_dias" className="block text-xs font-black uppercase tracking-widest text-primary">Liberação (Dias após Matrícula)</label>
                      <input 
                        type="number" id="liberacao_dias" name="liberacao_dias" defaultValue={0} min={0}
                        className="w-full bg-surface border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="questionario_id" className="block text-xs font-black uppercase tracking-widest text-primary">Questionário Vinculado</label>
                      <select 
                        id="questionario_id" name="questionario_id" defaultValue="null"
                        className="w-full bg-surface border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-bold"
                      >
                        <option value="null">-- Nenhum --</option>
                        {questionarios?.map((q: any) => (
                          <option key={q.id} value={q.id}>📝 {q.titulo}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="recurso_id" className="block text-xs font-black uppercase tracking-widest text-primary">Ferramenta Integrada</label>
                      <select 
                        id="recurso_id" name="recurso_id" defaultValue="null"
                        className="w-full bg-surface border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-bold"
                      >
                        <option value="null">-- Nenhuma --</option>
                        {recursos?.map((r: any) => (
                          <option key={r.id} value={r.id}>🔧 {r.titulo}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Obrigatório para formato "Ferramenta".</p>
                    </div>
                  </div>
                </div>
              </div>

              <AnexosCriacao />

              {curso_return && (
                 <input type="hidden" name="curso_return" value={curso_return} />
              )}

              <div className="pt-10 border-t border-border-custom flex flex-col sm:flex-row justify-end gap-4 mt-8">
                <Link 
                  href="/admin/aulas"
                  className="px-8 py-5 rounded-2xl border border-border-custom text-text-secondary hover:bg-black/5 font-black uppercase tracking-widest text-xs text-center transition-all"
                >
                  Cancelar
                </Link>
                <button 
                  type="submit"
                  className="px-10 py-5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-sky-500/20"
                >
                  <Save className="w-5 h-5" />
                  Salvar Aula no Acervo
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tutorial Card */}
        <div className="space-y-6">
          <AdminTutorialCard 
            moduleTitle="Aulas"
            color="sky"
            role={role}
            steps={[
              {
                title: "Formatos Funcionais",
                description: "Escolha 'Vídeo' para aulas tradicionais ou 'Ferramenta' se quiser embutir um simulador interativo."
              },
              {
                title: "Liberação Gradual",
                description: "Use 'Liberação em Dias' para criar funis de aprendizado. O aluno só acessa X dias após a compra."
              },
              {
                title: "Acervo Global",
                description: "Aulas recomendadas como 'Global' podem ser reutilizadas em múltiplos cursos e módulos sem duplicar dados."
              }
            ]}
          />

          <div className="bg-surface border border-border-custom rounded-[2rem] p-8 flex items-center gap-6 hover:border-sky-500/30 transition-all cursor-default shadow-lg group">
             <div className="w-16 h-16 bg-sky-500/10 rounded-[1.25rem] flex items-center justify-center text-sky-600 shrink-0 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8" />
             </div>
             <div>
                <p className="text-xs font-black text-text-primary uppercase tracking-[0.1em] italic">Dica de Produção</p>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-bold leading-relaxed">Vídeos com mais de 20 min devem ser divididos em partes.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
