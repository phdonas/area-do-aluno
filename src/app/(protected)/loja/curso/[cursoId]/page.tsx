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
  PlayCircle,
  Star,
  Check
} from 'lucide-react'
import { PriceCard } from './PriceCard'
import { VideoPlayer } from '@/components/video-player'
import * as motion from 'framer-motion/client'
import { getCursoLayout } from '../../../admin/cursos/actions'

// Helper para formatar texto sem o "Bento Box"
function SimpleCheckList({ text }: { text: string | null }) {
  if (!text) return null;
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      {lines.map((line, idx) => {
        let cleanLine = line.trim();
        if (cleanLine.startsWith('- ')) cleanLine = cleanLine.substring(2);
        
        return (
          <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed break-words">
            <Check className="w-4 h-4 text-[#1C1D1F] shrink-0 mt-0.5" />
            <span>{cleanLine}</span>
          </li>
        );
      })}
    </ul>
  )
}

function SimpleFormattedText({ text }: { text: string | null }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-4 text-sm text-slate-700 leading-relaxed break-words">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;
        if (trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
              <span>{trimmed.substring(2)}</span>
            </div>
          );
        }
        return <p key={idx}>{trimmed}</p>;
      })}
    </div>
  )
}

function FAQAccordion({ faq }: { faq: any | null }) {
  if (!faq || !Array.isArray(faq)) return null;

  return (
    <div className="space-y-4 w-full">
      {faq.map((item: any, idx: number) => (
        <details key={idx} className="group bg-white border border-slate-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-all outline-none">
            <h4 className="text-base font-bold text-[#1C1D1F] leading-tight break-words pr-4">
              {item.pergunta}
            </h4>
            <div className="shrink-0 transition-transform duration-300 group-open:-rotate-180 text-slate-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </summary>
          <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed break-words">
             <SimpleFormattedText text={item.resposta} />
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
      <h3 className="text-2xl font-bold text-[#1C1D1F]">O que dizem os alunos</h3>
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
        {depoimentos.map((d, i) => (
          <div key={i} className="min-w-[280px] w-[280px] snap-center bg-white p-6 rounded-lg border border-slate-200 flex flex-col justify-between shrink-0">
            <p className="text-sm text-slate-600 italic mb-6 break-words">"{d.texto}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C1D1F] flex items-center justify-center text-white font-bold shrink-0">
                {d.nome.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#1C1D1F] truncate">{d.nome}</p>
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
    <div className="min-h-screen bg-white pb-32 font-sans selection:bg-[#1C1D1F] selection:text-white w-full overflow-x-hidden">
      
      {/* HEADER ESCURO TIPO UDEMY */}
      <div className="bg-[#1C1D1F] text-white w-full">
        {/* TOP NAV SIMPLES */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link 
            href="/loja"
            className="group flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-all break-words"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar para a Vitrine</span>
            <span className="sm:hidden">Voltar</span>
          </Link>

          {hasEditAccess && (
            <Link 
              href={`/admin/cursos/${curso.id}`}
              className="text-xs font-bold uppercase tracking-widest text-[#A435F0] hover:text-[#C024FD] break-words"
            >
              Editar Configurações
            </Link>
          )}
        </div>

        {/* HERO CONTENT */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16 w-full flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white break-words">
              {curso.titulo}
            </h1>
            {curso.descricao && (
              <p className="text-base md:text-lg text-slate-300 font-normal break-words line-clamp-3">
                {curso.descricao}
              </p>
            )}
            
            {/* META INFO */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-slate-300">
               <div className="flex items-center gap-1 text-[#F3CA8C] font-bold">
                 <span className="text-base">5,0</span>
                 <Star className="w-4 h-4 fill-[#F3CA8C]" />
                 <Star className="w-4 h-4 fill-[#F3CA8C]" />
                 <Star className="w-4 h-4 fill-[#F3CA8C]" />
                 <Star className="w-4 h-4 fill-[#F3CA8C]" />
                 <Star className="w-4 h-4 fill-[#F3CA8C]" />
               </div>
               {professor && (
                 <div>Criado por <span className="text-[#A435F0] underline decoration-[#A435F0]/30 underline-offset-4">{professor.nome}</span></div>
               )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
               <span className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4" /> {moduleTotal} módulos</span>
               <span className="flex items-center gap-2"><Video className="w-4 h-4" /> {lessonTotal} aulas</span>
            </div>
          </div>
          
          {/* Ocupa espaço na direita lg para alinhar */}
          <div className="hidden lg:block lg:w-1/3"></div>
        </div>
      </div>

      {/* MAIN LAYOUT WITH SIDEBAR */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col lg:flex-row gap-8 relative">
        
        {/* COLUNA ESQUERDA (CONTEÚDO) */}
        <div className="w-full lg:w-2/3 py-8 space-y-12">
          
          {/* OBJETIVOS (O que você aprenderá) */}
          {curso.objetivos && (
            <div className="w-full border border-slate-200 p-6 bg-white break-words">
               <h2 className="text-2xl font-bold text-[#1C1D1F] mb-6">O que você aprenderá</h2>
               <SimpleCheckList text={curso.objetivos} />
            </div>
          )}

          {/* RESULTADOS ESPERADOS */}
          {curso.resultados_esperados && (
            <div className="w-full border border-slate-200 p-6 bg-white break-words">
               <h2 className="text-2xl font-bold text-[#1C1D1F] mb-6">Resultados Esperados</h2>
               <SimpleCheckList text={curso.resultados_esperados} />
            </div>
          )}

          {/* EMENTA */}
          {curso.ementa_resumida && (
            <div className="w-full break-words">
              <h2 className="text-2xl font-bold text-[#1C1D1F] mb-6">Conteúdo do curso</h2>
              <div className="bg-white p-6 border border-slate-200">
                <SimpleFormattedText text={curso.ementa_resumida} />
              </div>
            </div>
          )}

          {/* SEÇÕES EXTRAS (Público e Requisitos) */}
          {(exibir_secoes_extras || curso.publico_alvo || curso.pre_requisitos) && (
            <div className="space-y-8 w-full">
              {curso.pre_requisitos && (
                <div className="w-full break-words">
                  <h2 className="text-2xl font-bold text-[#1C1D1F] mb-4">Requisitos</h2>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                    {curso.pre_requisitos.split('\n').filter((l: string) => l.trim().length > 0).map((l: string, i: number) => (
                      <li key={i}>{l.replace('- ', '')}</li>
                    ))}
                  </ul>
                </div>
              )}
              {curso.publico_alvo && (
                <div className="w-full break-words">
                  <h2 className="text-2xl font-bold text-[#1C1D1F] mb-4">Para quem é este curso</h2>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                    {curso.publico_alvo.split('\n').filter((l: string) => l.trim().length > 0).map((l: string, i: number) => (
                      <li key={i}>{l.replace('- ', '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* PROFESSOR */}
          {professor && (
            <div className="w-full break-words space-y-4 pt-8">
               <h2 className="text-2xl font-bold text-[#1C1D1F]">Instrutor</h2>
               <h3 className="text-lg font-bold text-[#A435F0] underline decoration-[#A435F0]/30 underline-offset-4">{professor.nome}</h3>
               <div className="flex items-start gap-4">
                  {professor.avatar_url ? (
                    <img src={professor.avatar_url} alt={professor.nome} className="w-24 h-24 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Users className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div className="text-sm text-slate-700 flex-1">
                    <SimpleFormattedText text={professor.biografia} />
                  </div>
               </div>
            </div>
          )}

          {/* DEPOIMENTOS (Condicional) */}
          {exibir_depoimentos && (
            <div className="w-full pt-8">
              <DepoimentosCarousel />
            </div>
          )}

          {/* FAQ */}
          {curso.faq && Array.isArray(curso.faq) && curso.faq.length > 0 && (
            <div className="w-full pt-8">
                <h2 className="text-2xl font-bold text-[#1C1D1F] mb-6">Perguntas frequentes</h2>
                <FAQAccordion faq={curso.faq} />
            </div>
          )}

        </div>

        {/* COLUNA DIREITA (STICKY CARD) */}
        <div className="w-full lg:w-1/3 relative z-20 -mt-8 lg:-mt-64">
           <div className="lg:sticky lg:top-8 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.08)] border border-white text-[#1C1D1F] flex flex-col w-full overflow-hidden">
              
              {/* VIDEO / THUMBNAIL (Ocupa o topo do card) */}
              <div className="w-full aspect-video bg-[#1C1D1F] relative border-b border-slate-200">
                {curso.video_vendas_url ? (
                  <VideoPlayer url={curso.video_vendas_url} />
                ) : curso.thumb_url ? (
                   <div className="w-full h-full relative group cursor-pointer flex items-center justify-center">
                     <img src={curso.thumb_url} className="absolute inset-0 w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                     <div className="relative w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                        <PlayCircle className="w-10 h-10 text-[#1C1D1F] ml-1" />
                     </div>
                   </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1C1D1F]">
                    <Video className="w-12 h-12 text-slate-500" />
                  </div>
                )}
              </div>

              {/* BUY INFO */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">Assine e acesse</h3>
                
                <div className="w-full mb-6">
                  <PriceCard curso={curso} userEmail={user?.email || ''} />
                </div>

                <div className="space-y-3 mt-6">
                  <p className="font-bold text-sm">Este curso inclui:</p>
                  <ul className="text-sm text-slate-600 space-y-3">
                    {lessonTotal > 0 && (
                      <li className="flex items-center gap-3">
                        <Video className="w-4 h-4 shrink-0" /> {lessonTotal} aulas de vídeo
                      </li>
                    )}
                    <li className="flex items-center gap-3">
                      <LayoutTemplate className="w-4 h-4 shrink-0" /> Acesso em dispositivos móveis e TV
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-4 h-4 shrink-0" /> Certificado de conclusão
                    </li>
                    {curso.garantia_dias > 0 && (
                       <li className="flex items-center gap-3 text-[#1C1D1F] font-semibold">
                         <ShieldCheck className="w-4 h-4 shrink-0" /> Garantia de {curso.garantia_dias} dias
                       </li>
                    )}
                  </ul>
                </div>
              </div>
              
           </div>
        </div>

      </div>

      {/* WHATSAPP WIDGET */}
      <a href={`https://wa.me/5551981816000?text=Olá Paulo, dúvida sobre curso: ${curso.titulo}`} target="_blank" className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-[#10B981] text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 hover:bg-[#059669] transition-all">
        <HelpCircle className="w-6 h-6 md:w-8 md:h-8" />
      </a>

    </div>
  )
}
