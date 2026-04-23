import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, FileQuestion } from 'lucide-react'
import { createQuestionario } from '../actions'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'

export default async function NovoQuestionarioPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdminRole } = await supabase.rpc('is_admin')
  const { data: userData } = await supabase.from('usuarios').select('is_staff').eq('id', user.id).single()
  
  const isAdmin = !!isAdminRole
  const isStaff = !!userData?.is_staff
  const role = isAdmin ? 'admin' : (isStaff ? 'staff' : 'user')

  if (!isAdmin && !isStaff) {
    redirect('/catalogo?acesso_negado=admin')
  }

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <Link 
          href="/admin/questionarios" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Questionários
        </Link>
        <h1 className="text-3xl font-black text-text-primary italic uppercase tracking-tighter">Novo <span className="text-rose-500">Questionário</span></h1>
        <p className="text-text-secondary text-sm mt-1 uppercase tracking-widest font-bold opacity-60">Crie avaliações contendo questões para usar nas aulas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-border-custom p-8 rounded-[2rem] shadow-xl">
            <div className="flex items-center gap-3 mb-8 text-lg font-black text-text-primary uppercase tracking-widest">
              <FileQuestion className="w-6 h-6 text-rose-500" /> Detalhes da Avaliação
            </div>
            
            <form action={createQuestionario} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="titulo" className="block text-xs font-black uppercase tracking-widest text-text-primary">Título *</label>
                <input 
                  type="text" id="titulo" name="titulo" required
                  className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="descricao" className="block text-xs font-black uppercase tracking-widest text-text-primary">Instruções / Descrição</label>
                <textarea 
                  id="descricao" name="descricao" rows={3}
                  className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="nota_corte" className="block text-xs font-black uppercase tracking-widest text-text-primary">Nota de Corte (%) *</label>
                  <input 
                    type="number" id="nota_corte" name="nota_corte" required
                    defaultValue={70} min={0} max={100}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-mono"
                  />
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Mínimo para aprovação.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="tentativas_permitidas" className="block text-xs font-black uppercase tracking-widest text-text-primary">Tentativas Permitidas</label>
                  <input 
                    type="number" id="tentativas_permitidas" name="tentativas_permitidas" required
                    defaultValue={0} min={0}
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary transition-all font-mono"
                  />
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">0 = Tentativas ilimitadas.</p>
                </div>
              </div>

              <div className="pt-10 border-t border-border-custom flex flex-col sm:flex-row justify-end gap-4 mt-8">
                <Link 
                  href="/admin/questionarios"
                  className="px-8 py-5 rounded-2xl border border-border-custom text-text-secondary hover:bg-black/5 font-black uppercase tracking-widest text-xs text-center transition-all"
                >
                  Cancelar
                </Link>
                <button 
                  type="submit"
                  className="px-10 py-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-rose-500/20"
                >
                  <Save className="w-5 h-5" />
                  Próximo: Criar Questões
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tutorial Sidebar */}
        <aside className="space-y-6">
          <AdminTutorialCard 
            role={role}
            moduleTitle="Guia de Avaliações"
            steps={[
              {
                title: "Nota de Aprovação",
                description: "Defina qual o percentual mínimo de acertos necessário para que a aula seja considerada concluída."
              },
              {
                title: "Gestão de Escassez",
                description: "Limite o número de tentativas se quiser que o aluno revise o conteúdo antes de tentar novamente."
              },
              {
                title: "Vínculo com Aula",
                description: "Após criar o questionário, vá na edição da Aula e selecione-o no campo 'Questionário Vinculado'."
              }
            ]}
            color="rose"
          />
        </aside>
      </div>
    </div>
  )
}
