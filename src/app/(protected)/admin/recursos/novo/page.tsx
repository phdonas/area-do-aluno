import Link from 'next/link'
import { ChevronLeft, Save, Zap, Video } from 'lucide-react'
import { createRecurso } from '../actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'

export default async function NovoRecursoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdminRole } = await supabase.rpc('is_admin')
  const { data: userData } = await supabase.from('usuarios').select('is_staff').eq('id', user.id).single()
  
  const isAdmin = !!isAdminRole
  const isStaff = !!userData?.is_staff
  const role = isAdmin ? 'admin' : (isStaff ? 'staff' : 'user')

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <Link 
          href="/admin/recursos" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Recursos e Ferramentas
        </Link>
        <h1 className="text-3xl font-black text-text-primary italic uppercase tracking-tighter">Cadastrar Novo Recurso</h1>
        <p className="text-text-secondary text-sm mt-1 uppercase tracking-widest font-bold opacity-60">Materiais estratégicos para o ecossistema do aluno.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário Principal */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border-custom p-8 rounded-[2rem] shadow-xl">
            <form action={createRecurso} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="titulo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Título do Recurso *</label>
                  <input 
                    type="text" id="titulo" name="titulo" required
                    placeholder="Ex: Planilha DRE ou Simulador de Juros"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-medium"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="descricao" className="block text-xs font-black uppercase tracking-widest text-text-primary">Descrição Curta</label>
                  <textarea 
                    id="descricao" name="descricao" rows={3}
                    placeholder="Ex: Use esta planilha para avaliar a rentabilidade..."
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                  ></textarea>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="arquivo_url" className="block text-xs font-black uppercase tracking-widest text-text-primary">URL / Endereço do Arquivo *</label>
                  <input 
                    type="text" id="arquivo_url" name="arquivo_url" required
                    placeholder="/ferramentas/avaliacao-lideranca/index.html"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="tipo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Tipo de Recurso</label>
                  <select 
                    id="tipo" name="tipo"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-bold appearance-none"
                  >
                    <option value="simulador">Simulador HTML</option>
                    <option value="planilha">Planilha</option>
                    <option value="pdf">PDF / Documento</option>
                    <option value="link">Link Externo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="abertura_tipo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Forma de Abertura</label>
                  <select 
                    id="abertura_tipo" name="abertura_tipo"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-bold appearance-none"
                  >
                    <option value="modal">Visualização (Modal/Iframe)</option>
                    <option value="nova_aba">Abrir em Nova Aba</option>
                    <option value="download">Forçar Download</option>
                  </select>
                </div>

                <div className="space-y-4 md:col-span-2 pt-10 border-t border-border-custom px-4 bg-primary/5 rounded-2xl py-6">
                   <div className="flex items-center gap-2 mb-4">
                     <div className="w-1.5 h-6 bg-primary rounded-full animate-pulse" />
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary italic flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Detalhes Premium (Fluxo de Curso)
                     </h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                       <label htmlFor="objetivo" className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Objetivo Estratégico</label>
                       <textarea 
                         id="objetivo" name="objetivo" rows={4}
                         className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
                         placeholder="Qual o propósito fundamental desta ferramenta?"
                       ></textarea>
                     </div>
                     <div className="space-y-2">
                       <label htmlFor="quando_usar" className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Quando Aplicar (Timing)</label>
                       <textarea 
                         id="quando_usar" name="quando_usar" rows={4}
                         className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
                         placeholder="Em que momento do processo o aluno deve usar?"
                       ></textarea>
                     </div>
                     <div className="space-y-2">
                       <label htmlFor="como_usar" className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Instruções de Execução</label>
                       <textarea 
                         id="como_usar" name="como_usar" rows={4}
                         className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
                         placeholder="Passo a passo rápido de como preencher/utilizar."
                       ></textarea>
                     </div>
                     <div className="space-y-2">
                       <label htmlFor="resultados_esperados" className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Resultados Esperados</label>
                       <textarea 
                         id="resultados_esperados" name="resultados_esperados" rows={4}
                         className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
                         placeholder="O que o aluno deve ter em mãos ao finalizar?"
                       ></textarea>
                     </div>
                   </div>
                </div>

               <div className="space-y-4 md:col-span-2 pt-10 border-t border-border-custom px-4 bg-amber-500/5 rounded-2xl py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                       <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary italic">Visibilidade Pública</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="destaque_vitrine" className="sr-only peer" />
                      <div className="w-11 h-6 bg-border-custom peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      <span className="ms-3 text-xs font-black uppercase tracking-widest text-text-primary italic">Destaque na Vitrine</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-text-muted font-bold uppercase mt-2">Ative para exibir este material na seção "Materiais Gratuitos" da área do aluno.</p>
               </div>

                <div className="space-y-4 md:col-span-2 pt-10 border-t border-border-custom">
                   <label htmlFor="capa_image" className="block text-xs font-black uppercase tracking-widest text-text-primary">Imagem de Capa (Thumbnail)</label>
                   <input 
                      type="file" id="capa_image" name="capa_image" accept="image/*"
                      className="w-full text-xs text-text-secondary file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer border-2 border-dashed border-border-custom bg-background/50 rounded-2xl p-4 transition-all hover:border-primary/30"
                   />
                </div>

              </div>

              <div className="pt-10 border-t border-border-custom flex flex-col sm:flex-row justify-end gap-4 items-center justify-between">
                <div className="flex items-center gap-3 bg-background border border-border-custom px-5 py-3 rounded-2xl">
                   <input type="checkbox" id="status" name="status" defaultChecked className="w-5 h-5 text-primary bg-background border-border-custom rounded-lg focus:ring-primary" />
                   <label htmlFor="status" className="text-xs font-black uppercase tracking-widest text-text-primary cursor-pointer italic">Disponível para Alunos</label>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <Link 
                    href="/admin/recursos"
                    className="flex-1 sm:flex-none px-8 py-5 rounded-2xl border border-border-custom text-text-secondary hover:bg-black/5 font-black uppercase tracking-widest text-xs text-center transition-all"
                  >
                    Cancelar
                  </Link>
                  <button 
                    type="submit"
                    className="flex-1 sm:flex-none px-10 py-5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20"
                  >
                    <Save className="w-5 h-5" />
                    Criar Recurso
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Tutorial Card */}
        <div className="space-y-6">
          <AdminTutorialCard 
            moduleTitle="Recursos"
            color="indigo"
            role={role}
            steps={[
              {
                title: "Endereço do Arquivo",
                description: "Sempre use caminhos relativos para arquivos internos. Se colocou na pasta 'public', use '/ferramentas/...'."
              },
              {
                title: "Forma de Abertura",
                description: "Iframe abre a ferramenta dentro do player, ideal para simuladores. Nova Aba é melhor para planilhas e PDFs extensos."
              },
              {
                title: "Fluxo Inteligente",
                description: "Os campos Premium alimentam os textos explicativos que o aluno vê ao clicar na ferramenta no Mapa de Fluxo."
              }
            ]}
            example="/ferramentas/avaliacao-lideranca/index.html"
          />

          <div className="bg-surface border border-border-custom rounded-[2rem] p-8 flex items-center gap-6 hover:border-primary transition-all cursor-default shadow-lg">
             <div className="w-16 h-16 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary shrink-0">
                <Video className="w-8 h-8" />
             </div>
             <div>
                <p className="text-xs font-black text-text-primary uppercase tracking-[0.1em] italic">Tutorial em Vídeo</p>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-bold leading-relaxed">Assista ao guia detalhado no PH Academy.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
