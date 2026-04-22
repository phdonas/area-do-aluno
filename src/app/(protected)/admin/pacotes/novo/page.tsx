import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, Save, Package } from 'lucide-react'
import { createPacote } from '../actions'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'

export default async function NovoPacotePage() {
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

  // Buscar todos os cursos para exibição no multiselect
  const { data: cursos } = await supabase
    .from('cursos')
    .select('id, titulo')
    .order('titulo')

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <Link 
          href="/admin/pacotes" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Pacotes
        </Link>
        <h1 className="text-3xl font-black text-text-primary italic uppercase tracking-tighter">Novo Produto / <span className="text-purple-500">Pacote</span></h1>
        <p className="text-text-secondary text-sm mt-1 uppercase tracking-widest font-bold opacity-60">Crie um combo que dará acesso a um ou mais cursos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-border-custom p-8 rounded-[2rem] shadow-xl">
            <form action={createPacote} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="nome" className="block text-xs font-black uppercase tracking-widest text-text-primary">Nome Comercial do Produto *</label>
                  <input 
                    type="text" id="nome" name="nome" required
                    placeholder="Ex: Formação Gestor Completo"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-medium"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="descricao" className="block text-xs font-black uppercase tracking-widest text-text-primary">Descrição Curta</label>
                  <textarea 
                    id="descricao" name="descricao" rows={2}
                    placeholder="Ex: Acesso vitalício aos cursos de marketing e operações..."
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="preco_mensal" className="block text-xs font-black uppercase tracking-widest text-text-primary">Preço Mensalidade (R$)</label>
                  <input 
                    type="number" step="0.01" min="0" id="preco_mensal" name="preco_mensal" 
                    placeholder="Opcional. Ex: 97.90"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="preco_anual" className="block text-xs font-black uppercase tracking-widest text-text-primary">Preço Anuidade (R$)</label>
                  <input 
                    type="number" step="0.01" min="0" id="preco_anual" name="preco_anual" 
                    placeholder="Opcional. Ex: 997.00"
                    className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>
              </div>

              <div className="p-6 bg-background/50 border border-border-custom rounded-3xl flex items-center justify-between gap-4 mt-6">
                 <div>
                    <h4 className="font-ex-black text-text-primary uppercase tracking-tighter text-sm italic">Passaporte Global?</h4>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Acesso a TODOS os cursos do site (atuais e futuros).</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="is_global" className="sr-only peer" />
                    <div className="w-14 h-7 bg-border-custom peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500 shadow-inner"></div>
                 </label>
              </div>

              <div className="space-y-4 mt-8">
                 <label className="block text-xs font-black uppercase tracking-widest text-text-primary">Composição do Pacote</label>
                 <select 
                   name="cursos" multiple 
                   className="w-full bg-background border border-border-custom rounded-3xl p-5 text-text-primary focus:outline-none focus:border-primary transition-all text-sm h-64 appearance-none font-bold overflow-y-auto"
                 >
                    {cursos?.map(c => (
                       <option key={c.id} value={c.id} className="p-4 border-b border-border-custom/20 last:border-0 rounded-xl mb-2 hover:bg-white/5 transition-colors cursor-pointer checked:bg-purple-500/20 checked:text-purple-400">
                         📚 {c.titulo}
                       </option>
                    ))}
                 </select>
                 <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">DICA: Use CTRL para selecionar múltiplos cursos.</p>
              </div>

              <div className="pt-10 border-t border-border-custom flex flex-col sm:flex-row justify-between items-center gap-6 mt-8">
                <div className="flex items-center gap-4 bg-background/50 px-6 py-4 rounded-2xl border border-border-custom w-full sm:w-auto">
                   <input type="checkbox" id="ativo" name="ativo" defaultChecked className="w-5 h-5 text-purple-600 bg-background border-border-custom rounded-lg focus:ring-purple-500 cursor-pointer" />
                   <label htmlFor="ativo" className="text-[10px] font-black text-text-primary uppercase tracking-widest cursor-pointer">Inativo na Vitrine</label>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <Link 
                    href="/admin/pacotes"
                    className="flex-1 sm:flex-none px-8 py-5 rounded-2xl border border-border-custom text-text-secondary hover:bg-black/5 font-black uppercase tracking-widest text-xs text-center transition-all"
                  >
                    Cancelar
                  </Link>
                  <button 
                    type="submit"
                    className="flex-1 sm:flex-none px-10 py-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-500/20"
                  >
                    <Save className="w-5 h-5" />
                    Criar Produto
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Tutorial Sidebar */}
        <aside className="space-y-6">
          <AdminTutorialCard 
            role={role}
            title="Guia de Pacotes"
            description="Combine seus cursos em ofertas irresistíveis para seus alunos."
            steps={[
              {
                title: "O que é um Pacote?",
                description: "É o produto final que o aluno compra. Pode ser um único curso ou um combo de vários."
              },
              {
                title: "Passaporte Global",
                description: "Ative esta opção para criar um plano de assinatura total, removendo a necessidade de selecionar cursos individualmente."
              },
              {
                title: "Preços Flexíveis",
                description: "Defina preços mensais ou anuais. O sistema gerencia o acesso com base na validade do pagamento."
              }
            ]}
            color="purple"
          />
        </aside>
      </div>
    </div>
  )
}
