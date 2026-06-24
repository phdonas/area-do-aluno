import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ShieldCheck, 
  LayoutTemplate, 
  Video, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Target, 
  Users, 
  CreditCard,
  ListChecks,
  AlertCircle,
  Award,
  ChevronDown,
  ExternalLink,
  Zap,
  TrendingUp,
  PlayCircle
} from 'lucide-react'
import { PriceCard } from './PriceCard'
import { VideoPlayer } from '@/components/video-player'
import * as motion from 'framer-motion/client'
import { FormattedText, ExpandableContent, SoftCard } from '@/components/CourseContent'
import { getCursoLayout } from '../../../admin/cursos/actions'

function FAQAccordion({ faq }: { faq: any | null }) {
  if (!faq || !Array.isArray(faq)) return null;

  return (
    <div className="space-y-4 w-full">
      {faq.map((item: any, idx: number) => (
        <details key={idx} open className="group bg-white border border-border-custom rounded-3xl overflow-hidden [&_summary::-webkit-details-marker]:hidden shadow-sm">
          <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-emerald-50 transition-all outline-none">
            <h4 className="text-base font-bold text-[#022C22] leading-tight break-words pr-4">
              {item.pergunta}
            </h4>
            <div className="p-2 shrink-0 transition-transform duration-300 group-open:-rotate-180 bg-[#F8FAFC] rounded-full border border-border-custom">
              <ChevronDown className="w-4 h-4 text-[#10B981]" />
            </div>
          </summary>
          <div className="p-6 pt-0 text-sm text-[#475569] leading-relaxed font-medium break-words">
             <FormattedText text={item.resposta} />
          </div>
        </details>
      ))}
    </div>
  )
}

