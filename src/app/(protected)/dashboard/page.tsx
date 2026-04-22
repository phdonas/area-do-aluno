import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  PlayCircle, Lock, CheckCircle2, ArrowRight, Clock, Award, Sparkles, 
  MonitorPlay, Activity, Zap, Star, Calendar, Rocket, Target, Flame, Brain
} from 'lucide-react'
import { cleanTitle } from '@/lib/formatter'
import { getPrefixosLimpeza } from '@/lib/prefixes'
import { RadarChart } from '@/components/RadarChart'
import { StudyHeatmap } from '@/components/StudyHeatmap'
import { BadgesGroup } from '@/components/BadgesGroup'
import { PDIWidget } from '@/components/PDIWidget'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  const prefixes = await getPrefixosLimpeza()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

   const results = await Promise.all([
    supabaseAdmin.from('assinaturas').select('curso_id, created_at, cursos(*), planos!left(is_global)').eq('usuario_id', user.id).in('status', ['ativa', 'ativo', 'Ativa', 'Ativo']),
    supabaseAdmin.from('progresso_aulas').select('aula_id, concluida, ultima_visualizacao, curso_id').eq('usuario_id', user.id),
    supabaseAdmin.from('cursos').select('*').eq('status', 'publicado'),
    supabaseAdmin.from('progresso_aulas')
      .select('ultima_visualizacao, curso_id')
      .eq('usuario_id', user.id)
      .eq('concluida', true)
      .gt('ultima_visualizacao', new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()),
    supabaseAdmin.from('usuarios').select('phd_coins_total, phd_nivel, streak_dias').eq('id', user.id).single(),
    supabaseAdmin.from('badges_aluno').select('*').eq('usuario_id', user.id).order('conquistado_em', { ascending: false }).limit(3),
    supabaseAdmin.from('metas_aluno').select('*').eq('usuario_id', user.id).order('created_at', { ascending: false })
  ])

  const [res_assinaturas, res_progresso, res_cursos, res_atividade, res_gamificacao, res_badges, res_metas] = results

  if (res_assinaturas.error) console.error('Erro assinaturas:', res_assinaturas.error)
  if (res_progresso.error) console.error('Erro progresso:', res_progresso.error)
  if (res_gamificacao.error) console.error('Erro gamificação:', res_gamificacao.error)
  if (res_metas.error) console.error('Erro metas:', res_metas.error)

  const assinaturas = res_assinaturas.data || []
  const progressoTotal = res_progresso.data || []
  const cursosBase = res_cursos.data || []
  const rawActivityLogs = res_atividade.data || []
  const gamificacao = (res_gamificacao?.data as any) || { phd_coins_total: 0, phd_nivel: 1, streak_dias: 0 }
  const badges = res_badges?.data || []
  const metas = res_metas?.data || []

  const processedActivityData: Record<string, number> = {}
  if (Array.isArray(rawActivityLogs)) {
    rawActivityLogs.forEach((log: any) => {
      const dateKey = format(new Date(log.ultima_visualizacao), 'yyyy-MM-dd')
      processedActivityData[dateKey] = (processedActivityData[dateKey] || 0) + 1
    })
  }

  // 1.5 Mapeamento de Acessos (Suporte a Plano Global)
  const hasGlobalPlan = assinaturas.some(a => (a.planos as any)?.is_global)
  
  const idsCursosComprados = [
    ...(assinaturas?.map(a => a.curso_id) || []),
    ...(cursosBase?.filter(c => (c as any).is_free).map(c => c.id) || []),
    ...(hasGlobalPlan ? (cursosBase?.map(c => c.id) || []) : [])
  ].filter(Boolean).reduce((acc: string[], cur: string) => {
    if (!acc.includes(cur)) acc.push(cur)
    return acc
  }, [])

  // 1.6 Resolução Hierárquica da Grade (Idêntico ao Player)
  const gradesCursos = await Promise.all(
    idsCursosComprados.map(async (cursoId) => {
      const { data: modulosData } = await supabaseAdmin.rpc('get_modulos_curso', { p_curso_id: cursoId })
      const modulosIds = modulosData?.map((m: any) => m.id) || []
      
      // Busca direta e via pivot
      const [{ data: a_dir }, { data: a_piv }] = await Promise.all([
        supabaseAdmin.from('aulas').select('id, modulo_id, titulo, ordem').in('modulo_id', modulosIds),
        supabaseAdmin.from('modulos_aulas').select('modulo_id, aula_id, ordem, aulas(id, titulo)').in('modulo_id', modulosIds)
      ])

      const aulasMapeadas = [
        ...(a_dir || []),
        ...(a_piv?.map((p: any) => ({ 
          id: p.aula_id, 
          modulo_id: p.modulo_id, 
          titulo: (p.aulas as any)?.titulo || 'Aula',
          ordem: p.ordem 
        })) || [])
      ]

      // Garantir unicidade por ID de aula dentro do curso
      const unique = new Map()
      aulasMapeadas.forEach(a => {
        if (!unique.has(a.id)) {
          unique.set(a.id, { ...a, curso_id: cursoId })
        }
      })

      return { 
        aulas: Array.from(unique.values()), 
        hasFluxo: (modulosData || []).some((m: any) => m.ui_layout === 'fluxo') 
      }
    })
  )

  const todasAulas = gradesCursos.flatMap(g => g.aulas)
  const cursoFluxoMap = new Map(idsCursosComprados.map((id, idx) => [id, gradesCursos[idx].hasFluxo]))
  const progressoMap = new Map(progressoTotal?.map(p => {
    const key = p.curso_id ? `${p.curso_id}-${p.aula_id}` : p.aula_id;
    return [key, p];
  }) || [])
  
  const idsAulasConcluidas = new Set(progressoTotal?.filter(p => p.concluida).map(p => {
    return p.curso_id ? `${p.curso_id}-${p.aula_id}` : p.aula_id;
  }) || [])

  // 2. Cálculo de Progresso Robusto (Varredura Unificada)
  const getStatsCurso = (cursoId: string) => {
    const uniqueAulasIds = new Set()
    const aulasDoCurso = todasAulas.filter((a: any) => {
      if (a.curso_id === cursoId && !uniqueAulasIds.has(a.id)) {
        uniqueAulasIds.add(a.id)
        return true
      }
      return false
    })

    if (aulasDoCurso.length === 0) return { percent: 0, lastId: null }

    const concluidas = aulasDoCurso.filter(a => idsAulasConcluidas.has(`${cursoId}-${a.id}`) || idsAulasConcluidas.has(a.id)).length
    const percent = Math.round((concluidas / aulasDoCurso.length) * 100)

    // Achar a aula com visualização mais recente NESTE curso
    const aulasComData = aulasDoCurso
      .map(a => ({ id: a.id, data: progressoMap.get(`${cursoId}-${a.id}`)?.ultima_visualizacao || progressoMap.get(a.id)?.ultima_visualizacao }))
      .filter(a => a.data)
      .sort((a, b) => new Date(b.data!).getTime() - new Date(a.data!).getTime())

    const lastId = aulasComData.length > 0 
      ? aulasComData[0].id 
      : (aulasDoCurso.find(a => !idsAulasConcluidas.has(`${cursoId}-${a.id}`) && !idsAulasConcluidas.has(a.id))?.id || aulasDoCurso[0].id)

    return { 
      percent, 
      lastId, 
      hasActivity: aulasComData.length > 0,
      hasFluxo: cursoFluxoMap.get(cursoId) || false
    }
  }

  // 3. Processamento p/ UI (Radar e Recomendação) Dinâmico
  const { data: dbPilares } = await supabaseAdmin.from('pilares').select('id, nome').order('ordem')
  const { data: cursosComPilares } = await supabaseAdmin
    .from('cursos_pilares')
    .select('curso_id, pilares(nome)')
    .in('curso_id', idsCursosComprados)

  const radarData = (dbPilares || []).map(pilar => {
    const aulasPilar = todasAulas.filter((a: any) => {
        const link = cursosComPilares?.find(cp => cp.curso_id === a.curso_id && (cp.pilares as any)?.nome === pilar.nome)
        return !!link
    })
    const done = aulasPilar.filter(a => idsAulasConcluidas.has(`${a.curso_id}-${a.id}`) || idsAulasConcluidas.has(a.id)).length
    return { 
      subject: pilar.nome, 
      value: aulasPilar.length > 0 ? Math.round((done / aulasPilar.length) * 100) : 5, 
      fullMark: 100 
    }
  })

  const radarDataFinal = radarData.length > 0 ? radarData : [
    { subject: 'Negociação', value: 5, fullMark: 100 },
    { subject: 'IA/Tech', value: 5, fullMark: 100 },
    { subject: 'Liderança', value: 5, fullMark: 100 },
    { subject: 'Performance', value: 5, fullMark: 100 }
  ]

  const pacotesComprados = (assinaturas?.filter(a => a.plano_id).map(a => a.planos) || []).filter(Boolean)
  const allActiveCourses = (cursosBase || []).filter(c => idsCursosComprados.includes(c.id))
  const pilarMaisFraco = [...radarDataFinal].sort((a, b) => a.value - b.value)[0]
  
  let recomendacaoItem: any = null
  let aulaRecomendadaObj: any = null
  let recomendacaoHasActivity = false
  let recomendacaoHasFluxo = false

  const cursosDoPilarFraco = allActiveCourses.filter(c => {
    return cursosComPilares?.find(cp => cp.curso_id === c.id && (cp.pilares as any)?.nome === pilarMaisFraco.subject)
  })

  for (const curso of cursosDoPilarFraco) {
    const stats = getStatsCurso(curso.id)
    if (stats.percent < 100) {
      recomendacaoItem = curso
      aulaRecomendadaObj = todasAulas.find((a: any) => a.id === stats.lastId)
      recomendacaoHasActivity = stats.hasActivity
      recomendacaoHasFluxo = stats.hasFluxo
      break
    }
  }

  if (!recomendacaoItem) {
    for (const curso of allActiveCourses) {
      const stats = getStatsCurso(curso.id)
      if (stats.percent < 100) {
        recomendacaoItem = curso
        aulaRecomendadaObj = todasAulas.find((a: any) => a.id === stats.lastId)
        recomendacaoHasActivity = stats.hasActivity
        recomendacaoHasFluxo = stats.hasFluxo
        break
      }
    }
  }
  const vitrineCursos = cursosBase?.filter(c => !idsCursosComprados.includes(c.id) && !(c as any).is_free) || []

  return (
    <div className="max-w-7xl mx-auto space-y-20 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      
      {/* SEÇÃO 1: HUB DE INTELIGÊNCIA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#040814] rounded-xl p-8 md:p-16 text-white shadow-2xl border border-white/10">
         <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-white/5 blur-[130px] rounded-full" />
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
            <div className="space-y-10 max-w-2xl">
               <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.85] font-display">
                  Foque em <br/><span className="text-secondary uppercase drop-shadow-sm">{pilarMaisFraco.subject}.</span>
               </h1>

               <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                     <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">PHD Coins</p>
                      <p className="text-lg font-black text-white">{gamificacao.phd_coins_total}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary-light/20 border border-primary-light/30 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-light" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Nível</p>
                      <p className="text-lg font-black text-white">{gamificacao.phd_nivel}</p>
                    </div>
                  </div>

                  {gamificacao.streak_dias > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center animate-pulse">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Streak</p>
                        <p className="text-lg font-black text-white">{gamificacao.streak_dias} dias</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>
            <div className="w-full lg:w-[420px] p-10 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-xl shadow-2xl">
               {recomendacaoItem ? (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] font-sans">Próximo Passo Estratégico</p>
                        <div className="flex flex-col gap-1">
                          <h3 className="text-2xl font-black text-white leading-tight font-display">{cleanTitle(recomendacaoItem.titulo, prefixes)}</h3>
                          {aulaRecomendadaObj && (
                            <p className="text-xs font-bold text-secondary italic font-sans">Aula: {cleanTitle(aulaRecomendadaObj.titulo, prefixes)}</p>
                          )}
                        </div>
                    <Link 
                      href={(!recomendacaoHasFluxo && recomendacaoHasActivity && aulaRecomendadaObj) ? `/player/${recomendacaoItem.id}/${aulaRecomendadaObj.id}` : `/player/${recomendacaoItem.id}`} 
                      className="mt-8 w-full flex items-center justify-center gap-4 py-5 bg-secondary text-white rounded-xl font-black text-xs hover:bg-secondary/80 transition-all shadow-lg active:scale-95 uppercase tracking-widest font-sans"
                    > 
                      {aulaRecomendadaObj ? 'Continuar de Onde Parou' : 'Ver Grade do Curso'} <ArrowRight className="w-4 h-4" /> 
                    </Link>
                  </div>
               ) : (
                  <h3 className="text-2xl font-black text-white tracking-tighter">Missão Cumprida! Você dominou todos os pilares.</h3>
               )}
            </div>
         </div>
      </section>

      {/* SEÇÃO 2: MEUS CURSOS / MATERIAIS */}
      <section className="space-y-12">
         <div className="flex items-center justify-between border-l-4 border-primary pl-8"><h2 className="text-base font-black text-text-primary/40 uppercase tracking-[0.3em]">Meus Cursos / Materiais</h2></div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...pacotesComprados.map(p => ({...p, type: 'pacote'})), ...allActiveCourses.map(c => ({...c, type: 'curso'}))].map((item: any) => {
               const stats = item.type === 'curso' ? getStatsCurso(item.id) : { percent: 0, lastId: null }
               const progresso = stats.percent
               let linkDestino = `/catalogo/${item.id}`
               if (item.type === 'curso') {
                 const forceIndex = stats.hasFluxo
                 linkDestino = (stats.hasActivity && !forceIndex) ? `/player/${item.id}/${stats.lastId}` : `/player/${item.id}`
               } else if (item.type === 'pacote') {
                 linkDestino = `/catalogo/pacote/${item.id}`
               }

               return (
                 <Link key={item.id} href={linkDestino} className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500 h-full flex flex-col shadow-sm">
                    <div className="aspect-video relative overflow-hidden bg-white/5">
                       {item.thumb_url && <img src={item.thumb_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.titulo} />}
                       <div className="absolute inset-x-0 bottom-0 p-6 z-20 bg-gradient-to-t from-primary/90 to-transparent">
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3"><div className="h-full bg-secondary-light transition-all duration-1000 shadow-[0_0_10px_rgba(var(--secondary),0.3)]" style={{ width: `${progresso}%` }} /></div>
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">{progresso}% Concluído</span>
                       </div>
                    </div>
                    <div className="p-8"><h3 className="text-xl font-bold font-display text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">{cleanTitle(item.titulo || item.nome, prefixes)}</h3></div>
                 </Link>
               )
            })}
         </div>
      </section>

      {/* SEÇÃO 3: RECOMENDADO PARA VOCÊ */}
      <section className="space-y-12">
         <div className="flex items-center justify-between border-l-4 border-secondary pl-8"><h2 className="text-base font-black text-text-primary/40 uppercase tracking-[0.3em]">Recomendado para Você</h2></div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/catalogo" className="relative group overflow-hidden rounded-xl bg-primary border border-white/5 p-10 shadow-xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full" />
               <div className="relative z-10 space-y-6"><div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Target className="w-7 h-7 text-primary-light" /></div><h3 className="text-2xl font-black text-white">Explorar Todos os Pilares</h3></div>
            </Link>
            {vitrineCursos.slice(0, 2).map((item: any) => (
               <Link key={item.id} href={`/loja/curso/${item.id}`} className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500 h-full flex flex-col shadow-sm">
                  <div className="aspect-video relative overflow-hidden bg-white/5">{item.thumb_url && <img src={item.thumb_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.titulo} />}</div>
                  <div className="p-8"><h4 className="font-extrabold text-lg text-text-primary leading-tight line-clamp-2 group-hover:text-primary transition-colors">{cleanTitle(item.titulo, prefixes)}</h4></div>
               </Link>
            ))}
         </div>
      </section>

      {/* SEÇÃO 4: MEUS RESULTADOS */}
      <section className="space-y-12">
         <div className="flex items-center justify-between border-l-4 border-indigo-500 pl-8">
            <h2 className="text-base font-black text-text-primary/40 dark:text-text-primary/60 uppercase tracking-[0.3em]">Meus Resultados</h2>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <RadarChart data={radarDataFinal} />
            <div className="bg-indigo-500/5 dark:bg-indigo-50/50 rounded-xl p-8 flex flex-col justify-center border border-indigo-500/10 dark:border-indigo-200 shadow-sm">
               <h3 className="text-2xl font-black text-text-primary dark:text-indigo-950 uppercase tracking-tighter italic mb-4">Radar de Competências</h3>
               <p className="text-sm text-text-muted dark:text-indigo-900/60 leading-relaxed font-medium">
                  Esta visualização representa sua evolução técnica e comportamental nos pilares fundamentais da plataforma. Continue completando as aulas para expandir sua área de domínio.
               </p>
            </div>
         </div>
      </section>

      {/* SEÇÃO 5: MEU PDI */}
      <section className="space-y-12">
         <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-8">
            <h2 className="text-base font-black text-text-primary/40 dark:text-text-primary/60 uppercase tracking-[0.3em]">Meu PDI</h2>
         </div>
         <div className="max-w-4xl">
            <PDIWidget metas={metas as any} />
         </div>
      </section>

      {/* SEÇÃO 6: CONQUISTAS RECENTES */}
      <section className="space-y-12">
         <div className="flex items-center justify-between border-l-4 border-amber-500 pl-8">
            <h2 className="text-base font-black text-text-primary/40 dark:text-text-primary/60 uppercase tracking-[0.3em]">Conquistas Recentes</h2>
         </div>
         <BadgesGroup badges={badges} />
      </section>

      {/* SEÇÃO 7: CONSISTÊNCIA DE ACESSO */}
      <section className="space-y-12">
         <div className="flex items-center justify-between border-l-4 border-slate-500 pl-8">
            <h2 className="text-base font-black text-text-primary/40 dark:text-text-primary/60 uppercase tracking-[0.3em]">Consistência de Acesso</h2>
         </div>
         <div className="max-w-5xl">
            <StudyHeatmap activityData={processedActivityData} />
         </div>
      </section>
    </div>
  )
}
