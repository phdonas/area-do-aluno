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
import CheckoutButton from '@/components/CheckoutButton'
import { VideoPlayer } from '@/components/video-player'
import * as motion from 'framer-motion/client'
import { FormattedText, ExpandableContent, SoftCard } from '@/components/CourseContent'

function FAQAccordion({ faq }: { faq: any | null }) {
  if (!faq || !Array.isArray(faq)) return null;

  return (
    <div className="space-y-4">
      {faq.map((item: any, idx: number) => (
        <details key={idx} className="group bg-surface border border-border-custom rounded-3xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-primary/5 transition-all outline-none">
            <h4 className="text-sm font-black text-text-primary uppercase italic tracking-widest leading-none">
              {item.pergunta}
            </h4>
            <div className="p-2 transition-transform duration-300 group-open:-rotate-180 bg-background rounded-full border border-border-custom">
              <ChevronDown className="w-4 h-4 text-primary" />
            </div>
          </summary>
          <div className="p-6 pt-0 text-sm text-text-secondary leading-relaxed font-medium">
             <FormattedText text={item.resposta} />
          </div>
        </details>
      ))}
    </div>
  )
}

function PriceCard({ curso, userEmail }: { curso: any, userEmail: string }) {
  const numPrice = typeof curso.preco === 'string' ? parseFloat(curso.preco) : curso.preco;
  // Apenas considera GRÁTIS se o preço for explicitamente 0 ou 0.00. 
  // Valores nulos ou vazios não devem disparar o estado grátis se o usuário diz que tem preço.
  const isFree = curso.preco !== null && curso.preco !== undefined && numPrice === 0;

  const formatPreco = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return (num || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-12 p-16 bg-background border-2 border-border-custom rounded-[4rem] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:scale-150" />
      
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full animate-pulse ${isFree ? 'bg-primary' : 'bg-emerald-500'}`} />
           <span className={`text-xs font-black uppercase tracking-[0.5em] ${isFree ? 'text-primary' : 'text-emerald-500'}`}>
             {isFree ? 'Oferta Exclusiva: Acesso Gratuito' : 'Inscrição com Acesso Imediato'}
           </span>
        </div>

        <div className="flex flex-col justify-center min-h-[140px]">
          {isFree ? (
            <div className="space-y-4">
              <div className="text-6xl md:text-7xl font-black text-primary tracking-tighter italic leading-none">
                GRÁTIS
              </div>
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl">
                 <span className="text-xs font-black text-primary uppercase tracking-widest italic">Totalmente Grátis</span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-text-muted">R$</span>
              <span className="text-5xl md:text-7xl font-black text-text-primary tracking-tighter italic leading-none bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
                {formatPreco(curso.preco)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center pt-2">
          {!isFree && (
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-3 italic">
              <CreditCard className="w-4 h-4 text-primary" /> {curso.formas_pagamento || 'Cartão ou Pix em até 12x'}
            </p>
          )}
          <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center gap-2">
             <Zap className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
             <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Vagas limitadas para este lote</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 w-full md:w-fit min-w-[340px] relative z-10">
        <CheckoutButton 
          cursoId={curso.id} 
          userEmail={userEmail} 
          label={isFree ? "QUERO ME INSCREVER AGORA" : "QUERO GARANTIR MINHA VAGA"}
        />
        <div className="flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-text-muted italic bg-surface/50 py-4 rounded-3xl border border-border-custom">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Transação 100% Segura
        </div>
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
  const query = supabase.from('cursos').select('*')
  
  if (isUUID) {
    query.or(`id.eq.${cursoId},slug.eq.${cursoId}`)
  } else {
    query.eq('slug', cursoId)
  }

  const { data: curso } = await query.single()
  if (!curso) notFound()

  // Buscar dados do Professor vinculado
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


  // Verificação de Admin para navegação
  const { data: isAdmin } = user ? await supabase.rpc('is_admin') : { data: false }
  const { data: userData } = user ? await supabase.from('usuarios').select('is_staff').eq('id', user.id).single() : { data: null }
  const hasEditAccess = isAdmin || userData?.is_staff

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white pb-32">
      
      <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link 
          href="/loja"
          className="group flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-primary transition-all"
        >
          <div className="p-2 bg-surface border border-border-custom rounded-xl transition-all">
            <ArrowLeft className="w-3 h-3" />
          </div>
          Voltar para a Vitrine
        </Link>

        {hasEditAccess && (
          <Link 
            href={`/admin/cursos/${curso.id}`}
            className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4"
          >
            Editar Configurações
          </Link>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-6 space-y-32">
        
        {/* HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
               <div className="w-16 h-1 bg-primary rounded-full" />
            </div>

            <h1 className="text-4xl md:text-[4.5rem] font-black text-text-primary tracking-tighter leading-[1] italic uppercase text-balance bg-gradient-to-br from-text-primary via-primary to-text-primary bg-clip-text text-transparent text-glow">
              {curso.titulo}
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary font-black uppercase italic tracking-tighter max-w-xl opacity-80 leading-relaxed">
              Desenvolva competências avançadas e prepare-se para os novos desafios do mercado sob orientação do Prof. Paulo.
            </p>

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-4 border-white/5 relative bg-surface group"
          >
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
            {curso.thumb_url ? (
              <img src={curso.thumb_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20 p-12">
                <LayoutTemplate className="w-24 h-24 text-text-muted" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center z-20">
               <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl transition-all group-hover:scale-110">
                  <PlayCircle className="w-10 h-10 text-white fill-white/20" />
               </div>
            </div>
          </motion.div>
        </section>

        {/* DESCRIÇÃO PRINCIPAL (Expandível) */}
        <section>
           <ExpandableContent 
              title="Sobre este Treinamento" 
              text={curso.descricao} 
              iconName="Target" 
              color="primary"
           />
        </section>

        {/* VÍDEO DE VENDAS */}
        <section className="space-y-12 group relative">
          <div className="absolute -inset-x-20 -inset-y-32 bg-primary/[0.03] blur-[120px] rounded-full -z-10 animate-pulse pointer-events-none" />
          
          <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-4xl font-black text-text-primary uppercase tracking-tighter italic leading-[1.2]">
              Entenda como este treinamento <br/> 
              irá <span className="text-primary text-glow">alavancar sua carreira</span>
            </h2>
          </div>

          <div className="relative z-10 mx-auto max-w-4xl">
            <VideoPlayer url={curso.video_vendas_url || ''} />
            
            {/* Elementos Decorativos de Blindagem */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
          </div>
        </section>

        {/* STATS */}
        <section>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-surface/30 border border-border-custom rounded-[3.5rem] backdrop-blur-xl">
              {[
                { icon: LayoutTemplate, val: moduleTotal, label: "Módulos", color: "text-primary" },
                { icon: Video, val: lessonTotal, label: "Aulas Gravadas", color: "text-emerald-500" },
                { icon: ListChecks, val: 0, label: "Exercícios", color: "text-amber-500" },
                { icon: Target, val: 0, label: "Simulados", color: "text-indigo-500" }
              ].map((s, i) => (
                <div key={i} className="p-8 bg-background border border-border-custom rounded-[2.5rem] text-center space-y-2 hover:translate-y-[-4px] transition-all">
                  <s.icon className={`w-6 h-6 ${s.color} mx-auto`} />
                  <div className="text-3xl font-black text-text-primary tracking-tighter italic">{s.val}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-text-muted italic">{s.label}</div>
                </div>
              ))}
           </div>
        </section>

        {/* O QUE VOCÉ VAI APRENDER */}
        <section className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-text-primary uppercase tracking-tighter italic leading-none max-w-2xl px-4">
               O que você vai <span className="text-primary">aprender</span>
            </h2>
            <ExpandableContent 
               title="Conteúdo e Objetivos" 
               text={curso.objetivos} 
               iconName="Award" 
               color="amber"
            />
        </section>

        <section><PriceCard curso={curso} userEmail={user?.email || ''} /></section>

        {/* AO FINAL DO CURSO */}
        <section className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-text-primary uppercase tracking-tighter italic leading-none px-4">
               Ao final você será <span className="text-emerald-500">capaz de</span>
            </h2>
            <ExpandableContent 
               title="Resultados Esperados" 
               text={curso.resultados_esperados} 
               iconName="ShieldCheck" 
               color="emerald"
            />
        </section>

        {/* EMENTA */}
        <section className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-text-primary uppercase italic tracking-widest px-4">Ementa <span className="text-primary">Detalhada</span></h2>
            <ExpandableContent 
               title="Módulos e Aulas" 
               text={curso.ementa_resumida} 
               iconName="ListChecks" 
               color="indigo"
            />
        </section>

        {/* GRID DUPLO (Vantagens) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SoftCard className="flex flex-col h-full space-y-6">
               <div className="p-4 bg-primary/10 rounded-2xl w-fit text-primary shadow-sm"><Users className="w-8 h-8" /></div>
               <h4 className="text-xl font-black text-text-primary uppercase italic tracking-widest">Para quem é este curso</h4>
               <div className="text-sm text-text-secondary font-medium flex-1"><FormattedText text={curso.publico_alvo} /></div>
            </SoftCard>
            <SoftCard className="flex flex-col h-full space-y-6">
               <div className="p-4 bg-amber-500/10 rounded-2xl w-fit text-amber-500 shadow-sm"><AlertCircle className="w-8 h-8" /></div>
               <h4 className="text-xl font-black text-text-primary uppercase italic tracking-widest">Pré-requisitos</h4>
               <div className="text-sm text-text-secondary font-medium flex-1"><FormattedText text={curso.pre_requisitos} /></div>
            </SoftCard>
        </section>

        <section><PriceCard curso={curso} userEmail={user?.email || ''} /></section>

        {/* SEÇÃO DO PROFESSOR */}
        {professor && (
          <section className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <h2 className="text-4xl md:text-5xl font-black text-text-primary uppercase tracking-tighter italic leading-none">Quem vai te <br/><span className="text-primary">ensinar</span></h2>
              <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.4em] text-text-muted italic border-l-2 border-primary pl-4">Conheça sua nova <br/>autoridade no assunto</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Card Biografia */}
              <div className="lg:col-span-2 group">
                <SoftCard className="h-full relative overflow-hidden flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden shrink-0 border-4 border-white shadow-2xl transition-transform group-hover:scale-105">
                    {professor.avatar_url ? (
                      <img src={professor.avatar_url} alt={professor.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-12 h-12 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-text-primary uppercase italic tracking-tighter">{professor.nome}</h3>
                    <div className="text-base text-text-secondary leading-relaxed max-w-2xl">
                      <FormattedText text={professor.biografia} />
                    </div>
                    
                    {/* Social Links */}
                    {professor.links && professor.links.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-4">
                        {professor.links.map((link: any, idx: number) => (
                           <a 
                             key={idx} 
                             href={link.url} 
                             target="_blank" 
                             className="px-4 py-2 bg-background border border-border-custom rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary hover:border-primary/30 transition-all flex items-center gap-2"
                           >
                             <ExternalLink className="w-3.5 h-3.5" />
                             {link.label}
                           </a>
                        ))}
                      </div>
                    )}
                  </div>
                </SoftCard>
              </div>

              {/* Card Vídeo ou Destaque */}
              <div className="space-y-6">
                <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 group relative bg-black">
                  {professor.video_url ? (
                    <VideoPlayer url={professor.video_url} />
                  ) : professor.site_url ? (
                    <a 
                      href={professor.site_url} 
                      target="_blank" 
                      className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-primary/5 hover:bg-primary/10 transition-all font-bold group"
                    >
                      <ExternalLink className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-widest text-text-primary">Visite o Site Oficial</span>
                      <span className="text-[10px] text-text-muted mt-2 truncate w-full">{professor.site_url}</span>
                    </a>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface">
                      <Video className="w-12 h-12 text-text-muted opacity-5" />
                    </div>
                  )}
                </div>
                
                <div className="p-8 bg-surface/50 border border-border-custom rounded-[2.5rem] backdrop-blur-md">
                   <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">Especialista Verificado</span>
                   </div>
                   <p className="text-[10px] text-text-secondary leading-relaxed uppercase tracking-tighter">
                     Conteúdo desenvolvido e validado por profissional com ampla experiência técnica no mercado.
                   </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER INFO */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ 
              { icon: ShieldCheck, title: "Garantia Blindada", color: "text-primary", bg: "bg-primary/10", text: `Avalie por ${curso.garantia_dias || 7} dias. Se não gostar, devolvemos 100%.` },
              { icon: Award, title: "Certificado", color: "text-emerald-500", bg: "bg-emerald-500/10", text: "Certificado PHDonassolo Academy oficial emitido após conclusão." },
              { icon: Clock, title: "Validade", color: "text-amber-500", bg: "bg-amber-500/10", text: "Acesso garantido de 6 meses até Vitalício conforme matrícula." }
            ].map((item, i) => (
              <div key={i} className="p-10 bg-surface border border-border-custom rounded-[3rem] text-center space-y-4 shadow-sm hover:translate-y-[-5px] transition-all">
                <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h5 className="font-black text-text-primary uppercase italic tracking-widest">{item.title}</h5>
                <p className="text-[10px] text-text-muted font-bold tracking-tight uppercase leading-snug">{item.text}</p>
              </div>
            ))}
        </section>

        {/* FAQ */}
        <section className="space-y-12">
            <h2 className="text-4xl md:text-5xl font-black text-text-primary uppercase tracking-tighter italic leading-none text-center">Perguntas <span className="text-primary">Frequentes</span></h2>
            <div className="max-w-4xl mx-auto"><FAQAccordion faq={curso.faq} /></div>
        </section>

        <section className="pt-20"><PriceCard curso={curso} userEmail={user?.email || ''} /></section>

      </main>

      {/* WHATSAPP FLOAT */}
      <a href={`https://wa.me/5551981816000?text=Olá Paulo, dúvida sobre curso: ${curso.titulo}`} target="_blank" className="fixed bottom-10 right-10 z-50 bg-emerald-500 text-white p-6 rounded-full shadow-2xl hover:scale-110 transition-all group">
        <HelpCircle className="w-8 h-8" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-all border border-emerald-100 whitespace-nowrap">Dúvidas? Fale comigo!</span>
      </a>

    </div>
  )
}