function DepoimentosCarousel() {
  const depoimentos = [
    { nome: "Ana Paula M.", cargo: "Consultora Imobiliária", texto: "Aumentei minhas conversões em 40% no primeiro mês aplicando as técnicas de prospecção do professor. Incrível!" },
    { nome: "Roberto A.", cargo: "Corretor Autônomo", texto: "Material direto ao ponto. Sem enrolação e focado na prática diária do corretor." },
    { nome: "Mariana S.", cargo: "Gerente Comercial", texto: "Trouxe toda minha equipe para fazer a certificação. O resultado nas vendas de alto padrão foi imediato." }
  ];

  return (
    <div className="space-y-6 w-full overflow-hidden">
      <h3 className="text-2xl font-bold text-[#022C22]">O que dizem os alunos</h3>
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
        {depoimentos.map((d, i) => (
          <div key={i} className="min-w-[280px] w-[280px] snap-center bg-white p-6 rounded-[16px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between shrink-0">
            <p className="text-sm text-slate-600 italic mb-6 break-words">"{d.texto}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                {d.nome.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#022C22] truncate">{d.nome}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold truncate">{d.cargo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function SalesPagePH({
  params,
}: {
  params: Promise<{ cursoId: string }>
}) {
  const { cursoId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursoId)
  const query = supabase.from('cursos').select('*, planos_cursos(*, planos(*))')
  
  if (isUUID) {
    query.or(`id.eq.${cursoId},slug.eq.${cursoId}`)
  } else {
    query.eq('slug', cursoId)
  }

  const { data: curso } = await query.single()
  if (!curso) notFound()

  // Buscar Layout Config
  const layoutConfig = await getCursoLayout(curso.id)
  const { exibir_depoimentos, exibir_secoes_extras } = layoutConfig

  // Buscar dados do Professor
  const { data: professor } = curso.professor_id 
    ? await supabase.from('professores').select('*').eq('id', curso.professor_id).single()
    : { data: null }

  const { data: modulosRel } = await supabase.from('cursos_modulos').select('modulo_id').eq('curso_id', curso.id)
  const idsMap = modulosRel?.map(m => m.modulo_id) || []
  
  let lessonTotal = 0
  if (idsMap.length > 0) {
    const { data: directLessons } = await supabase.from('aulas').select('id').in('modulo_id', idsMap)
    const { data: pivotLessons } = await supabase.from('modulos_aulas').select('aula_id').in('modulo_id', idsMap)
    
    const uniqueIds = new Set([
       ...(directLessons?.map(a => a.id) || []),
       ...(pivotLessons?.map(a => a.aula_id) || [])
    ])
    lessonTotal = uniqueIds.size
  }
  
  const moduleTotal = idsMap.length

  const { data: isAdmin } = user ? await supabase.rpc('is_admin') : { data: false }
  const { data: userData } = user ? await supabase.from('usuarios').select('is_staff').eq('id', user.id).single() : { data: null }
  const hasEditAccess = isAdmin || userData?.is_staff

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-32 font-sans selection:bg-[#10B981] selection:text-white w-full overflow-x-hidden">
      
      {/* CABEÇALHO ORIGINAL RESTAURADO */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-wrap items-center justify-between gap-4">
        <Link 
          href="/loja"
          className="group flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-[#10B981] transition-all break-words"
        >
          <div className="p-2 bg-white border border-slate-200 rounded-xl transition-all shadow-sm group-hover:border-[#10B981]/30">
            <ArrowLeft className="w-3 h-3" />
          </div>
          <span className="hidden sm:inline">Voltar para a Vitrine</span>
          <span className="sm:hidden">Voltar</span>
        </Link>

        {hasEditAccess && (
          <Link 
            href={`/admin/cursos/${curso.id}`}
            className="text-[9px] font-black uppercase tracking-widest text-[#10B981] hover:underline underline-offset-4 break-words text-right"
          >
            Editar Configurações
          </Link>
        )}
      </div>

      <main className="space-y-16 md:space-y-24 w-full">
        
        {/* HERO */}
        <section className="bg-[#022C22] pt-12 pb-32 md:pt-16 md:pb-40 px-4 md:px-6 relative w-full rounded-b-[2.5rem] md:rounded-none">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500 via-[#022C22] to-[#022C22]"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight max-w-4xl mx-auto break-words">
              {curso.titulo}
            </h1>
            {curso.descricao && (
              <p className="text-base sm:text-lg md:text-xl text-emerald-100/80 font-medium max-w-2xl mx-auto break-words line-clamp-3">
                {curso.descricao}
              </p>
            )}
          </div>
        </section>

        {/* DOUBLE COLUMN GRID */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-24 md:-mt-32 relative z-20 w-full">
          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            
            {/* ESQUERDA: VÍDEO E DADOS GERAIS */}
            <div className="w-full lg:flex-[2] bg-white rounded-[16px] p-4 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col gap-6 md:gap-8 overflow-hidden">
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-inner">
                {curso.video_vendas_url ? (
                  <VideoPlayer url={curso.video_vendas_url} />
                ) : curso.thumb_url ? (
                   <div className="w-full h-full relative group">
                     <img src={curso.thumb_url} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:scale-110 transition-transform" />
                     </div>
                   </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <Video className="w-12 h-12 text-slate-700" />
                  </div>
                )}
              </div>

              <div className="w-full space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-[#022C22] leading-tight break-words">Apresentação do Conteúdo</h2>
                
                <ul className="space-y-4 pt-2">
                  <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <LayoutTemplate className="w-5 h-5 text-[#10B981] shrink-0" />
                    <span className="break-words">{moduleTotal} Módulos Disponíveis</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <Video className="w-5 h-5 text-[#10B981] shrink-0" />
                    <span className="break-words">{lessonTotal} Aulas Gravadas</span>
                  </li>
                  {curso.garantia_dias > 0 && (
                    <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
                      <span className="break-words">Garantia de {curso.garantia_dias} dias</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* DIREITA: CHECKOUT/GARANTIA (STICKY) */}
            <div className="w-full lg:flex-[1] lg:sticky lg:top-8 bg-white rounded-[16px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 text-center flex flex-col items-center overflow-hidden">
              <h3 className="text-xl md:text-2xl font-bold text-[#022C22] mb-2 break-words">Garantir Vaga</h3>
              <p className="text-xs md:text-sm text-slate-500 mb-6 font-medium break-words">Preço e condições de pagamento:</p>
              
              <div className="mb-4 w-full">
                <PriceCard curso={curso} userEmail={user?.email || ''} />
              </div>

              <p className="text-[10px] md:text-xs font-semibold text-slate-500 mt-4 flex items-center justify-center gap-2 break-words">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                Compra 100% Segura
              </p>
            </div>
          </div>
        </section>

        {/* DETALHES COMPLETOS DO CURSO */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 w-full space-y-6">
          <h3 className="text-xl md:text-2xl font-bold text-[#022C22] break-words">Detalhes do Curso</h3>
          
          <div className="bg-white rounded-[16px] p-4 md:p-8 shadow-sm border border-slate-100 space-y-8 w-full overflow-hidden">
            
            {/* DESCRIÇÃO COMPLETA */}
            {curso.descricao && (
              <div className="w-full break-words">
                <ExpandableContent 
                  title="Sobre este Treinamento" 
                  text={curso.descricao} 
                  iconName="Target" 
                  color="primary"
                />
              </div>
            )}

            {/* OBJETIVOS */}
            {curso.objetivos && (
              <div className="w-full break-words">
                <ExpandableContent 
                  title="O que você vai aprender" 
                  text={curso.objetivos} 
                  iconName="Award" 
                  color="amber"
                />
              </div>
            )}

            {/* RESULTADOS ESPERADOS */}
            {curso.resultados_esperados && (
              <div className="w-full break-words">
                <ExpandableContent 
                  title="Resultados Esperados" 
                  text={curso.resultados_esperados} 
                  iconName="ShieldCheck" 
                  color="emerald"
                />
              </div>
            )}

            {/* EMENTA */}
            {curso.ementa_resumida && (
              <div className="w-full break-words">
                <ExpandableContent 
                  title="Ementa Detalhada" 
                  text={curso.ementa_resumida} 
                  iconName="ListChecks" 
                  color="indigo"
                />
              </div>
            )}
          </div>
        </section>

        {/* DEPOIMENTOS (Condicional) */}
        {exibir_depoimentos && (
          <section className="max-w-7xl mx-auto px-4 md:px-6 w-full overflow-hidden">
            <DepoimentosCarousel />
          </section>
        )}

        {/* SEÇÕES EXTRAS (Sempre visíveis se tiverem conteúdo, organizadas) */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 space-y-8 md:space-y-16 w-full overflow-hidden">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
                {(exibir_secoes_extras || curso.publico_alvo) && (
                  <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-sm border border-slate-100 space-y-4 w-full break-words">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-full flex items-center justify-center text-[#10B981] mb-4 md:mb-6 shrink-0">
                      <Users className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h4 className="text-lg md:text-xl font-bold text-[#022C22]">Para quem é este curso</h4>
                    <div className="text-xs md:text-sm text-slate-600 leading-relaxed break-words"><FormattedText text={curso.publico_alvo || 'Nenhuma informação.'} /></div>
                  </div>
                )}

                {(exibir_secoes_extras || curso.pre_requisitos) && (
                  <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-sm border border-slate-100 space-y-4 w-full break-words">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 md:mb-6 shrink-0">
                      <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h4 className="text-lg md:text-xl font-bold text-[#022C22]">Pré-requisitos</h4>
                    <div className="text-xs md:text-sm text-slate-600 leading-relaxed break-words"><FormattedText text={curso.pre_requisitos || 'Nenhum pré-requisito obrigatório.'} /></div>
                  </div>
                )}
            </div>

            {/* PROFESSOR */}
            {professor && (
              <div className="bg-white rounded-[16px] p-6 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start w-full overflow-hidden">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-[2rem] overflow-hidden shrink-0 border-4 border-emerald-50 shadow-lg relative bg-white">
                  {professor.avatar_url ? (
                    <img src={professor.avatar_url} alt={professor.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Users className="w-8 h-8 md:w-12 md:h-12 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="space-y-4 text-center md:text-left break-words w-full">
                  <div className="inline-block px-3 py-1 bg-emerald-50 text-[#10B981] text-[10px] md:text-xs font-bold uppercase rounded-full tracking-widest mb-2">Especialista / Professor</div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#022C22] break-words">{professor.nome}</h3>
                  <div className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto md:mx-0 break-words">
                    <FormattedText text={professor.biografia} />
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            {curso.faq && Array.isArray(curso.faq) && curso.faq.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 w-full overflow-hidden">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#022C22] text-center break-words">Perguntas Frequentes</h2>
                  <FAQAccordion faq={curso.faq} />
              </div>
            )}

        </section>
      </main>

      {/* WHATSAPP WIDGET */}
      <a href={`https://wa.me/5551981816000?text=Olá Paulo, dúvida sobre curso: ${curso.titulo}`} target="_blank" className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-[#10B981] text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 hover:bg-[#059669] transition-all">
        <HelpCircle className="w-6 h-6 md:w-8 md:h-8" />
      </a>

    </div>
  )
}
