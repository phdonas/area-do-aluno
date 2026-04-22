import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Save, LayoutTemplate, HelpCircle, Video } from 'lucide-react'
import { updateModulo } from '../actions'
import { AulaAssociator } from '../AulaAssociator'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'
import { redirect } from 'next/navigation'

export default async function EditarModuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabaseAuth = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdminRole } = await supabaseAuth.rpc('is_admin')
  const { data: userData } = await supabaseAuth.from('usuarios').select('is_staff').eq('id', user.id).single()
  
  const isAdmin = !!isAdminRole
  const isStaff = !!userData?.is_staff
  const role = isAdmin ? 'admin' : (isStaff ? 'staff' : 'user')

  if (!isAdmin && !isStaff) {
    redirect('/admin') // Volta pro início do admin se não for admin/staff
  }

  const { data: modulo } = await supabaseAdmin
    .from('modulos')
    .select('*')
    .eq('id', id)
    .single()

  if (!modulo) {
    notFound()
  }

  // Bind the id to the server action
  const updateModuloWithId = updateModulo.bind(null, modulo.id)

  // 1. Fetch Aulas para o associador (Apenas as que não tem modulo_id ou o ID atual)
  // Limitamos a 100 para evitar o gargalo de performance de 8s
  const { data: todasAulasGlobais } = await supabaseAdmin
    .from('aulas')
    .select('id, titulo, modulo_id')
    .or(`modulo_id.is.null,modulo_id.eq.${id}`)
    .order('titulo', { ascending: true })
    .limit(100)

  // 2. Fetch Aulas atreladas a este módulo (Diretas)
  const { data: aulasDiretas } = await supabaseAdmin
    .from('aulas')
    .select('id, titulo, modulo_id, ordem')
    .eq('modulo_id', id)
  
  // 3. Fetch Aulas atreladas a este módulo (Pivot)
  const { data: pivotAulas } = await supabaseAdmin
    .from('modulos_aulas')
    .select('ordem, aula_id, aulas(id, titulo, modulo_id)')
    .eq('modulo_id', id)

  // 4. Montar Array unificado de Aulas Do Módulo
  const aulasDoModuloMap = new Map();
  
  if (aulasDiretas) {
    aulasDiretas.forEach(a => {
      aulasDoModuloMap.set(a.id, {
        aula_id: a.id,
        ordem: a.ordem,
        isDirect: true,
        aula: {
          id: a.id,
          titulo: a.titulo,
          modulo_id: a.modulo_id
        }
      });
    });
  }

  if (pivotAulas) {
    pivotAulas.forEach((p: any) => {
      // Evita duplicatas se por acaso existir nas duas (raro, mas possivel)
      if (!aulasDoModuloMap.has(p.aula_id)) {
        aulasDoModuloMap.set(p.aula_id, {
          aula_id: p.aula_id,
          ordem: p.ordem,
          isDirect: false,
          aula: {
            id: p.aulas.id,
            titulo: p.aulas.titulo,
            modulo_id: p.aulas.modulo_id
          }
        });
      }
    });
  }

  const aulasDoModulo = Array.from(aulasDoModuloMap.values()).sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <Link 
          href="/admin/modulos"
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-black text-text-primary italic uppercase tracking-tighter">Editar Módulo</h1>
        <p className="text-text-secondary text-sm mt-1 uppercase tracking-widest font-bold opacity-60">Gerencie a estrutura e as aulas vinculadas a este módulo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-border-custom p-8 rounded-[2.5rem] shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-xl font-bold text-text-primary">
               <LayoutTemplate className="w-5 h-5 text-indigo-500" /> Detalhes do Módulo
            </div>
          
          <form action={updateModuloWithId} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="titulo" className="block text-sm font-bold text-text-primary">Título do Módulo *</label>
              <input 
                type="text" 
                id="titulo" 
                name="titulo" 
                required
                defaultValue={modulo.titulo}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="descricao" className="block text-sm font-bold text-text-primary">Descrição Resumida</label>
              <textarea 
                id="descricao" 
                name="descricao" 
                rows={3}
                defaultValue={modulo.descricao || ''}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="ordem" className="block text-sm font-bold text-text-primary">Ordem Padrão</label>
                <input 
                  type="number" 
                  id="ordem" 
                  name="ordem" 
                  defaultValue={modulo.ordem || 0}
                  className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="curso_id" className="block text-sm font-bold text-text-primary">Vínculo Direto</label>
                <select 
                  id="curso_id" 
                  name="curso_id" 
                  defaultValue={modulo.curso_id === null ? "null" : modulo.curso_id}
                  className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
                >
                  <option value="null">✅ Global / Biblioteca</option>
                  {modulo.curso_id && (
                     <option value={modulo.curso_id}>🛑 Vinculado Exclusivamente a um Curso Específico</option>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="ui_layout" className="block text-sm font-bold text-text-primary">Layout de Exibição (Player)</label>
              <select 
                id="ui_layout" 
                name="ui_layout" 
                defaultValue={modulo.ui_layout || 'padrao'}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
              >
                <option value="padrao">📺 Lista de Aulas (Vídeo Padrão)</option>
                <option value="fluxo">🗺️ Fluxo de Ferramentas (Mapa Visual)</option>
              </select>
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest mt-1">
                Define se o módulo abre o player de vídeo ou o mapa interativo de ferramentas.
              </p>
            </div>

            <div className="pt-6 border-t border-border-custom flex justify-end gap-3">
              <Link 
                href="/admin/modulos"
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

        <AulaAssociator 
           moduloId={modulo.id}
           todasAulasGlobais={todasAulasGlobais || []}
           aulasDoModulo={aulasDoModulo as any}
        />
      </div>

      {/* Tutorial Card */}
        <div className="space-y-6">
          <AdminTutorialCard 
            moduleTitle="Módulos"
            color="indigo"
            role={role}
            steps={[
              {
                title: "Layout de Fluxo",
                description: "Ao escolher 'Fluxo de Ferramentas', as aulas desse módulo aparecerão como um mapa interativo tipo Miro."
              },
              {
                title: "Vínculo Global",
                description: "Módulos na 'Biblioteca' podem ser importados para qualquer curso, servindo como templates reutilizáveis."
              }
            ]}
          />

          <div className="bg-surface border border-border-custom rounded-[2rem] p-8 flex items-center gap-6 hover:border-indigo-500/30 transition-all cursor-default shadow-lg group">
             <div className="w-16 h-16 bg-indigo-500/10 rounded-[1.25rem] flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8" />
             </div>
             <div>
                <p className="text-xs font-black text-text-primary uppercase tracking-[0.1em] italic">Dica Visual</p>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-bold leading-relaxed">Use ícones claros nos nomes das aulas para facilitar o fluxo.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
