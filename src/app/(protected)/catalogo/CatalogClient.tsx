'use client'

import { useState, useMemo } from 'react'
import { 
  Search, 
  PlayCircle, 
  CreditCard, 
  ShoppingBag, 
  Brain, 
  Target, 
  Leaf, 
  Users, 
  Zap,
  LayoutGrid,
  Sparkles,
  Award
} from 'lucide-react'
import Link from 'next/link'

// Mapeamento de ícones do banco para componentes Lucide
const IconMap: Record<string, any> = {
  Brain,
  Target,
  Leaf,
  Users,
  Zap,
  Sparkles,
  Award
}

interface CatalogClientProps {
  cursos: any[]
  pacotes: any[]
  pilares: any[]
  idsAcessos: string[]
}

export function CatalogClient({ cursos, pacotes, pilares, idsAcessos }: CatalogClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPilar, setSelectedPilar] = useState<string | null>(null)

  // Filtragem Lógica
  const filteredCursos = useMemo(() => {
    return cursos.filter(curso => {
      const matchesSearch = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          curso.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPilar = !selectedPilar || (curso.pilar_slugs && curso.pilar_slugs.includes(selectedPilar))
      
      return matchesSearch && matchesPilar
    })
  }, [cursos, searchTerm, selectedPilar])

  // Funções de apoio movidas para fora do loop de renderização para evitar redeclaração e erros de sintaxe
  async function handleFreeEnrollment(curso: any, jaMatriculado: boolean) {
    if (!curso.is_gratis || jaMatriculado) return
    
    // Removido confirm() para evitar bloqueios de navegador e facilitar automação/UX
    const { matricularAlunoEmCursoGratuito } = await import('./actions')
    const res = await matricularAlunoEmCursoGratuito(curso.id)
    if (res.success) {
      window.location.reload()
    } else {
      alert(res.error)
    }
  }

  const cleanDescription = (text: string) => {
    if (!text) return ''
    return text.replace(/[*#_~`\[\]]/g, '').trim()
  }

  return (
    <div className="space-y-12">
      
      {/* BARRA DE FILTROS E BUSCA */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between sticky top-4 z-40 bg-background/80 backdrop-blur-xl p-4 rounded-3xl border border-border-custom shadow-lg">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border-custom rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => setSelectedPilar(null)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              !selectedPilar 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface border border-border-custom text-text-muted hover:border-primary/50'
            }`}
          >
            Todos
          </button>
          {pilares.map((pilar) => {
            const Icon = IconMap[pilar.icone] || Zap
            return (
              <button 
                key={pilar.id}
                onClick={() => setSelectedPilar(pilar.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedPilar === pilar.slug 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-surface border border-border-custom text-text-muted hover:border-primary/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                {pilar.nome}
              </button>
            )
          })}
        </div>
      </div>

      {/* RESULTADOS: CURSOS */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
           <LayoutGrid className="w-5 h-5 text-primary" />
           <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase italic">Cursos</h2>
           <div className="h-px flex-1 bg-border-custom" />
           <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{filteredCursos.length} itens encontrados</span>
        </div>

        {filteredCursos.length === 0 ? (
          <div className="py-20 text-center bg-surface rounded-[3rem] border border-dashed border-border-custom">
             <p className="text-text-muted font-medium">Nenhum treinamento encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCursos.map((curso) => {
              const enrolled = idsAcessos.includes(curso.id);
              const free = curso.is_gratis;
              
              // Lógica de Preço Dinâmico (Múltiplos Planos)
              const offers = curso.planos_cursos || []
              const prices = offers.map((o: any) => o.valor_venda).filter((p: any) => p !== null)
              const minPrice = prices.length > 0 ? Math.min(...prices) : (curso.preco || 0)
              const firstPlanoId = offers[0]?.plano_id

              const link = enrolled ? `/player/${curso.id}` : `/loja/curso/${curso.slug || curso.id}`;
              const checkout = free ? '#' : `/checkout/${curso.id}${firstPlanoId ? `?plano=${firstPlanoId}` : ''}`;

              const formatPreco = (val: number) => {
                return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              }

              return (
                <div key={curso.id} className="group relative bg-surface border border-border-custom rounded-[40px] overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col hover:shadow-2xl">
                   {enrolled && (
                     <div className="absolute top-6 left-6 z-30 px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">
                        Já Adquirido
                     </div>
                   )}
                   {!enrolled && free && (
                     <div className="absolute top-6 left-6 z-30 px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl animate-pulse">
                        Acesso Gratuito
                     </div>
                   )}

                    <div className="h-56 relative bg-black/20 overflow-hidden">
                      <Link href={link}>
                        <img 
                          src={curso.thumb_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt={curso.titulo} 
                        />
                      </Link>
                      <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end max-w-[80%]">
                         {(curso.pilar_nomes && curso.pilar_nomes.length > 0) ? (
                           curso.pilar_nomes.map((nome: string, i: number) => (
                             <span key={i} className="px-3 py-1 bg-primary text-white rounded-full text-[7px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                               {nome}
                             </span>
                           ))
                         ) : (
                           <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full text-[7px] font-black uppercase tracking-widest">
                             {curso.pilar_slug || 'PHD Academy'}
                           </span>
                         )}
                      </div>
                    </div>

                    <div className="p-8 space-y-4 flex-1 flex flex-col">
                       <Link href={link}>
                          <h3 className="text-xl font-black text-text-primary tracking-tight leading-tight group-hover:text-primary transition-colors">{curso.titulo}</h3>
                       </Link>
                       <p className="text-sm text-text-secondary font-medium line-clamp-2 leading-relaxed flex-1 opacity-80">
                         {cleanDescription(curso.descricao)}
                       </p>
                      
                      <div className="pt-6 border-t border-border-custom flex items-center justify-between gap-4">
                         <div className="flex flex-col">
                            {enrolled ? (
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Acesso Liberado</span>
                            ) : free ? (
                              <span className="text-xl font-black text-amber-500 tracking-tighter italic">GRÁTIS</span>
                            ) : (
                              <div className="flex flex-col">
                                {offers.length > 1 && <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">A partir de</span>}
                                <span className="text-xl font-black text-text-primary tracking-tighter italic">R$ {formatPreco(minPrice)}</span>
                              </div>
                            )}
                         </div>
                         <Link 
                            href={enrolled ? link : checkout}
                            onClick={free && !enrolled ? (e) => { e.preventDefault(); handleFreeEnrollment(curso, enrolled); } : undefined}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                              enrolled 
                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20' 
                                : free 
                                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 shadow-lg shadow-amber-500/5'
                                : 'bg-text-primary text-background hover:bg-primary hover:text-white shadow-lg'
                            }`}
                          >
                             {enrolled ? 'Assistir' : free ? 'Ativar Agora' : 'Comprar'}
                             {enrolled ? <PlayCircle className="w-3.5 h-3.5" /> : free ? <Sparkles className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                          </Link>
                      </div>
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION PACOTES (Sem filtro, sempre visíveis quando não há busca pesada) */}
      {!searchTerm && !selectedPilar && pacotes.length > 0 && (
        <div className="space-y-12 pt-12 border-t border-border-custom">
          <div className="space-y-4 text-center max-w-2xl mx-auto">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Impulsão Total</span>
             <h2 className="text-3xl md:text-4xl font-black text-text-primary tracking-tighter uppercase italic">Combos & <span className="text-primary italic">Assinaturas</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {pacotes.map((pacote) => (
               <div key={pacote.id} className="group relative p-px bg-gradient-to-br from-primary via-primary/50 to-orange-500 rounded-[48px] overflow-hidden">
                  <div className="bg-surface rounded-[47px] p-8 md:p-12 h-full flex flex-col space-y-6">
                     <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-[0.2em] w-fit">
                        Oferta Recomendada
                     </div>
                     
                     <div className="space-y-2">
                        <h3 className="text-3xl font-black text-text-primary tracking-tighter italic leading-none">{pacote.nome}</h3>
                        <p className="text-sm text-text-secondary font-medium leading-relaxed opacity-80">{pacote.description}</p>
                     </div>

                     <div className="mt-8 pt-8 border-t border-border-custom flex items-center justify-between">
                        <p className="text-3xl font-black text-text-primary tracking-tighter italic">R$ {pacote.preco}</p>
                        <Link 
                          href={`/checkout/pacote/${pacote.id}`}
                          className="px-8 py-4 bg-text-primary text-background rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl flex items-center gap-2"
                        >
                           Ver Ofertas <ShoppingBag className="w-4 h-4" />
                        </Link>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  )
}
