import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft, Save, Video } from 'lucide-react'
import { updateAula } from '../actions'
import { AnexosGerenciador } from './AnexosGerenciador'
import { formatDuration } from '@/lib/formatter'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'

export default async function EditarAulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabaseAdmin = createAdminClient()
  const supabaseAuth = await createClient()

  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdminRole } = await supabaseAuth.rpc('is_admin')
  const { data: userData } = await supabaseAuth.from('usuarios').select('is_staff').eq('id', user.id).single()
  
  const isAdmin = !!isAdminRole
  const isStaff = !!userData?.is_staff
  const role = isAdmin ? 'admin' : (isStaff ? 'staff' : 'user')

  const { data: aula } = await supabaseAdmin
    .from('aulas')
    .select('*')
    .eq('id', id)
    .single()

  if (!aula) {
    notFound()
  }

  const { data: questionarios } = await supabaseAdmin
    .from('questionarios')
    .select('id, titulo')
    .order('titulo')

  const { data: recursos } = await supabaseAdmin
    .from('recursos')
    .select('id, titulo')
    .order('titulo')

  // Bind the id to the server action
  const updateAulaWithId = updateAula.bind(null, aula.id)

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <Link 
          href="/admin/aulas" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Aulas
        </Link>
        <h1 className="text-3xl font-black text-text-primary italic uppercase tracking-tighter">Editar Aula</h1>
        <p className="text-text-secondary text-sm mt-1 uppercase tracking-widest font-bold opacity-60">Alterando informações e vídeo da aula atual.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-border-custom p-8 rounded-[2rem] shadow-xl">
            <form action={updateAulaWithId} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="titulo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Título da Aula *</label>
                  <input 
                    type="text" id="titulo" name="titulo" required
                    defaultValue={aula.titulo}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="slug" className="block text-xs font-black uppercase tracking-widest text-text-primary">URL/Slug Opcional</label>
                  <input 
                    type="text" id="slug" name="slug"
                    defaultValue={aula.slug || ''}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-mono text-xs"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="descricao" className="block text-xs font-black uppercase tracking-widest text-text-primary">Resumo / Conteúdo da Aula</label>
                  <textarea 
                    id="descricao" name="descricao" rows={4}
                    defaultValue={aula.descricao || ''}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
                  ></textarea>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="video_url" className="block text-xs font-black uppercase tracking-widest text-text-primary">Link do Vídeo</label>
                  <input 
                    type="text" id="video_url" name="video_url"
                    defaultValue={aula.video_url || ''}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="duracao" className="block text-xs font-black uppercase tracking-widest text-text-primary">Duração Fixa</label>
                  <input 
                    type="text" id="duracao" name="duracao"
                    defaultValue={formatDuration(aula.duracao_segundos)}
                    placeholder="00:00:00"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="modulo_id" className="block text-xs font-black uppercase tracking-widest text-text-primary">Origem / Vínculo</label>
                  <select 
                    id="modulo_id" name="modulo_id"
                    defaultValue={aula.modulo_id === null ? "null" : aula.modulo_id}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-bold appearance-none"
                  >
                    <option value="null">✅ Biblioteca Global</option>
                    {aula.modulo_id && (
                      <option value={aula.modulo_id}>🛑 Vínculo Direto Ativo</option>
                    )}
                  </select>
                </div>

                <div className="md:col-span-2 p-6 bg-background/50 border border-border-custom rounded-3xl space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="tipo_conteudo" className="block text-xs font-black uppercase tracking-widest text-primary">Formato</label>
                      <select 
                        id="tipo_conteudo" name="tipo_conteudo"
                        defaultValue={aula.tipo_conteudo || "video"}
                        className="w-full bg-surface border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-black"
                      >
                        <option value="video">🎥 Vídeo</option>
                        <option value="texto">📄 Texto</option>
                        <option value="questionario">📝 Simulado</option>
                        <option value="ferramenta">🛠️ Ferramenta</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="liberacao_dias" className="block text-xs font-black uppercase tracking-widest text-primary">Dias p/ Liberar</label>
                      <input 
                        type="number" id="liberacao_dias" name="liberacao_dias"
                        defaultValue={aula.liberacao_dias || 0} min={0}
                        className="w-full bg-surface border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-black"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="questionario_id" className="block text-xs font-black uppercase tracking-widest text-primary">Questionário Vinculado</label>
                      <select 
                        id="questionario_id" name="questionario_id"
                        defaultValue={aula.questionario_id || "null"}
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
                        id="recurso_id" name="recurso_id"
                        defaultValue={aula.recurso_id || "null"}
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
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>

          <AnexosGerenciador aulaId={aula.id} />
        </div>

        {/* Tutorial Sidebar */}
        <aside className="space-y-6">
          <AdminTutorialCard 
            role={role}
            moduleTitle="Edição de Aula"
            steps={[
              {
                title: "Formatos Inteligentes",
                description: "Selecione 'Simulado' ou 'Ferramenta' para ativar integrações automáticas no player."
              },
              {
                title: "Sincronização de Vídeo",
                description: "Cole links diretos do YouTube ou Vimeo. A duração é calculada automaticamente ou pode ser fixa."
              },
              {
                title: "Liberação Gradual",
                description: "Defina quantos dias após a matrícula a aula ficará disponível (0 = imediato)."
              }
            ]}
            color="sky"
          />
        </aside>
      </div>
    </div>
  )
}
