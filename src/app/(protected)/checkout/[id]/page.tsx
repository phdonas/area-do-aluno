'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, ShieldCheck, CheckCircle2, Zap, ArrowRight, Star, 
  Tag, Loader2, AlertCircle, ShoppingCart, Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { simularCompraMatricula } from './actions'

export default function ResumoPedidoPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planoId = searchParams.get('plano')
  
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [produto, setProduto] = useState<any>(null)
  const [checkoutConfig, setCheckoutConfig] = useState<any>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponStatus, setCouponStatus] = useState<{valid?: boolean, error?: string, discount?: number}>({})
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [region, setRegion] = useState<'BR' | 'PT' | 'Global'>('BR')
  const [payMethod, setPayMethod] = useState<'auto' | 'manual'>('auto')
  const [finConfig, setFinConfig] = useState<any>(null)

  useEffect(() => {
    const fetchDados = async () => {
      const supabase = createClient()
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id as string)
      const query = supabase.from('cursos').select('*, planos_cursos(*, planos(*))')
      
      if (isUUID) {
        query.or(`id.eq.${id},slug.eq.${id}`)
      } else {
        query.eq('slug', id)
      }

      const { data: cursoData } = await query.single()
      
      setProduto(cursoData)

      // Busca Configs de Marketing
      const { data: configData } = await supabase
        .from('configuracoes_checkout')
        .select('*')
        .eq('key', 'default')
        .single()
      
      setCheckoutConfig(configData)

      // Busca Configs Financeiras
      const { data: finData } = await supabase
        .from('configuracoes_financeiras')
        .select('*')
        .single()
      
      setFinConfig(finData)
      setLoading(false)
    }
    fetchDados()
  }, [id, router])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    setCouponStatus({})
    
    try {
      const res = await fetch('/api/cupons/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: couponCode, cursoId: id })
      })
      const data = await res.json()
      
      if (data.valid) {
        setCouponStatus({ valid: true, discount: data.valorDesconto })
      } else {
        setCouponStatus({ valid: false, error: data.error })
      }
    } catch (err) {
      setCouponStatus({ valid: false, error: 'Erro ao validar cupom.' })
    } finally {
      setValidatingCoupon(false)
    }
  }

  // Determinar a oferta (plano) selecionada
  const ofertaSelecionada = planoId 
    ? produto?.planos_cursos?.find((pc: any) => pc.plano_id === planoId)
    : produto?.planos_cursos?.[0]

  const handleManualNotification = async () => {
    setCheckingOut(true)
    try {
      const { notificarPagamentoManual } = await import('./manual-actions')
      const res = await notificarPagamentoManual({
        cursoId: produto.id,
        planoId: ofertaSelecionada?.plano_id,
        metodo: region === 'BR' ? 'pix_direto' : (region === 'PT' ? 'mbway_direto' : 'transferencia'),
        pais: region,
        valor: precoFinal,
        moeda: region === 'BR' ? 'R$' : '€'
      })

      if (res.success) {
        router.push(`/checkout/sucesso?manual=true&curso_id=${id}`)
      } else {
        alert(res.error)
      }
    } catch (err) {
      alert('Erro ao processar aviso de pagamento.')
    } finally {
      setCheckingOut(false)
    }
  }

  const handleCheckout = async () => {
    if (payMethod === 'manual') {
      return handleManualNotification()
    }

    setCheckingOut(true)
    try {
      const result = await simularCompraMatricula(
        id as string, 
        couponStatus.valid ? couponCode : undefined,
        ofertaSelecionada?.plano_id
      )
      
      if (result.success) {
        const successUrl = `/checkout/sucesso?curso_id=${id}`
        router.push(successUrl)
      } else {
        alert(result.error || 'Falha ao processar simulação de checkout')
      }
    } catch (err) {
      alert('Ocorreu um erro na simulação de compra.')
    } finally {
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Preparando seu ambiente de checkout...</p>
      </div>
    )
  }

  const precoOriginalBRL = Number(ofertaSelecionada?.valor_venda || 0)
  // Taxa de conversão estimada para demonstração (pode ser configurável no futuro)
  const precoOriginal = region === 'BR' ? precoOriginalBRL : Math.round(precoOriginalBRL / 6)
  
  const precoFinal = couponStatus.valid ? Math.max(0, precoOriginal - (couponStatus.discount || 0)) : precoOriginal

  return (
    <main className="min-h-screen bg-[#050505] text-text-primary selection:bg-primary/30 py-4 md:py-16 px-4 md:px-12 lg:px-24 relative overflow-x-hidden font-sans">
       <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
       <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
       
       <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-16">
            <Link href="/catalogo" className="group flex items-center gap-3 text-text-muted hover:text-primary transition-all text-[11px] font-black uppercase tracking-[0.25em]">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </div>
              Voltar ao Catálogo
            </Link>
            <div className="flex items-center gap-4">
               <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                  <button onClick={() => setRegion('BR')} className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${region === 'BR' ? 'bg-primary text-white' : 'text-text-muted'}`}>BR</button>
                  <button onClick={() => setRegion('PT')} className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${region === 'PT' ? 'bg-primary text-white' : 'text-text-muted'}`}>PT</button>
                  <button onClick={() => setRegion('Global')} className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${region === 'Global' ? 'bg-primary text-white' : 'text-text-muted'}`}>INTL</button>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-start">
             
             <div className="lg:col-span-8 space-y-12 lg:pr-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                   <div className="flex flex-wrap items-center gap-3">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-amber-500/30 shadow-lg shadow-amber-500/5">
                        {checkoutConfig?.badge_topo || 'Acesso Elite • Vitalício'}
                      </span>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                         <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                         <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">
                           {checkoutConfig?.tagline_topo || 'Altamente Recomendado'}
                         </span>
                      </div>
                   </div>

                   <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-white max-w-3xl italic">
                     {produto.titulo}
                   </h1>

                   <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm max-w-xl">
                      <Zap className="w-6 h-6 text-primary shrink-0" />
                      <p className="text-sm text-text-muted font-medium leading-relaxed">
                        {checkoutConfig?.texto_intro || 'Prepare-se para uma transformação profunda. Você está prestes a ingressar na elite do conhecimento técnico.'}
                      </p>
                   </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BenefitCard 
                      icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} 
                      title="Curso com Certificado" 
                      desc="Válido em todo território nacional" 
                    />
                    <BenefitCard 
                      icon={<Lock className="w-5 h-5 text-indigo-500" />} 
                      title={checkoutConfig?.beneficio_2_titulo || 'Acesso Imediato'} 
                      desc={checkoutConfig?.beneficio_2_desc || 'Login liberado após a confirmação'} 
                    />
                    <BenefitCard 
                      icon={<Zap className="w-5 h-5 text-amber-500" />} 
                      title={checkoutConfig?.beneficio_3_titulo || 'Update Contínuo'} 
                      desc={checkoutConfig?.beneficio_3_desc || 'Novas aulas inclusas sem custos'} 
                    />
                    <BenefitCard 
                      icon={<ShieldCheck className="w-5 h-5 text-blue-500" />} 
                      title="Suporte Especializado" 
                      desc="Tire dúvidas direto com o professor" 
                    />
                </div>

                <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative group aspect-video">
                   <img src={produto.thumb_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"} alt="Course Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                   <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white shadow-sm">Garantia de Satisfação: 7 dias para cancelar sem custos</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="lg:col-span-4">
                <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.2 }}
                   className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl lg:sticky lg:top-12"
                >
                   <div className="flex gap-2 mb-8 p-1 bg-black/40 rounded-2xl border border-white/5">
                      <button 
                        onClick={() => setPayMethod('auto')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${payMethod === 'auto' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'}`}
                      >
                        Automático
                      </button>
                      <button 
                        onClick={() => setPayMethod('manual')}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${payMethod === 'manual' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-text-muted hover:text-white'}`}
                      >
                        {region === 'BR' ? 'PIX Direto' : 'MBWay / Transf'}
                      </button>
                   </div>

                   <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight">Resumo da Compra</h2>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">
                          {region === 'Global' ? 'International Checkout' : 'Sua jornada começa aqui'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-primary" />
                      </div>
                   </div>
                   
                   <div className="space-y-6 pb-8 border-b border-white/5">
                      <div className="flex justify-between items-center group">
                         <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Acesso Ilimitado</span>
                         <span className="text-base font-black text-white italic">
                            {region === 'BR' ? 'R$' : '€'} {precoOriginal.toLocaleString(region === 'BR' ? 'pt-BR' : 'pt-PT', { minimumFractionDigits: 2 })}
                         </span>
                      </div>
                      
                      <AnimatePresence>
                         {couponStatus.valid && (
                            <motion.div 
                               initial={{ opacity: 0, scale: 0.9 }}
                               animate={{ opacity: 1, scale: 1 }}
                               className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400"
                            >
                               <span className="flex items-center gap-2 font-black"><Tag className="w-3.5 h-3.5" /> Cupom Ativado</span>
                               <span>- {region === 'BR' ? 'R$' : '€'} {couponStatus.discount?.toLocaleString(region === 'BR' ? 'pt-BR' : 'pt-PT', { minimumFractionDigits: 2 })}</span>
                            </motion.div>
                         )}
                      </AnimatePresence>

                       <div className="pt-4 mt-4">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">TOTAL:</span>
                             <div className="text-right pr-6">
                                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent italic">
                                   {precoFinal === 0 ? (
                                     <span className="text-primary">GRÁTIS</span>
                                   ) : (
                                     <>
                                       {region === 'BR' ? 'R$' : '€'} {precoFinal.toLocaleString(region === 'BR' ? 'pt-BR' : 'pt-PT', { minimumFractionDigits: 2 })}
                                     </>
                                   )}
                                </span>
                             </div>
                          </div>
                       </div>
                   </div>

                   <div className="py-8 min-h-[140px]">
                      {precoFinal > 0 && (
                        payMethod === 'manual' ? (
                          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-3xl space-y-3">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Dados para Pagamento Direto:</h4>
                               {region === 'BR' ? (
                                 <div className="space-y-2">
                                    <p className="text-xs text-text-primary font-bold">Resgate via PIX (Chave):</p>
                                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] font-mono break-all text-amber-200 select-all">
                                      {finConfig?.chave_pix_br}
                                    </div>
                                    <p className="text-[9px] text-text-muted font-medium uppercase tracking-tight">Favorecido: {finConfig?.favorecido_br}</p>
                                 </div>
                               ) : (
                                 <div className="space-y-2">
                                    <p className="text-xs text-text-primary font-bold">Resgate via MBWay:</p>
                                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] font-mono text-amber-200 select-all">
                                      {finConfig?.mbway_telemovel_pt}
                                    </div>
                                    {finConfig?.iban_pt && (
                                      <>
                                        <p className="text-xs text-text-primary font-bold mt-3">Ou Transferência (IBAN):</p>
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono break-all text-amber-200 select-all">
                                          {finConfig?.iban_pt}
                                        </div>
                                      </>
                                    )}
                                    <p className="text-[9px] text-text-muted font-medium uppercase tracking-tight">Favorecido: {finConfig?.favorecido_pt}</p>
                                 </div>
                               )}
                            </div>
                            <p className="text-[9px] text-center text-text-muted italic">Após pagar, clique abaixo para nos avisar. Liberaremos seu acesso manualmente em instantes.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                             <div className="flex justify-between items-center px-1">
                               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Promo Code</label>
                               {couponStatus.valid && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">✓ Aplicado</span>}
                             </div>
                             <div className="relative group">
                                <input 
                                   type="text" 
                                   placeholder="CÓDIGO DE ELITE"
                                   className="w-full h-16 pl-6 pr-32 bg-black/40 border-2 border-white/5 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] focus:border-primary/50 outline-none transition-all placeholder:text-white/20"
                                   value={couponCode}
                                   onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                />
                                <button 
                                   onClick={handleApplyCoupon}
                                   disabled={validatingCoupon || !couponCode}
                                   className="absolute right-2 top-2 bottom-2 px-6 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-transparent transition-all disabled:opacity-30 disabled:hover:bg-white/5"
                                >
                                   {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Validar'}
                                </button>
                             </div>
                          </div>
                        )
                      )}
                      {precoFinal === 0 && (
                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl text-center">
                           <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-3" />
                           <p className="text-[10px] font-black text-text-primary uppercase tracking-widest leading-relaxed">
                             Esta oferta é totalmente gratuita.<br/>Clique abaixo para liberar seu acesso!
                           </p>
                        </div>
                      )}
                   </div>

                   <button 
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className={`group w-full min-h-[4.5rem] py-6 px-4 rounded-2xl font-black text-[11px] md:text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-2 shadow-2xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 relative overflow-hidden italic whitespace-normal text-center ${precoFinal === 0 ? 'bg-primary text-white' : (payMethod === 'manual' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-primary hover:bg-primary-dark text-white')}`}
                   >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      {checkingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          {precoFinal === 0 ? 'Ativar Meu Acesso Gratuito Agora' : (payMethod === 'manual' ? 'Já realizei o Pagamento Direto' : 'Ativar Minha Matrícula Agora')} 
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                        </>
                      )}
                   </button>

                   <div className="mt-10 pt-10 border-t border-white/5">
                      <div className="flex items-center justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                        <div className="w-10 h-6 bg-white/10 rounded-sm" />
                        <div className="w-10 h-6 bg-white/10 rounded-sm" />
                        <div className="w-10 h-6 bg-white/10 rounded-sm" />
                        <div className="w-10 h-6 bg-white/10 rounded-sm" />
                      </div>
                      
                      <div className="mt-10 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl flex items-start gap-4">
                         <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                         </div>
                         <div>
                            <p className="text-[11px] font-black text-text-primary uppercase tracking-widest">Protocolo Seguro Ativo</p>
                            <p className="text-[10px] text-text-muted font-medium mt-1 leading-relaxed">
                               {checkoutConfig?.texto_seguranca || 'Seus dados são criptografados de ponta a ponta via SSL de 256 bits. Transação processada pelo Mercado Pago.'}
                            </p>
                         </div>
                      </div>
                   </div>
                </motion.div>
             </div>

          </div>
       </div>
    </main>
  )
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-5 rounded-2xl border border-white/5 hover:bg-white/[0.03] transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
         <h3 className="text-[11px] md:text-xs font-black text-white uppercase tracking-wider">{title}</h3>
        <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-1 leading-tight">{desc}</p>
      </div>
    </div>
  )
}
