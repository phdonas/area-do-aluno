import { createClient } from '@/lib/supabase/server'
import { 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Play, 
  Sparkles,
  Zap,
  Target,
  Leaf,
  Users,
  Award,
  Brain
} from 'lucide-react'
import Link from 'next/link'

// Mapeamento de ícones para Lucide
const IconMap: Record<string, any> = {
  Brain,
  Target,
  Leaf,
  Users,
  Zap,
  Award
}

export const dynamic = 'force-dynamic'

export default async function VitrinePage() {
  const supabase = await createClient()

  // 1. Buscar Pilares Dinâmicos
  const { data: pilares } = await supabase
    .from('pilares')
    .select('*')
    .order('ordem', { ascending: true })

  // 2. Buscar cursos em destaque
  const { data: cursos } = await supabase
    .from('cursos')
    .select('*, planos_cursos(valor_venda, valor_original, is_featured, ativo, planos(nome))')
    .eq('destaque_vitrine', true)
    .limit(6)

  // 3. Buscar materiais em destaque
  const { data: materiais } = await supabase
    .from('materiais')
    .select('*')
    .eq('destaque_vitrine', true)
    .limit(4)

  // 4. Verificar usuário logado
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="bg-background min-h-screen selection:bg-primary selection:text-white transition-colors duration-500">
      
      {/* SECTION 1: HERO + CTA */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 pt-20">
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-md rounded-full border border-border-custom mb-4 shadow-xl">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary">Metodologia Exclusiva</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] italic">
            CONSTRUA SUA <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-blue-500">ALTA PERFORMANCE</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-text-secondary font-medium leading-relaxed italic opacity-80">
            PHDonassolo Academy: A plataforma definitiva para dominar Vendas, Negociação e Liderança sob uma perspectiva científica e prática.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {!user ? (
              <>
                <Link 
                  href="/registrar"
                  className="px-12 py-6 bg-text-primary text-background rounded-full font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl group"
                >
                  Criar minha conta agora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/login"
                  className="px-12 py-6 bg-surface/80 backdrop-blur-md border border-border-custom text-text-primary rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-surface transition-all"
                >
                  Acessar Login
                </Link>
              </>
            ) : (
              <Link 
                href="/catalogo"
                className="px-12 py-6 bg-text-primary text-background rounded-full font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl group"
              >
                Explorar Catálogo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: CONHEÇA A ACADEMIA (PILARES DINÂMICOS) */}
      <section className="py-32 px-6 border-t border-border-custom/30 bg-surface/30">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Nossa Base Estratégica</span>
             <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter uppercase italic leading-none">Pilares da <span className="text-primary italic font-black">Transformação</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pilares?.map((pilar, i) => {
              const Icon = IconMap[pilar.icone] || Zap
              return (
                <div key={pilar.id} className="group relative bg-surface border border-border-custom p-10 rounded-[48px] hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
                   <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center mb-10 shadow-lg group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                      <Icon className="w-8 h-8 text-primary group-hover:text-white" />
                   </div>
                   <h3 className="text-2xl font-black text-text-primary mb-4 tracking-tight uppercase italic">{pilar.nome}</h3>
                   <p className="text-text-secondary font-medium leading-relaxed opacity-80">{pilar.subtitulo}</p>
                   <div className="absolute top-8 right-10 text-4xl font-black text-text-muted/5 italic">0{i+1}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: CURSOS EM DESTAQUE */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-border-custom pb-8">
            <div className="space-y-4">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Ofertas Selecionadas</span>
               <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter uppercase italic leading-none">Cursos em <span className="text-primary italic">Destaque</span></h2>
            </div>
            <Link href="/catalogo" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-primary transition-colors group">
              Ver Catálogo Completo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cursos?.map((curso) => {
              const offers = (curso.planos_cursos || [])
                .filter((o: any) => o.ativo !== false)
                .sort((a: any, b: any) => (a.valor_venda || 0) - (b.valor_venda || 0));

              const minOffer = offers[0] || null;
              const featuredOffer = offers.find((o: any) => o.is_featured);
              const minPrice = minOffer ? minOffer.valor_venda : (curso.preco || 0);
              const isFree = minPrice === 0 && (minOffer || curso.is_gratis);

              const formatPreco = (val: number) => {
                return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              }

              return (
                <Link key={curso.id} href={`/loja/curso/${curso.id}`} className="group relative bg-surface border border-border-custom rounded-[48px] overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col hover:shadow-2xl">
                  <div className="h-64 relative bg-black/20 overflow-hidden">
                    <img src={curso.thumb_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={curso.titulo} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8 gap-2">
                       {featuredOffer && (
                         <span className="px-3 py-1 bg-primary text-white rounded-full text-[7px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Recomendado</span>
                       )}
                       <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Premium</span>
                    </div>
                  </div>
                  <div className="p-8 space-y-4 flex-1 flex flex-col">
                     <h3 className="text-2xl font-black text-text-primary tracking-tight leading-tight group-hover:text-primary transition-colors italic uppercase">{curso.titulo}</h3>
                     <p className="text-sm text-text-secondary font-medium line-clamp-2 opacity-80 flex-1">{curso.descricao}</p>
                     
                     <div className="pt-6 border-t border-border-custom flex items-center justify-between">
                        <div className="flex flex-col">
                           {isFree ? (
                             <span className="text-xl font-black text-primary tracking-tighter italic">GRÁTIS</span>
                           ) : (
                             <>
                               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">
                                 {offers.length > 1 ? 'A partir de' : (minOffer?.planos?.nome || 'Inscrição')}
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-[10px] font-bold text-text-muted">R$</span>
                                  <span className="text-xl font-black text-text-primary tracking-tighter italic">{formatPreco(minPrice)}</span>
                                </div>
                             </>
                           )}
                        </div>
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                           <ArrowRight className="w-5 h-5" />
                        </div>
                     </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: MATERIAIS PARA DOWNLOAD */}
      <section className="py-32 px-6 bg-surface border-y border-border-custom/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Valor Gratuito</span>
              <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter italic uppercase leading-tight">Materiais <br/><span className="text-primary">Estratégicos</span></h2>
            </div>
            <p className="text-lg text-text-secondary font-medium leading-relaxed opacity-80">
              Comece a aplicar a metodologia PHDonassolo hoje mesmo com nossos frameworks, checklists e e-books exclusivos.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {['Frameworks', 'Checklists', 'E-books', 'Planilhas'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-black text-text-primary uppercase tracking-widest">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {materiais?.map((mat) => (
              <div key={mat.id} className="bg-background border border-border-custom p-8 rounded-[40px] hover:border-primary/50 transition-all duration-500 group flex flex-col shadow-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                   <Download className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <h4 className="text-xl font-black text-text-primary mb-2 tracking-tight uppercase italic">{mat.titulo}</h4>
                <p className="text-xs text-text-secondary font-medium mb-10 flex-1 opacity-70 leading-relaxed">{mat.descricao}</p>
                <button className="w-full py-4 bg-surface text-text-primary border border-border-custom rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-text-primary hover:text-background transition-all shadow-md">
                   Download Grátis
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: O PROFESSOR (MODO DIA/NOITE CUSTOMIZADO) */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="bg-slate-950 rounded-[4rem] overflow-hidden relative border border-white/5 shadow-2xl">
              <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/20 to-transparent z-0" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
                 <div className="p-12 md:p-24 space-y-10">
                    <div className="space-y-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Mentoria & Autoridade</span>
                       <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">Prof. <span className="text-primary">Paulo</span></h2>
                    </div>
                    
                    <div className="space-y-6 text-slate-400 font-medium text-lg leading-relaxed italic">
                       <p>Paulo H. Donassolo é especialista em desenvolvimento de alta performance, transformando times executivos em grandes corporações há mais de duas décadas.</p>
                       <p>Fundador da metodologia que integra comportamento humano e dados para resultados exponenciais em ecoinovação e estratégia.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-6">
                       <div className="space-y-1">
                          <p className="text-3xl font-black text-white tracking-tighter">15k+</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Alunos</p>
                       </div>
                       <div className="space-y-1 border-l border-white/10 pl-8">
                          <p className="text-3xl font-black text-white tracking-tighter">200+</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Projetos</p>
                       </div>
                    </div>
                 </div>

                 <div className="relative min-h-[500px] flex items-center justify-center p-12 bg-white/5 backdrop-blur-sm border-l border-white/10">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 to-transparent z-10" />
                    <div className="text-center space-y-6 relative z-20">
                        <div className="w-64 h-80 bg-slate-800 rounded-[40px] mx-auto border-8 border-white/5 overflow-hidden shadow-2xl skew-x-1">
                           <div className="w-full h-full bg-gradient-to-br from-primary/10 to-blue-600/20 flex items-center justify-center">
                              <Users className="w-20 h-20 text-white/5" />
                           </div>
                        </div>
                        <p className="text-white/20 font-black uppercase tracking-[0.6em] text-[10px] italic">PHDonassolo Academy</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 px-6 border-t border-border-custom/30 text-center space-y-10 bg-surface/5">
         <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
               <span className="text-xl text-white font-black italic">PH</span>
            </div>
            <span className="text-2xl font-black text-text-primary tracking-tighter uppercase italic">Donassolo <span className="text-primary italic">Academy</span></span>
         </div>
         <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.5em] opacity-60 italic">&copy; 2026 Ecossistema de Evolução Profissional</p>
      </footer>
    </div>
  )
}
