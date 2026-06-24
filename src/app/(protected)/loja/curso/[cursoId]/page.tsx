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
    <div className="space-y-4">
      {faq.map((item: any, idx: number) => (
        <details key={idx} open className="group bg-white border border-border-custom rounded-3xl overflow-hidden [&_summary::-webkit-details-marker]:hidden shadow-sm">
          <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-emerald-50 transition-all outline-none">
            <h4 className="text-base font-bold text-[#022C22] leading-tight">
              {item.pergunta}
            </h4>
            <div className="p-2 transition-transform duration-300 group-open:-rotate-180 bg-[#F8FAFC] rounded-full border border-border-custom">
              <ChevronDown className="w-4 h-4 text-[#10B981]" />
            </div>
          </summary>
          <div className="p-6 pt-0 text-sm text-[#475569] leading-relaxed font-medium">
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
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-[#022C22]">O que dizem os alunos</h3>
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
        {depoimentos.map((d, i) => (
          <div key={i} className="min-w-[280px] snap-center bg-white p-6 rounded-[16px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between">
            <p className="text-sm text-slate-600 italic mb-6">"{d.texto}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {d.nome.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#022C22]">{d.nome}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">{d.cargo}</p>
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
    <div className="min-h-screen bg-[#F1F5F9] pb-32 font-sans selection:bg-[#10B981] selection:text-white">
      
      {/* HEADER MINIMALISTA */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/loja" className="flex items-center gap-2 text-[#022C22] font-extrabold text-xl tracking-tight">
              <Award className="w-6 h-6 text-[#10B981]" />
              PHD Academy
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/loja" className="text-sm font-semibold text-slate-600 hover:text-[#10B981] transition-colors">Cursos</Link>
            <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#10B981] transition-colors">Minha Conta</Link>
            <Link href="#" className="text-sm font-semibold text-slate-600 hover:text-[#10B981] transition-colors">Suporte</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-50 py-2 px-4 rounded-full border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-sm">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="text-sm font-bold text-[#022C22] hidden sm:block">{user.email?.split('@')[0]}</span>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-bold text-[#10B981] hover:text-[#059669]">Fazer Login</Link>
            )}

            {hasEditAccess && (
              <Link href={`/admin/cursos/${curso.id}`} className="ml-2 text-[10px] font-black uppercase bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700">
                Editar Layout
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="space-y-24">
        
        {/* HERO E BLOCO DUPLO DE CONVERSÃO */}
        <section className="bg-[#022C22] pt-20 pb-40 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500 via-[#022C22] to-[#022C22]"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto text-balance">
              {curso.titulo}
            </h1>
            <p className="text-lg md:text-xl text-emerald-100/80 font-medium max-w-2xl mx-auto">
              Domine as estratégias para fechar mais negócios e acelerar sua carreira.
            </p>
          </div>
        </section>

        {/* DOUBLE COLUMN GRID (ABOVE THE FOLD EM MOBILE) */}
        <section className="max-w-7xl mx-auto px-6 -mt-32 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* ESQUERDA: VÍDEO E SOBRE O CURSO */}
            <div className="lg:col-span-2 bg-white rounded-[16px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 aspect-video bg-black rounded-xl overflow-hidden relative shadow-inner">
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

              <div className="w-full md:w-1/2 space-y-6">
                <h2 className="text-2xl font-bold text-[#022C22] leading-tight">Apresentação do Professor e Conteúdo.</h2>
                <p className="text-sm text-slate-600 font-medium">
                  {moduleTotal} módulos, +{lessonTotal} aulas, 50h+, Certificado reconhecido.
                </p>
                
                <ul className="space-y-4">
                  {[
                    { icon: Target, text: "Mentoria Semanal" },
                    { icon: CheckCircle2, text: "Estudos de Caso Práticos" },
                    { icon: ShieldCheck, text: "Acesso Vitalício" }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <item.icon className="w-5 h-5 text-[#10B981]" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* DIREITA: CHECKOUT/GARANTIA (STICKY) */}
            <div className="lg:sticky lg:top-28 bg-white rounded-[16px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 text-center flex flex-col items-center">
              <h3 className="text-2xl font-bold text-[#022C22] mb-2">Garantir Vaga</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Aproveite o preço promocional:</p>
              
              <div className="mb-8 w-full">
                {/* Integração com Componente PriceCard já existente */}
                <PriceCard curso={curso} userEmail={user?.email || ''} />
              </div>

              <p className="text-xs font-semibold text-slate-500 mt-6 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                {curso.garantia_dias || 7} dias de garantia incondicional
              </p>
            </div>
          </div>
        </section>

        {/* GRID INFERIOR: MÓDULOS E DEPOIMENTOS */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-start">
            
            {/* ESQUERDA: EMENTA/ACORDEON */}
            <div className="lg:col-span-2 space-y-6">
               <h3 className="text-2xl font-bold text-[#022C22]">Conteúdo do Curso</h3>
               <div className="bg-white rounded-[16px] p-6 shadow-sm border border-slate-100">
                  <ExpandableContent 
                    title="Módulos Detalhados" 
                    text={curso.ementa_resumida} 
                    iconName="ListChecks" 
                    color="primary"
                  />
               </div>
            </div>

            {/* DIREITA: DEPOIMENTOS (Condicional) */}
            {exibir_depoimentos && (
              <div className="lg:col-span-1">
                <DepoimentosCarousel />
              </div>
            )}
          </div>
        </section>

        {/* SEÇÕES EXTRAS (Condicional) */}
        {exibir_secoes_extras && (
          <section className="max-w-7xl mx-auto px-6 space-y-16 pt-16 border-t border-slate-200">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-[#10B981] mb-6">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-[#022C22]">Para quem é este curso</h4>
                  <div className="text-sm text-slate-600 leading-relaxed"><FormattedText text={curso.publico_alvo} /></div>
                </div>

                <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 space-y-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-[#022C22]">Pré-requisitos</h4>
                  <div className="text-sm text-slate-600 leading-relaxed"><FormattedText text={curso.pre_requisitos} /></div>
                </div>
            </div>

            {/* PROFESSOR */}
            {professor && (
              <div className="bg-white rounded-[16px] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 border-4 border-emerald-50 shadow-lg">
                  {professor.avatar_url ? (
                    <img src={professor.avatar_url} alt={professor.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Users className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="space-y-4 text-center md:text-left">
                  <div className="inline-block px-3 py-1 bg-emerald-50 text-[#10B981] text-xs font-bold uppercase rounded-full tracking-widest mb-2">Autoridade no Assunto</div>
                  <h3 className="text-3xl font-extrabold text-[#022C22]">{professor.nome}</h3>
                  <div className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto md:mx-0">
                    <FormattedText text={professor.biografia} />
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="max-w-4xl mx-auto space-y-8">
                <h2 className="text-3xl font-bold text-[#022C22] text-center">Perguntas Frequentes</h2>
                <FAQAccordion faq={curso.faq} />
            </div>

          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-32 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="text-sm text-slate-500 font-semibold">© {new Date().getFullYear()} PHD Academy. Todos os direitos reservados.</div>
           <div className="flex gap-6 text-sm font-semibold text-slate-500">
             <Link href="#" className="hover:text-[#10B981]">Sobre Nós</Link>
             <Link href="#" className="hover:text-[#10B981]">Termos de Uso</Link>
             <Link href="#" className="hover:text-[#10B981]">Privacidade</Link>
           </div>
        </div>
      </footer>

      {/* WHATSAPP WIDGET */}
      <a href={`https://wa.me/5551981816000?text=Olá Paulo, dúvida sobre curso: ${curso.titulo}`} target="_blank" className="fixed bottom-8 right-8 z-50 bg-[#10B981] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:bg-[#059669] transition-all">
        <HelpCircle className="w-8 h-8" />
      </a>

    </div>
  )
}
