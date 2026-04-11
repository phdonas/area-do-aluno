import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, CheckCircle2, ArrowLeft, 
  ArrowRight, Star, Video, Paperclip, Send, Lock, Clock 
} from 'lucide-react'
import { toggleAulaConcluida } from '../../actions'
import { formatDuration, cleanTitle } from '@/lib/formatter'
import { VideoPlayer } from '@/components/video-player'
import { SidebarPlayer } from '@/components/sidebar-player'
import { PlayerLayout } from '@/components/player-layout'
import { getPrefixosLimpeza } from '@/lib/prefixes'
import { InsightEditor } from '@/components/insight-editor'
import { SpacedRepetitionTrigger } from '@/components/spaced-repetition-trigger'
import { LessonComments } from "@/components/lesson-comments"

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

  // Verificação de Acesso (Matrícula ou Plano Global)
  let hasAccess = !!isAdmin;
  let dataMatricula: Date | null = null;
  let isLockedByDripping = false;

  if (user) {
     const { data: assinaturasAtivas } = await supabaseAdmin
       .from('assinaturas')
       .select('*, planos!left(is_global)')
       .eq('usuario_id', user.id)
       .eq('status', 'ativa')

     const matriculaRelacionada = assinaturasAtivas?.find((a: any) => a.curso_id === cursoId || a.planos?.is_global === true);
     
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
    redirect(`/catalogo/${cursoId}?bloqueado=true`)
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

  const { data: curso } = await supabaseAdmin.from('cursos').select('*').eq('id', cursoId).single()
  const { data: progresso } = await supabaseAdmin.from('progresso_aulas').select('aula_id, concluida').eq('usuario_id', user.id).eq('curso_id', cursoId)
  const aulasConcluidasIds = new Set(progresso?.filter((p: any) => p.concluida).map((p: any) => p.aula_id) || [])
  const isAulaConcluida = aulasConcluidasIds.has(aulaId)

  const { data: modulosData } = await supabaseAdmin.rpc('get_modulos_curso', { p_curso_id: cursoId })
  const modulosIds = modulosData?.map((m: any) => m.id) || []
  
  const { data: aulasDiretas } = await supabaseAdmin.from('aulas').select('*').in('modulo_id', modulosIds)
  const { data: pivotAulas } = await supabaseAdmin.from('modulos_aulas').select('modulo_id, ordem, aulas(*)').in('modulo_id', modulosIds)

  const modulos = (modulosData || []).map((m: any) => {
    const d = (aulasDiretas || []).filter((a: any) => a.modulo_id === m.id)
    const p = (pivotAulas || []).filter((pa: any) => pa.modulo_id === m.id).map((pa: any) => ({ ...pa.aulas, ordem: pa.ordem }))
    return { ...m, aulas: [...d, ...p].sort((a: any, b: any) => a.ordem - b.ordem) }
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

  const renderSidebar = (
    <SidebarPlayer 
      curso={curso}
      modulos={modulos}
      aulaId={aulaId}
      cursoId={cursoId}
      aulasConcluidasIds={Array.from(aulasConcluidasIds)}
      porcentagem={porcentagem}
      prefixes={prefixes}
    />
  )

  return (
    <PlayerLayout 
      sidebar={renderSidebar} 
      cursoId={cursoId} 
      aulaTitulo={aula.titulo}
      prefixes={prefixes}
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
            <div className="rounded-[24px] md:rounded-[48px] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] bg-black border border-white/5 ring-1 ring-white/10">
               <VideoPlayer url={aula.video_url} />
            </div>
         )}

         <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 bg-surface/40 backdrop-blur-sm border border-border-custom p-6 md:p-8 rounded-[32px] md:rounded-[40px]">
            <form action={async () => { 'use server'; await toggleAulaConcluida(aulaId, !isAulaConcluida, cursoId) }}>
               <button className={`w-full md:w-auto flex items-center justify-center gap-4 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${isAulaConcluida ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/25' : 'bg-background border border-border-custom text-text-primary hover:border-primary/50'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${isAulaConcluida ? 'text-white' : 'text-emerald-500'}`} />
                  {isAulaConcluida ? 'Aula Finalizada' : 'Concluir esta Aula'}
               </button>
            </form>
            <div className="flex items-center gap-4 w-full md:w-auto justify-center">
               {aulaAnterior && (
                  <Link href={`/player/${cursoId}/${aulaAnterior.id}`} className="group flex items-center gap-3 p-5 bg-background border border-border-custom rounded-2xl hover:border-text-primary transition-all text-text-primary font-black text-[10px] uppercase tracking-widest leading-none">
                     <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </Link>
               )}
               {proximaAula && (
                  <Link href={`/player/${cursoId}/${proximaAula.id}`} className="flex-1 md:flex-none group flex items-center justify-center gap-4 px-10 py-5 bg-text-primary text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] shadow-xl shadow-black/10 transition-all leading-none focus:ring-4 focus:ring-primary/20">
                     Próxima Aula <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
               )}
            </div>
         </div>

         <div className="space-y-12 md:space-y-20">
            {/* 1. RESUMO DA AULA */}
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <h3 className="font-extrabold text-[11px] uppercase tracking-[0.3em] text-text-muted">Resumo da Aula</h3>
               </div>
               {aula.descricao ? (
                 <div className="bg-surface/30 border border-border-custom p-8 md:p-12 rounded-[40px] text-text-secondary font-medium leading-relaxed shadow-sm prose prose-invert max-w-none text-base md:text-lg">
                    {aula.descricao}
                 </div>
               ) : (
                 <div className="bg-surface/20 border border-dashed border-border-custom/50 p-12 rounded-[40px] flex flex-col items-center justify-center gap-3 text-center opacity-50 grayscale">
                    <FileText className="w-10 h-10 text-text-muted opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Esta aula não possui texto adicional</span>
                 </div>
               )}
            </div>

            {/* 2. ÁREA DE DOWNLOAD (ESTILO WORKSHOP) */}
            <div className="space-y-8">
                <div className="bg-surface/60 backdrop-blur-sm border border-border-custom rounded-[48px] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <div className="w-16 h-16 shrink-0 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-2xl shadow-inner border border-amber-500/20">
                            <Paperclip className="w-8 h-8" />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Materiais de Apoio</h4>
                                <p className="text-sm text-text-muted">Baixe os recursos complementares para potencializar sua execução.</p>
                            </div>
                            {materiais && materiais.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {materiais.map((mat: any) => (
                                        <a key={mat.id} href={mat.arquivo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-background/50 border border-border-custom hover:border-amber-500/40 transition-all p-5 rounded-2xl group">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-text-primary line-clamp-1">{mat.titulo}</span>
                                                <span className="text-[9px] text-text-muted uppercase font-bold tracking-widest">{mat.tipo || 'PDF'}</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 bg-background/30 border border-dashed border-border-custom/50 rounded-3xl text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-50">Nenhum material anexado a esta aula</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. QUIZ PRÁTICO */}
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                  <h3 className="font-extrabold text-[11px] uppercase tracking-[0.3em] text-text-muted">Quiz Prático</h3>
               </div>
               {questionario ? (
                  <Link href={`/questionarios/${questionario.id}`} className="flex items-center gap-6 bg-primary/5 border border-primary/20 hover:border-primary transition-all p-7 rounded-[40px] group overflow-hidden relative shadow-lg shadow-primary/5">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-1/2 translate-x-1/2 blur-2xl rounded-full" />
                     <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative z-10 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-7 h-7" />
                     </div>
                     <div className="flex flex-col relative z-10">
                        <span className="text-base font-black text-text-primary group-hover:text-primary transition-colors">{questionario.titulo}</span>
                        <span className="text-[10px] text-primary uppercase font-bold tracking-[0.2em] leading-none mt-1.5 flex items-center gap-2">
                          Começar Teste <ArrowRight className="w-3 h-3" />
                        </span>
                     </div>
                  </Link>
               ) : (
                  <div className="bg-surface/10 border border-dashed border-border-custom/40 p-8 rounded-[40px] flex items-center gap-5 text-text-muted opacity-40 grayscale">
                     <CheckCircle2 className="w-8 h-8 opacity-20" />
                     <span className="text-[10px] font-black uppercase tracking-widest leading-snug">Avaliação de <br/>conhecimento disponível em breve</span>
                  </div>
               )}
            </div>

            {/* 4. FERRAMENTAS ADICIONAIS */}
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <h3 className="font-extrabold text-[11px] uppercase tracking-[0.3em] text-text-muted">Ferramentas Adicionais</h3>
               </div>
               {recurso ? (
                   <a 
                     href={recurso.arquivo_url || `/simuladores/${recurso.id}`} 
                     target={recurso.arquivo_url ? "_blank" : "_self"}
                     rel={recurso.arquivo_url ? "noopener noreferrer" : ""}
                     className="flex items-center gap-6 bg-indigo-500/5 border border-indigo-500/20 hover:border-indigo-500 transition-all p-7 rounded-[40px] group overflow-hidden relative shadow-lg shadow-indigo-500/5"
                   >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 -translate-y-1/2 translate-x-1/2 blur-2xl rounded-full" />
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 relative z-10 group-hover:scale-110 transition-transform">
                         <Star className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col relative z-10">
                         <span className="text-base font-black text-text-primary group-hover:text-indigo-500 transition-colors">{recurso.titulo}</span>
                         <span className="text-[10px] text-indigo-500 uppercase font-bold tracking-[0.2em] leading-none mt-1.5 flex items-center gap-2">
                           {recurso.arquivo_url ? 'Baixar Recurso' : 'Abrir Toolkit'} <ArrowRight className="w-3 h-3" />
                         </span>
                      </div>
                   </a>
               ) : (
                  <div className="bg-surface/10 border border-dashed border-border-custom/40 p-8 rounded-[40px] flex items-center gap-5 text-text-muted opacity-40 grayscale">
                     <Star className="w-8 h-8 opacity-20" />
                     <span className="text-[10px] font-black uppercase tracking-widest leading-snug">Toolkit Complementar <br/>não disponível</span>
                  </div>
               )}
            </div>

            {/* 5. WORKSHOP DE INSIGHTS */}
            <div className="space-y-6">
               <InsightEditor 
                 usuarioId={user.id}
                 aulaId={aulaId}
                 cursoId={cursoId}
                 initialValue={insight?.conteudo || ''}
               />
            </div>

            {/* 6. BLINDAGEM DE CONHECIMENTO */}
            <div className="space-y-6 pt-10 border-t border-dashed border-border-custom/50">
               <SpacedRepetitionTrigger 
                 usuarioId={user.id}
                 aulaId={aulaId}
               />
            </div>

            {/* 7. SUPORTE / INTERAÇÃO */}
            <div className="space-y-8 pt-12 border-t border-border-custom/50 border-dashed pb-32">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                     <h3 className="font-extrabold text-[11px] uppercase tracking-[0.3em] text-text-muted">Suporte & Interação</h3>
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
         </div>
      </div>
    </PlayerLayout>
  )
}
