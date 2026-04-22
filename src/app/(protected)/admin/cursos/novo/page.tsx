import Link from 'next/link'
import { ChevronLeft, Save, Video } from 'lucide-react'
import { createCurso } from '../actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'

export default async function NovoCursoPage() {
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
          href="/admin/cursos" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Cursos
        </Link>
        <h1 className="text-3xl font-black text-text-primary italic uppercase tracking-tighter">Iniciar Novo Curso Principal</h1>
        <p className="text-text-secondary text-sm mt-1 uppercase tracking-widest font-bold opacity-60">Primeiro criamos os metadados. No próximo passo você montará a grade curricular.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário Principal */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border-custom p-8 rounded-[2rem] shadow-xl">
            <form action={createCurso} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="titulo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Título Público do Curso *</label>
                  <input 
                    type="text" id="titulo" name="titulo" required
                    placeholder="Ex: Formação em Vendas Avançadas"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-medium"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="slug" className="block text-xs font-black uppercase tracking-widest text-text-primary">URL/Slug (Opcional)</label>
                  <input 
                    type="text" id="slug" name="slug"
                    placeholder="vazio = gerado automaticamente"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-mono text-xs"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="descricao" className="block text-xs font-black uppercase tracking-widest text-text-primary">Apresentação / Descrição</label>
                  <textarea 
                    id="descricao" name="descricao" rows={6}
                    placeholder="O que o aluno aprende nesta jornada?"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label htmlFor="thumb_url" className="block text-xs font-black uppercase tracking-widest text-text-primary">Thumbnail URL (Capa)</label>
                  <input 
                    type="url" id="thumb_url" name="thumb_url"
                    placeholder="https://image.com/capa.jpg"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="block text-xs font-black uppercase tracking-widest text-text-primary">Visibilidade Inicial</label>
                  <select 
                    id="status" name="status"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-bold appearance-none"
                  >
                    <option value="rascunho">⚠️ Rascunho (Oculto)</option>
                    <option value="publicado">✅ Publicado (Disponível)</option>
                  </select>
                </div>
              </div>

              <div className="pt-10 border-t border-border-custom flex flex-col sm:flex-row justify-end gap-4 mt-8">
                <Link 
                  href="/admin/cursos"
                  className="px-8 py-5 rounded-2xl border border-border-custom text-text-secondary hover:bg-black/5 font-black uppercase tracking-widest text-xs text-center transition-all"
                >
                  Cancelar
                </Link>
                <button 
                  type="submit"
                  className="px-10 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20"
                >
                  Avançar para Montagem <Save className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tutorial Card */}
        <div className="space-y-6">
          <AdminTutorialCard 
            moduleTitle="Cursos"
            color="emerald"
            role={role}
            steps={[
              {
                title: "Configuração do Slug",
                description: "O 'slug' é o link amigável. Se deixar vazio, criamos um baseado no título (Ex: 'vendas-avancadas')."
              },
              {
                title: "Capas e Identidade",
                description: "Use imagens em 16:9 (Ex: 1920x1080). Isso garante que o curso apareça bem no catálogo."
              },
              {
                title: "Rascunho vs Publicado",
                description: "Cursos em 'Rascunho' só são visíveis para você no Admin. Publique apenas quando a grade estiver pronta."
              }
            ]}
          />

          <div className="bg-surface border border-border-custom rounded-[2rem] p-8 flex items-center gap-6 hover:border-emerald-500/30 transition-all cursor-default shadow-lg group">
             <div className="w-16 h-16 bg-emerald-500/10 rounded-[1.25rem] flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8" />
             </div>
             <div>
                <p className="text-xs font-black text-text-primary uppercase tracking-[0.1em] italic">Tutorial em Vídeo</p>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-bold leading-relaxed">Como estruturar um curso de sucesso no PH Academy.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
