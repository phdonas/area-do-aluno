import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ChevronLeft, ShoppingCart, Info, Layers } from 'lucide-react'

export default async function SalesPacotePage({
  params,
}: {
  params: Promise<{ pacoteId: string }>
}) {
  const { pacoteId } = await params
  const supabase = await createClient()

  const { data: pacote } = await supabase
    .from('planos')
    .select('*')
    .eq('id', pacoteId)
    .single()

  if (!pacote) notFound()

  // Buscar cursos atrelados para compor o pitch de vendas
  let cursos: any[] = []
  if (pacote.is_global) {
     const { data } = await supabase.from('cursos').select('titulo').eq('status', 'publicado')
     cursos = data || []
  } else {
     const { data } = await supabase
       .from('planos_cursos')
       .select('cursos(titulo)')
       .eq('plano_id', pacoteId)
     
     cursos = (data?.map(d => d.cursos) as any[]).filter(Boolean) || []
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
         <ChevronLeft className="w-4 h-4" /> Voltar para Vitrine
      </Link>

      <div className="bg-surface border border-border-custom shadow-sm rounded-3xl overflow-hidden">
         <div className="bg-gradient-to-br from-indigo-900 via-primary to-primary-light p-10 md:p-16 text-center text-white relative">
            <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg border border-white/10 mb-6">
               OFERTA DE PACOTE COMPLETO
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
               {pacote.nome}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
               {pacote.descricao}
            </p>
         </div>
         
         <div className="p-8 md:p-12 lg:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
               <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                     <Layers className="w-6 h-6 text-primary" /> O que você leva neste pacote:
                  </h3>
                  
                  {pacote.is_global && (
                     <div className="bg-primary/10 text-primary-dark p-4 rounded-xl border border-primary/20 mb-6 font-medium text-sm flex gap-3">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        Este pacote é GLOBAL. Ele garante desbloqueio a 100% dos cursos da plataforma!
                     </div>
                  )}

                  <ul className="space-y-4">
                     {cursos.map((c, i) => (
                        <li key={i} className="flex gap-3 text-text-secondary bg-background border border-border-custom p-4 rounded-xl">
                           <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                           <span className="font-medium text-sm text-text-primary">{c.titulo}</span>
                        </li>
                     ))}
                  </ul>
               </div>

               <div className="bg-background shadow-md border border-border-custom rounded-3xl p-8 sticky top-24">
                  <div className="text-center mb-6">
                     <p className="text-sm text-text-secondary uppercase tracking-widest font-bold mb-2">Desbloqueio Imediato</p>
                     <h4 className="text-3xl font-black text-text-primary">Torne-se Aluno VIP</h4>
                  </div>
                  
                  <button className="w-full py-4 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-primary/20 text-lg">
                     <ShoppingCart className="w-6 h-6" />
                     Adquirir Pacote
                  </button>
                  <p className="text-xs text-center text-text-muted mt-4">
                     Pagamento seguro via Mercado Pago. Acesso liberado no mesmo instante.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
