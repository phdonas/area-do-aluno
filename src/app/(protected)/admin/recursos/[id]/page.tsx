import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Save, Sparkles, Zap, HelpCircle, Video } from 'lucide-react'
import { updateRecurso } from '../actions'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'
import { redirect } from 'next/navigation'

export default async function EditarRecursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recurso } = await supabase
    .from('recursos')
    .select('*')
    .eq('id', id)
    .single()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdminRole } = await supabase.rpc('is_admin')
  const { data: userData } = await supabase.from('usuarios').select('is_staff').eq('id', user.id).single()
  
  const isAdmin = !!isAdminRole
  const isStaff = !!userData?.is_staff
  const role = isAdmin ? 'admin' : (isStaff ? 'staff' : 'user')

  if (!recurso) {
    notFound()
  }

  const updateRecursoAction = updateRecurso.bind(null, recurso.id)

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div>
        <Link 
          href="/admin/recursos" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Recursos e Ferramentas
        </Link>
        <h1 className="text-3xl font-black text-text-primary italic uppercase tracking-tighter">Editar Recurso</h1>
        <p className="text-text-secondary text-sm mt-1">Configurações para: <span className="font-bold text-primary">{recurso.titulo}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário Principal */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border-custom p-8 rounded-[2rem] shadow-xl">
            <form action={updateRecursoAction} className="space-y-8">
              
              {/* Destaque Vitrine */}
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${recurso.destaque_vitrine ? 'bg-primary text-white scale-110' : 'bg-surface text-text-muted'}`}>
                       <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest italic text-text-primary">Exibir nos "Materiais Gratuitos"</p>
                       <p className="text-[10px] text-text-secondary font-medium">Este material ficará em destaque na Vitrine pública.</p>
                    </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="destaque_vitrine" defaultChecked={recurso.destaque_vitrine} className="sr-only peer" />
                    <div className="w-11 h-6 bg-border-custom peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                 </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="titulo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Título do Recurso *</label>
                  <input 
                    type="text" id="titulo" name="titulo" required defaultValue={recurso.titulo}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="descricao" className="block text-xs font-black uppercase tracking-widest text-text-primary">Descrição Curta</label>
                  <textarea 
                    id="descricao" name="descricao" rows={3} defaultValue={recurso.descricao || ''}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
                    placeholder="Uma breve apresentação técnica do recurso..."
                  ></textarea>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="arquivo_url" className="block text-xs font-black uppercase tracking-widest text-text-primary hover:text-primary transition-colors cursor-help">URL / Endereço do Arquivo *</label>
                  <input 
                    type="text" id="arquivo_url" name="arquivo_url" required defaultValue={recurso.arquivo_url}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="tipo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Tipo</label>
                  <select 
                    id="tipo" name="tipo" defaultValue={recurso.tipo}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-bold appearance-none"
                  >
                    <option value="simulador">Simulador HTML</option>
                    <option value="planilha">Planilha</option>
                    <option value="pdf">PDF / Documento</option>
                    <option value="link">Link Externo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="abertura_tipo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Comportamento</label>
                  <select 
                    id="abertura_tipo" name="abertura_tipo" defaultValue={recurso.abertura_tipo}
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
                         id="objetivo" name="objetivo" rows={4} defaultValue={recurso.objetivo || ''}
                         className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
                         placeholder="Qual o propósito fundamental desta ferramenta?"
                       ></textarea>
                     </div>
                     <div className="space-y-2">
                       <label htmlFor="quando_usar" className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Quando Aplicar (Timing)</label>
                       <textarea 
                         id="quando_usar" name="quando_usar" rows={4} defaultValue={recurso.quando_usar || ''}
                         className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
                         placeholder="Em que momento do processo o aluno deve usar?"
                       ></textarea>
                     </div>
                     <div className="space-y-2">
                       <label htmlFor="como_usar" className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Instruções de Execução</label>
                       <textarea 
                         id="como_usar" name="como_usar" rows={4} defaultValue={recurso.como_usar || ''}
                         className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
                         placeholder="Passo a passo rápido de como preencher/utilizar."
                       ></textarea>
                     </div>
                     <div className="space-y-2">
                       <label htmlFor="resultados_esperados" className="block text-[10px] font-black uppercase tracking-widest text-text-muted">Resultados Esperados</label>
                       <textarea 
                         id="resultados_esperados" name="resultados_esperados" rows={4} defaultValue={recurso.resultados_esperados || ''}
                         className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm text-text-primary focus:outline-none focus:border-primary transition-all font-medium"
                         placeholder="O que o aluno deve ter em mãos ao finalizar?"
                       ></textarea>
                     </div>
                   </div>
                </div>

                <div className="space-y-4 md:col-span-2 pt-10 border-t border-border-custom">
                   <label className="block text-xs font-black uppercase tracking-widest text-text-primary">Imagem de Capa (Thumbnail)</label>
                   <div className="flex items-center gap-6">
                     {recurso.thumb_url && (
                        <img src={recurso.thumb_url} alt="Capa atual" className="w-24 h-24 rounded-2xl border border-border-custom object-cover shadow-lg" />
                     )}
                     <input 
                        type="file" id="capa_image" name="capa_image" accept="image/*"
                        className="flex-1 text-xs text-text-secondary file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer border-2 border-dashed border-border-custom bg-background/50 rounded-2xl p-4 transition-all hover:border-primary/30"
                     />
                   </div>
                </div>

              </div>

              <div className="pt-10 border-t border-border-custom flex flex-col sm:flex-row justify-end gap-4 items-center justify-between">
                <div className="flex items-center gap-3 bg-background border border-border-custom px-5 py-3 rounded-2xl">
                   <input type="checkbox" id="status" name="status" defaultChecked={recurso.status === 'ativo'} className="w-5 h-5 text-primary bg-background border-border-custom rounded-lg focus:ring-primary" />
                   <label htmlFor="status" className="text-sm font-bold text-text-primary cursor-pointer italic">Disponível para Alunos</label>
                </div>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20"
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </button>
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

          <div className="bg-surface border border-border-custom rounded-[2rem] p-8 flex items-center gap-6 hover:border-primary transition-all cursor-default shadow-lg group">
             <div className="w-16 h-16 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8" />
             </div>
             <div>
                <p className="text-xs font-black text-text-primary uppercase tracking-[0.1em] italic">Tutorial em Vídeo</p>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-bold leading-relaxed">Assista ao guia detalhado de integração.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
