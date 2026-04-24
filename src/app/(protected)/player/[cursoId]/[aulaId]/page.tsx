import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, CheckCircle2, ArrowLeft, FileCode,
  ArrowRight, Star, Video, Paperclip, Send, Lock, Clock 
} from 'lucide-react'
import { formatDuration, cleanTitle } from '@/lib/formatter'
import { VideoPlayer } from '@/components/video-player'
import { SidebarPlayer } from '@/components/sidebar-player'
import { PlayerLayout } from '@/components/player-layout'
import { getPrefixosLimpeza } from '@/lib/prefixes'
import { InsightEditor } from '@/components/insight-editor'
import { SpacedRepetitionTrigger } from '@/components/spaced-repetition-trigger'
import { LessonComments } from "@/components/lesson-comments"
import { CompleteLessonButton } from '@/components/player/CompleteLessonButton'
import { CourseFlowTemplate } from '@/components/courses/CourseFlowTemplate'
import { InteractiveCTA } from '@/components/player/InteractiveCTA'
import '@/styles/course-flow.css'

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ cursoId: string; aulaId: string }>
}) {
  const { cursoId, aulaId } = await params
  const supabaseAuth = await createClient()
  const supabaseAdmin = createAdminClient()
  const prefixes = await getPrefixosLimpeza()

  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdmin } = await supabaseAuth.rpc('is_admin')

  const { data: aula, error: aulaError } = await supabaseAdmin
    .from('aulas')
    .select('*')
    .eq('id', aulaId)
    .single()

  if (aulaError || !aula) {
    console.error("Erro ao buscar aula:", aulaError)
    notFound()
  }

  // 1. Identifica o curso real (Suporta UUID ou Slug)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursoId)
  const cQuery = supabaseAdmin.from('cursos').select('*')
  if (isUUID) {
    cQuery.or(`id.eq.${cursoId},slug.eq.${cursoId}`)
  } else {
    cQuery.eq('slug', cursoId)
  }
  const { data: curso } = await cQuery.single()

  if (!curso) {
    notFound()
  }

  // Verificação de Acesso (Matrícula ou Plano Global)
  let hasAccess = !!isAdmin;
  let dataMatricula: Date | null = null;
  let isLockedByDripping = false;

  if (user) {
     const { data: assinaturasAtivas } = await supabaseAdmin
       .from('assinaturas')
       .select('*, planos!left(is_global)')
       .eq('usuario_id', user.id)
       .in('status', ['ativa', 'ativo', 'Ativa', 'Ativo'])

     const matriculaRelacionada = assinaturasAtivas?.find((a: any) => a.curso_id === curso.id || a.planos?.is_global === true);
     
     if (matriculaRelacionada) {
        hasAccess = true;
        dataMatricula = new Date(matriculaRelacionada.created_at);
     }
  }

  // Lógica de Dripping
  if (hasAccess && !isAdmin && dataMatricula && (aula.liberacao_dias || 0) > 0) {
     const hoje = new Date();
     const dataLiberacao = new Date(dataMatricula.getTime() + (aula.liberacao_dias * 24 * 60 * 60 * 1000));
     if (hoje < dataLiberacao) {
        isLockedByDripping = true;
     }
  }

  if (!hasAccess && !aula.is_gratis) {
    redirect(`/catalogo/${curso.slug || curso.id}?bloqueado=true`)
  }

  const [
    { data: materiais },
    { data: questionario },
    { data: recurso },
    { data: insight }
  ] = await Promise.all([
    supabaseAdmin.from('materiais_anexos').select('*').eq('aula_id', aulaId).order('titulo'),
    aula.questionario_id 
      ? supabaseAdmin.from('questionarios').select('id, titulo').eq('id', aula.questionario_id).single()
      : Promise.resolve({ data: null }),
    aula.recurso_id
      ? supabaseAdmin.from('recursos').select('id, titulo, arquivo_url, tipo').eq('id', aula.recurso_id).single()
      : Promise.resolve({ data: null }),
    supabaseAdmin.from('insights').select('conteudo').eq('usuario_id', user.id).eq('aula_id', aulaId).maybeSingle()
  ])

  const { data: progresso } = await supabaseAdmin.from('progresso_aulas').select('aula_id, concluida, posicao_s').eq('usuario_id', user.id).eq('curso_id', curso.id)
  const currentProgresso = progresso?.find((p: any) => p.aula_id === aulaId)
  const initialPosition = currentProgresso?.posicao_s || 0
  
  const aulasConcluidasIds = new Set(progresso?.filter((p: any) => p.concluida).map((p: any) => p.aula_id) || [])
  const isAulaConcluida = aulasConcluidasIds.has(aulaId)

  // 7. Deduplicar módulos e aulas (Lógica N:N compatível com Clone/Biblioteca)
  const { data: modulosData } = await supabaseAdmin.rpc('get_modulos_curso', { p_curso_id: curso.id })
  const uniqueModulosData = Array.from(new Map((modulosData || []).map((m: any) => [m.id, m])).values())
  const modulosIds = uniqueModulosData.map((m: any) => m.id)
  
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

  const todasAulas = modulos.flatMap((m: any) => m.aulas)
  const currentAulaIndex = todasAulas.findIndex((a: any) => a.id === aulaId)
  const proximaAula = todasAulas[currentAulaIndex + 1]
  const aulaAnterior = todasAulas[currentAulaIndex - 1]
  const porcentagem = todasAulas.length > 0 ? Math.round((aulasConcluidasIds.size / todasAulas.length) * 100) : 0

  const dataLiberacaoDate = dataMatricula && aula.liberacao_dias
    ? new Date(dataMatricula.getTime() + (aula.liberacao_dias * 24 * 60 * 60 * 1000))
    : null;
  const dataLiberacaoString = dataLiberacaoDate?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const hasVideo = !!aula.video_url && aula.video_url.trim() !== '';

  const primaryCTA = aula.tipo_conteudo === 'questionario' && questionario
    ? { url: `/questionarios/${questionario.id}`, titulo: questionario.titulo, tipo: 'questionario' as const }
    : recurso 
      ? { url: `/simuladores/${recurso.id}`, titulo: aula.titulo, tipo: 'ferramenta' as const }
      : (materiais && materiais.length > 0 && materiais.find((m: any) => m.tipo === 'link'))
        ? { 
            url: `/simuladores/external?url=${encodeURIComponent(materiais.find((m: any) => m.tipo === 'link').arquivo_url)}&titulo=${encodeURIComponent(aula.titulo)}&tipo=${encodeURIComponent('Ferramenta de Apoio')}`, 
            titulo: aula.titulo, 
            tipo: 'ferramenta' as const 
          }
        : null;

  // Se for uma aula de fluxo/ferramentas (página resumo), usar o template premium
  const isFlowLanding = aula.tipo_conteudo === 'ferramenta' && (aula.slug?.includes('fluxo') || aula.slug?.includes('ferramentas'));

  const SUPER_ADMINS = ['admin@phdonassolo.com', 'ph@phdonassolo.com']
  const isSuperAdmin = user?.email && SUPER_ADMINS.includes(user.email.toLowerCase())
  const isActualAdmin = isSuperAdmin || !!isAdmin

  const renderSidebar = (
    <SidebarPlayer 
      curso={curso}
      modulos={modulos}
      aulaId={aulaId}
      activeModuloId={aula.modulo_id}
      cursoId={curso.id}
      aulasConcluidasIds={Array.from(aulasConcluidasIds)}
      porcentagem={porcentagem}
      prefixes={prefixes}
      isFlowMode={isFlowLanding}
      isAdmin={isActualAdmin}
    />
  )

  if (isFlowLanding) {
    return (
      <PlayerLayout 
        sidebar={renderSidebar} 
        cursoId={curso.id} 
        aulaTitulo={aula.titulo}
        prefixes={prefixes}
        isFlowMode={true}
      >
        <CourseFlowTemplate 
           titulo={aula.titulo}
           subtitulo={aula.descricao || "Explore as ferramentas e simuladores deste módulo para consolidar seu aprendizado."}
           meta={{
             ferramentas: `${todasAulas.filter(a => a.tipo_conteudo === 'ferramenta').length} instrumentos`,
             fases: "Ciclo M&C",
             perfis: "Liderança EXPOgroup",
             versao: "v6.0"
           }}
           introTitle="Aplicações Práticas"
           introText="As ferramentas abaixo foram desenhadas para transformar a teoria em comportamento real de gestão. Cada uma possui um objetivo específico dentro do fluxo de desenvolvimento."
           tools={todasAulas.filter(a => a.tipo_conteudo === 'ferramenta').map((a, idx) => ({
             id: a.id,
             num: idx + 1,
             phase: a.modulo_id ? (idx < 5 ? 1 : idx < 8 ? 2 : 3) : 'x',
             tag: `Ferramenta ${idx + 1}`,
             title: a.titulo,
             description: a.descricao || "Sem descrição disponível.",
             result: "Aceleração de performance e clareza diagnóstica.",
             status: 'ok',
             actionUrl: `/player/${curso.slug || curso.id}/${a.id}`, // Link para a página da aula (hub)
             downloadUrl: undefined
           }))}
           completedToolsIds={Array.from(aulasConcluidasIds)}
        />
      </PlayerLayout>
    )
  }

  return (
    <PlayerLayout 
      sidebar={renderSidebar} 
      cursoId={curso.id} 
      aulaTitulo={aula.titulo}
      prefixes={prefixes}
      isFlowMode={isFlowLanding}
    >
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 lg:p-12 space-y-12 lg:space-y-20">
         
          {isLockedByDripping ? (
            <div className="aspect-video bg-[#0A0F1E] rounded-[32px] md:rounded-[48px] flex flex-col items-center justify-center text-center p-8 md:p-12 border border-white/5 relative overflow-hidden shadow-2xl">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
               <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/10 mb-6 md:mb-8 relative z-10">
                  <Lock className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
               </div>
               <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-4 relative z-10">Acesso em Preparação</h3>
               <p className="text-sm md:text-base text-white/60 font-medium max-w-md relative z-10 leading-relaxed">
                  Esta jornada de evolução está quase lá. Sua imersão será liberada em: <br/>
                  <strong className="text-primary-light font-black text-xl md:text-2xl mt-2 block">{dataLiberacaoString}</strong>
               </p>
               <div className="mt-8 md:mt-10 flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full relative z-10">
                  <Clock className="w-4 h-4 text-primary-light" />
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/50">Faltam {aula.liberacao_dias} dias de jornada</span>
               </div>
            </div>
          ) : (
            <>
              {hasVideo ? (
                <div className="rounded-[24px] md:rounded-[48px] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] bg-black border border-white/5 ring-1 ring-white/10">
                  <VideoPlayer 
                      url={aula.video_url} 
                      aulaId={aulaId}
                      cursoId={curso.id}
                      userId={user.id}
                      initialPosition={initialPosition}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-[#0A0F1E] rounded-[32px] md:rounded-[48px] flex flex-col items-center justify-center text-center p-8 md:p-12 border border-white/5 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
                   <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/10 mb-6 md:mb-8 relative z-10">
                      <FileCode className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
                   </div>
                   <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-4 relative z-10 italic uppercase">
                     {primaryCTA ? "Pronto para Executar" : "Não há vídeo disponível para esta aula"}
                   </h3>
                   <p className="text-sm md:text-base text-white/60 font-medium max-w-md relative z-10 leading-relaxed px-4">
                      {primaryCTA 
                        ? (primaryCTA.tipo === 'questionario' ? "Esta aula contém uma avaliação de conhecimento." : "Esta aula é um recurso interativo. Utilize o botão abaixo para abrir o simulador em uma nova aba.")
                        : "Consulte os materiais anexos ou o fluxo do curso para mais informações sobre este conteúdo."}
                   </p>
                </div>
              )}
              
              {primaryCTA && (
                <InteractiveCTA 
                  url={primaryCTA.url} 
                  titulo={primaryCTA.titulo} 
                  tipo={primaryCTA.tipo} 
                  aulaId={aulaId}
                  cursoId={curso.id}
                />
              )}
            </>
          )}

         <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 bg-surface/40 backdrop-blur-sm border border-border-custom p-6 md:p-8 rounded-[32px] md:rounded-[40px]">
            {aula.tipo_conteudo !== 'ferramenta' && (
              <CompleteLessonButton 
                aulaId={aulaId} 
                isConcluida={isAulaConcluida} 
                cursoId={curso.id} 
              />
            )}
            <div className={`flex items-center gap-4 w-full md:w-auto ${aula.tipo_conteudo === 'ferramenta' ? 'md:ml-auto' : ''} justify-center`}>
               {aulaAnterior && (
                  <Link href={`/player/${curso.slug || curso.id}/${aulaAnterior.id}`} className="group flex items-center gap-3 p-5 bg-background border border-border-custom rounded-2xl hover:border-text-primary transition-all text-text-primary font-black text-[10px] uppercase tracking-widest leading-none">
                     <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </Link>
               )}
               {proximaAula && (
                  <Link href={`/player/${curso.slug || curso.id}/${proximaAula.id}`} className="flex-1 md:flex-none group flex items-center justify-center gap-4 px-10 py-5 bg-white dark:bg-white text-slate-950 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-white/90 hover:scale-[1.02] shadow-xl shadow-black/20 transition-all leading-none focus:ring-4 focus:ring-white/20 border border-white/10">
                     Próxima Aula <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
               )}
            </div>
         </div>

         <div className="space-y-12 md:space-y-20">
            {/* 1. ÁREA DE DOWNLOAD (MATERIAIS DE APOIO) */}
            <div className="space-y-8">
                <div className="bg-amber-500/10 dark:bg-amber-50/90 backdrop-blur-sm border border-amber-500/20 dark:border-amber-200 rounded-[48px] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-100/50 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <div className="w-16 h-16 shrink-0 rounded-3xl bg-white/40 dark:bg-amber-200/50 flex items-center justify-center text-amber-600 dark:text-amber-900 font-black text-2xl shadow-sm border border-amber-500/20">
                            <Paperclip className="w-8 h-8" />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-text-primary dark:text-amber-950 uppercase tracking-tight italic">Materiais de Apoio</h4>
                                <p className="text-sm text-text-muted dark:text-amber-950 font-bold">Baixe os recursos complementares para potencializar sua execução.</p>
                            </div>
                            {materiais && materiais.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {materiais.map((mat: any) => {
                                        const isHtml = mat.arquivo_url?.toLowerCase().endsWith('.html') || mat.tipo === 'link';
                                        const finalUrl = isHtml 
                                          ? `/simuladores/external?url=${encodeURIComponent(mat.arquivo_url)}&titulo=${encodeURIComponent(mat.titulo)}&tipo=${encodeURIComponent('Recurso de Apoio')}`
                                          : mat.arquivo_url;

                                        return (
                                          <a 
                                            key={mat.id} 
                                            href={finalUrl} 
                                            target={isHtml ? "_self" : "_blank"} 
                                            rel={isHtml ? "" : "noopener noreferrer"} 
                                            className="flex items-center gap-4 bg-white/60 dark:bg-white/10 border border-amber-500/10 dark:border-amber-200/20 hover:border-amber-500/40 transition-all p-5 rounded-2xl group shadow-sm"
                                          >
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-text-primary dark:text-amber-950 line-clamp-1">{mat.titulo}</span>
                                                <span className="text-[9px] text-text-muted dark:text-amber-900 uppercase font-black tracking-widest">{mat.tipo || 'PDF'}</span>
                                            </div>
                                          </a>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-10 bg-black/5 dark:bg-white/5 border-2 border-dashed border-amber-500/20 dark:border-amber-200/10 rounded-[32px] text-center flex flex-col items-center justify-center gap-3 mt-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-500/5 flex items-center justify-center">
                                       <FileText className="w-6 h-6 text-amber-500/30" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted dark:text-amber-200/40 opacity-80">Nenhum material anexado a esta aula</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* 2. RESUMO DA AULA */}
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <h3 className="font-extrabold text-[11px] uppercase tracking-[0.3em] text-text-primary dark:text-text-primary">Resumo da Aula</h3>
               </div>
               {aula.descricao ? (
                  <div className="bg-emerald-500/10 dark:bg-emerald-50/90 border border-emerald-500/20 dark:border-emerald-200 p-8 md:p-12 rounded-[40px] text-text-secondary dark:text-emerald-950 font-medium leading-relaxed shadow-xl max-w-none text-base md:text-lg">
                     {aula.descricao}
                  </div>
               ) : (
                  <div className="bg-emerald-500/5 dark:bg-white/5 border-2 border-dashed border-emerald-500/20 dark:border-emerald-200/10 p-12 rounded-[40px] flex flex-col items-center justify-center gap-4 text-center">
                     <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-emerald-600/40" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-200/40">Esta aula não possui texto adicional</span>
                  </div>
               )}
            </div>

            {/* 3. QUIZ PRÁTICO (QUIZZ) */}
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <h3 className="font-extrabold text-[11px] uppercase tracking-[0.3em] text-text-primary">Quizz</h3>
               </div>
               {questionario ? (
                  <Link href={`/questionarios/${questionario.id}`} className="flex items-center gap-6 bg-white/5 dark:bg-blue-50/90 border border-primary/20 dark:border-blue-200 hover:border-primary transition-all p-7 rounded-[40px] group overflow-hidden relative shadow-2xl shadow-primary/20">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 dark:bg-blue-100/50 -translate-y-1/2 translate-x-1/2 blur-2xl rounded-full" />
                     <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative z-10 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-7 h-7" />
                     </div>
                     <div className="flex flex-col relative z-10">
                        <span className="text-base font-black text-white dark:text-primary-dark group-hover:text-primary-light dark:group-hover:text-primary transition-colors">{questionario.titulo}</span>
                        <span className="text-[10px] text-primary-light dark:text-primary-dark uppercase font-bold tracking-[0.2em] mt-1.5 flex items-center gap-2">
                          Começar Teste <ArrowRight className="w-3 h-3" />
                        </span>
                     </div>
                  </Link>
               ) : (
                  <div className="bg-primary/5 border border-dashed border-primary/20 p-8 rounded-[40px] flex items-center gap-5 text-primary/80">
                     <CheckCircle2 className="w-8 h-8 opacity-80" />
                     <span className="text-[10px] font-black uppercase tracking-widest leading-snug">Avaliação de conhecimento <br/>disponível em breve</span>
                  </div>
               )}
            </div>

            {/* 4. FERRAMENTAS ADICIONAIS */}
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <h3 className="font-extrabold text-[11px] uppercase tracking-[0.3em] text-text-primary">Ferramentas Adicionais</h3>
               </div>
               {recurso ? (
                   <a 
                     href={`/simuladores/${recurso.id}`} 
                     className="flex items-center gap-6 bg-white/5 dark:bg-indigo-50/90 border border-indigo-500/20 dark:border-indigo-200 hover:border-indigo-500 transition-all p-7 rounded-[40px] group overflow-hidden relative shadow-2xl shadow-indigo-500/20"
                   >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-100/50 -translate-y-1/2 translate-x-1/2 blur-2xl rounded-full" />
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 relative z-10 group-hover:scale-110 transition-transform">
                         <Star className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col relative z-10">
                         <span className="text-base font-black text-white dark:text-indigo-950 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors">{recurso.titulo}</span>
                         <span className="text-[10px] text-indigo-400 dark:text-indigo-900 uppercase font-bold tracking-[0.2em] leading-none mt-1.5 flex items-center gap-2">
                           {recurso.arquivo_url ? 'Baixar Recurso' : 'Abrir Toolkit'} <ArrowRight className="w-3 h-3" />
                         </span>
                      </div>
                   </a>
               ) : (
                  <div className="bg-indigo-500/5 border border-dashed border-indigo-500/20 p-8 rounded-[40px] flex items-center gap-5 text-indigo-600/80">
                     <Star className="w-8 h-8 opacity-80" />
                     <span className="text-[10px] font-black uppercase tracking-widest leading-snug">Toolkit Complementar <br/>não disponível</span>
                  </div>
               )}
            </div>

            {/* 5. ANOTAÇÕES E INSIGHTS DA AULA */}
            <div className="space-y-6">
               <InsightEditor 
                 usuarioId={user.id}
                 aulaId={aulaId}
                 cursoId={curso.id}
                 initialValue={insight?.conteudo || ''}
               />
            </div>

            {/* 6. SUPORTE E INTERAÇÃO */}
            <div className="space-y-8 pt-12 border-t border-border-custom/50 border-dashed">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                     <h3 className="font-extrabold text-[11px] uppercase tracking-[0.3em] text-text-primary">Suporte e Interação</h3>
                  </div>
                  <div className="flex -space-x-2">
                     {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-surface border-2 border-background flex items-center justify-center overflow-hidden">
                           <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">A</div>
                        </div>
                     ))}
                     <div className="w-8 h-8 rounded-full bg-surface border-2 border-background flex items-center justify-center text-[10px] font-black text-text-muted">+12</div>
                  </div>
               </div>
                <LessonComments aulaId={aulaId} usuario={user} />
             </div>

            {/* 7. BLINDAGEM DE CONHECIMENTO (30% WIDTH) */}
            <div className="flex justify-center pt-10 border-t border-dashed border-border-custom/50 pb-32">
               <div className="w-full md:w-[35%]">
                 <SpacedRepetitionTrigger 
                   usuarioId={user.id}
                   aulaId={aulaId}
                 />
               </div>
            </div>
         </div>
      </div>
    </PlayerLayout>
  )
}
