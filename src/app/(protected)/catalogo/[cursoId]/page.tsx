import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PlayCircle, Lock, CheckCircle2, ArrowRight, Video, ExternalLink, Users, Clock, Calendar, Sparkles } from 'lucide-react'
import { formatDuration, cleanTitle } from '@/lib/formatter'
import { getPrefixosLimpeza } from '@/lib/prefixes'
import { ModuleListAccordion } from '@/components/module-list-accordion'
import * as motion from 'framer-motion/client'
import { FormattedText } from '@/components/CourseContent'

export const dynamic = 'force-dynamic'

export default async function CursoDetaisPage({
  params,
}: {
  params: Promise<{ cursoId: string }>
}) {
  const { cursoId } = await params
  const supabaseAuth = await createClient()
  const supabaseAdmin = createAdminClient()
  const prefixes = await getPrefixosLimpeza()

  // 1. Verificação de Usuário
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  // 2. Verificação de Admin (Bypass)
  const { data: isAdmin } = await supabaseAuth.rpc('is_admin')

  // 3. Buscar o curso (Admin vê mesmo se for rascunho)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursoId)
  const query = supabaseAdmin.from('cursos').select('*')
  
  if (isUUID) {
    query.or(`id.eq.${cursoId},slug.eq.${cursoId}`)
  } else {
    query.eq('slug', cursoId)
  }

  const { data: curso } = await query.single()

  if (!curso) notFound()

  // 3.1 Buscar dados do Professor
  const { data: professor } = curso.professor_id 
    ? await supabaseAdmin.from('professores').select('*').eq('id', curso.professor_id).single()
    : { data: null }

  // 4. Verificação de Acesso Robusta (Matrícula Direta ou Plano Global)
  let hasAccess = !!isAdmin;

  if (!hasAccess && user) {
     const { data: assinaturasAtivas } = await supabaseAdmin
       .from('assinaturas')
       .select('*, planos!left(is_global)') 
       .eq('usuario_id', user.id)
       .in('status', ['ativa', 'ativo', 'Ativa', 'Ativo'])

     const temMatriculaDireta = assinaturasAtivas?.some(a => a.curso_id === cursoId)
     const temPlanoGlobal = assinaturasAtivas?.some(a => a.planos?.is_global === true)
     
     hasAccess = temMatriculaDireta || temPlanoGlobal || false
  }

  // 5. Buscar todos os módulos e aulas (Lógica N:N compatível com Biblioteca)
  const { data: modulosData } = await supabaseAdmin.rpc('get_modulos_curso', { p_curso_id: curso.id })
  const uniqueModulosData = Array.from(new Map((modulosData || []).map((m: any) => [m.id, m])).values())
  const modulosIds = uniqueModulosData.map((m: any) => m.id)
  
  // Buscar aulas diretas (legado) e aulas via pivô
  const { data: aulasDiretas } = await supabaseAdmin.from('aulas').select('*').in('modulo_id', modulosIds)
  const { data: pivotAulas } = await supabaseAdmin.from('modulos_aulas').select('modulo_id, ordem, aulas(*)').in('modulo_id', modulosIds)

  const modulos = uniqueModulosData.map((m: any) => {
    const d = (aulasDiretas || []).filter((a: any) => a.modulo_id === m.id)
    const p = (pivotAulas || []).filter((pa: any) => pa.modulo_id === m.id).map((pa: any) => ({ ...pa.aulas, ordem: pa.ordem }))
    
    // Deduplicar aulas por ID dentro do módulo
    const combinedAulas = [...d, ...p]
    const uniqueAulas = Array.from(new Map(combinedAulas.map((a: any) => [a.id, a])).values())
    
    return { ...m, aulas: uniqueAulas.sort((a: any, b: any) => a.ordem - b.ordem) }
  })

  const todasAulasRaw = modulos.flatMap(m => m.aulas) || []
  // Deduplicar aulas por ID (evitar que aulas em múltiplos módulos matem o progresso)
  const seenAulasIds = new Set()
  const todasAulas = todasAulasRaw.filter(a => {
    if (!a?.id || seenAulasIds.has(a.id)) return false
    seenAulasIds.add(a.id)
    return true
  })
  const primeiraAulaRef = todasAulas[0]?.id

  // 6. Buscar progresso do aluno (Mapeamento Duplo: ID ou E-mail para legado)
  const { data: progresso } = await supabaseAdmin
    .from('progresso_aulas')
    .select('aula_id, concluida, updated_at')
    .eq('usuario_id', user.id)

  const aulasConcluidasIds = new Set((progresso || []).filter(p => p.concluida).map(p => p.aula_id))
  const aulasConcluidasNesteCurso = todasAulas.filter(a => aulasConcluidasIds.has(a.id)).length
  const progressoPorcentagem = todasAulas.length > 0 ? Math.round((aulasConcluidasNesteCurso / todasAulas.length) * 100) : 0

  const ultimaAulaConcluida = progresso?.filter(p => p.concluida).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
  const aulaParaContinuar = todasAulas.find(a => !aulasConcluidasIds.has(a.id))

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-80 md:h-[450px] rounded-[3rem] overflow-hidden mb-16 shadow-2xl border border-white/10 group"
      >
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
         {curso.thumb_url && (
            <img src={curso.thumb_url} alt={curso.titulo} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
         )}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16">
            <div className="flex items-center gap-3 mb-4">
               <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Conteúdo Premium</span>
               </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9] italic uppercase bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent text-glow">
              {cleanTitle(curso.titulo, prefixes)}
            </h1>
            
            {hasAccess ? (
               <div className="mt-4 flex flex-col gap-4 max-w-md">
                  <div className="flex items-center justify-between text-white/80 text-[10px] font-black uppercase tracking-widest">
                     <span>Seu progresso na jornada</span>
                     <span className="text-primary-light">{progressoPorcentagem}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/10 relative">
                     <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />
                     <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.6)]" 
                        style={{ width: `${progressoPorcentagem}%` }}
                     />
                  </div>
               </div>
            ) : (
               <p className="text-white/80 max-w-2xl text-lg font-medium line-clamp-2 italic leading-relaxed">{curso.descricao}</p>
            )}
         </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-16">
            <section>
               <h2 className="text-2xl font-black text-text-primary mb-8 flex items-center gap-4">
                  <div className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" /> 
                  Grade de Conteúdo
               </h2>
               
               <ModuleListAccordion 
                  modulos={modulos} 
                  cursoId={cursoId} 
                  hasAccess={hasAccess}
                  aulasConcluidasIds={Array.from(aulasConcluidasIds)}
                  prefixes={prefixes}
               />
            </section>

            {/* SEÇÃO DO PROFESSOR */}
            {professor && (
              <section className="space-y-8 pt-10 border-t border-border-custom">
                <h2 className="text-2xl font-black text-text-primary flex items-center gap-4">
                   <div className="w-2 h-8 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20" /> 
                   Quem ensina este curso
                </h2>
                
                <div className="bg-surface border border-border-custom rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row gap-10 items-start shadow-sm">
                   <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2.5rem] overflow-hidden shrink-0 border-4 border-white shadow-xl">
                      {professor.avatar_url ? (
                        <img src={professor.avatar_url} alt={professor.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                   </div>
                   <div className="space-y-4 flex-1">
                      <div>
                        <h3 className="text-2xl font-black text-text-primary uppercase italic tracking-tighter">{professor.nome}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Instrutor Verificado</span>
                        </div>
                      </div>
                    <div className="text-sm text-text-secondary leading-relaxed font-medium">
                      <FormattedText text={professor.biografia} />
                    </div>
                      
                      {(professor.video_url || professor.site_url) && (
                        <div className="flex flex-wrap gap-3 pt-4">
                           {professor.video_url && (
                             <a 
                               href={professor.video_url} 
                               target="_blank" 
                               className="px-4 py-2 bg-background border border-border-custom rounded-xl text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-primary hover:border-primary/30 transition-all flex items-center gap-2"
                             >
                               <Video className="w-3.5 h-3.5" />
                               Ver Apresentação
                             </a>
                           )}
                           {professor.site_url && (
                             <a 
                               href={professor.site_url} 
                               target="_blank" 
                               className="px-4 py-2 bg-background border border-border-custom rounded-xl text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-primary hover:border-primary/30 transition-all flex items-center gap-2"
                             >
                               <ExternalLink className="w-3.5 h-3.5" />
                               Site Oficial
                             </a>
                           )}
                        </div>
                      )}
                   </div>
                </div>
              </section>
            )}
         </div>

         <div className="space-y-6">
            <div className="bg-surface border border-border-custom rounded-[40px] p-8 sticky top-24 shadow-xl">
               <h3 className="font-black text-xl text-text-primary mb-6">Inicie agora</h3>
               {hasAccess && primeiraAulaRef ? (
                  <div className="space-y-6">
                     <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-2xl flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 shrink-0" />
                        <div>
                           <p className="text-sm font-bold tracking-tight">Liberado para estudo</p>
                           <p className="text-[8px] uppercase font-black tracking-[0.2em] opacity-70">Aproveite o conteúdo</p>
                        </div>
                     </div>
                     <Link href={`/player/${cursoId}/${aulaParaContinuar?.id || primeiraAulaRef}`} className="w-full py-5 px-6 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]">
                        {aulasConcluidasNesteCurso > 0 ? 'Ir para as Aulas' : 'Começar Agora'}
                        <ArrowRight className="w-4 h-4" />
                     </Link>
                  </div>
               ) : hasAccess && !primeiraAulaRef ? (
                  <div className="p-6 bg-background rounded-3xl border border-border-custom text-center">
                     <p className="text-sm font-black text-text-primary uppercase tracking-widest mb-1">Carga Horária Zero</p>
                     <p className="text-[10px] text-text-muted uppercase font-medium">As aulas ainda não foram registradas neste módulo.</p>
                  </div>
               ) : (
                  <div className="space-y-6">
                     <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-4 rounded-2xl flex items-center gap-3">
                        <Lock className="w-6 h-6 shrink-0" />
                        <div>
                           <p className="text-sm font-bold tracking-tight">Acesso Bloqueado</p>
                           <p className="text-[8px] uppercase font-black tracking-[0.2em] opacity-70">Compra Pendente</p>
                        </div>
                     </div>
                     <Link href={`/loja/curso/${cursoId}`} className="w-full py-5 px-6 bg-text-primary text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest">
                        Desbloquear
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}
