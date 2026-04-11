import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MonitorPlay, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function CatalogoPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // 1. Buscar todos os cursos publicados
  const { data: cursos, error } = await supabase
    .from('cursos')
    .select('*')
    .eq('status', 'publicado')
    .order('created_at', { ascending: true })

  // 2. Buscar acessos do usuário para decidir link
  let idsAcessos: string[] = []
  if (user) {
    const { data: assinaturas } = await supabaseAdmin
      .from('assinaturas')
      .select('curso_id, planos(is_global)')
      .eq('usuario_id', user.id)
      .eq('status', 'ativa')
    
    const possuiGlobal = assinaturas?.some((a: any) => a.planos?.is_global)
    if (possuiGlobal) {
      idsAcessos = cursos?.map(c => c.id) || []
    } else {
      idsAcessos = assinaturas?.map(a => a.curso_id).filter(Boolean) as string[] || []
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-12 text-white border border-white/5 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Ecoinovação em Foco</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Acelere sua <span className="text-blue-400">Transformação</span>
            </h1>
            <p className="text-slate-400 mt-4 text-lg font-medium">
              Explore nossa vitrine de treinamentos estrategicamente desenhados para sua evolução.
            </p>
          </div>
          <div className="hidden lg:block">
             <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl">
                <MonitorPlay className="w-16 h-16 text-white" />
             </div>
          </div>
        </div>
      </div>

      {(!cursos || cursos.length === 0) ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-200">Novidades em breve</h3>
            <p className="text-slate-400 mt-2 max-w-md"> Estamos preparando novos treinamentos incríveis para sua jornada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cursos.map((curso) => {
            const jaMatriculado = idsAcessos.includes(curso.id)
            const targetPath = jaMatriculado ? `/catalogo/${curso.id}` : `/loja/curso/${curso.id}`

            return (
              <div key={curso.id} className="group relative bg-[#0F172A] rounded-[3rem] border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col">
                <div className="h-64 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent z-10" />
                  {curso.thumb_url ? (
                    <img src={curso.thumb_url} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-800 text-6xl font-black uppercase tracking-tighter">
                      {curso.titulo.substring(0, 2)}
                    </div>
                  )}
                  
                  <div className="absolute top-6 right-6 z-20">
                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                      {curso.pilar_id?.replace(/[^a-zA-Z0-0]/g, '').substring(0, 8) || 'Essencial'}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 pt-2 flex-1 flex flex-col relative z-20">
                  <h3 className="text-2xl font-black text-slate-100 leading-tight group-hover:text-blue-400 transition-colors duration-300">
                    {curso.titulo}
                  </h3>
                  <p className="text-slate-400 mt-4 text-sm font-medium line-clamp-3 leading-relaxed flex-1">
                    {curso.descricao || 'Este curso ainda não possui uma descrição detalhada.'}
                  </p>
                  
                  <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                    <Link 
                      href={targetPath} 
                      className="w-full py-4 px-6 bg-slate-800 text-white font-black rounded-2xl group-hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em]"
                    >
                      {jaMatriculado ? 'Acessar Treinamento' : 'Ver Detalhes'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
