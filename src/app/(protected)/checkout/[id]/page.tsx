'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, ShieldCheck, CheckCircle2, Zap, ArrowRight, Star, 
  Tag, Loader2, AlertCircle, ShoppingCart, Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResumoPedidoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [produto, setProduto] = useState<any>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponStatus, setCouponStatus] = useState<{valid?: boolean, error?: string, discount?: number}>({})
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    const fetchProduto = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cursos')
        .select('*, planos_cursos(planos(*))')
        .eq('id', id)
        .single()
      
      if (error) {
        console.error(error)
        router.push('/catalogo')
      } else {
        setProduto(data)
      }
      setLoading(false)
    }
    fetchProduto()
  }, [id, router])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    setCouponStatus({})
    
    // Chamada simples para a API que criaremos para validar cupom sem criar preferência
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

  const handleCheckout = async () => {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/pagamentos/criar-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cursoId: id, 
          cupomCodigo: couponStatus.valid ? couponCode : undefined 
        })
      })
      const data = await res.json()
      
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        alert(data.error || 'Erro ao gerar checkout.')
        setCheckingOut(false)
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.')
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

  const precoOriginal = Number(produto.planos_cursos?.[0]?.planos?.preco_mensal || produto.preco || 0)
  const precoFinal = couponStatus.valid ? Math.max(0, precoOriginal - (couponStatus.discount || 0)) : precoOriginal

  return (
    <main className="min-h-screen bg-background text-text-primary p-6 md:p-12 lg:p-24 relative overflow-hidden">
       {/* Ambient Lighting */}
       <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
       
       <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/catalogo" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-12">
            <ChevronLeft className="w-4 h-4" /> Voltar ao Catálogo
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-20">
             
             {/* 📦 DETALHES DO CURSO */}
             <div className="lg:col-span-3 space-y-12">
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">Elite Membership</span>
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2 italic">
                         <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Best Seller 2024
                      </span>
                   </div>
                   <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-text-primary">
                     {produto.titulo}
                   </h1>
                   <p className="text-lg text-text-muted font-medium max-w-xl">
                      Você está a um passo de destravar seu acesso exclusivo ao ecossistema Vortex. Confirme os valores e prossiga para o checkout seguro.
                   </p>
                </div>

                <div className="aspect-video rounded-[3rem] overflow-hidden border border-white/5 shadow-3xl relative group">
                   <img src={produto.thumb_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"} alt="Course" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">
                      <div className="flex items-center gap-4 text-white">
                         <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                         </div>
                         <p className="font-bold text-sm">Curso completo com certificação oficial inclusa.</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* 💰 CHECKOUT FINANCEIRO */}
             <div className="lg:col-span-2">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-surface/50 backdrop-blur-3xl border border-border-custom p-10 rounded-[3.5rem] shadow-3xl sticky top-12"
                >
                   <div className="flex items-center justify-between mb-10">
                      <h2 className="text-xl font-black text-text-primary italic tracking-tight">Checkout Seguro</h2>
                      <ShoppingCart className="w-6 h-6 text-text-muted opacity-30" />
                   </div>
                   
                   {/* Itens */}
                   <div className="space-y-6 pb-8 border-b border-border-custom">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                         <span className="text-text-muted">Acesso Vitalício</span>
                         <span className="text-text-primary">R$ {precoOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      {/* Desconto */}
                      <AnimatePresence>
                         {couponStatus.valid && (
                            <motion.div 
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: 'auto' }}
                               className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-emerald-500"
                            >
                               <span>Cupom Aplicado</span>
                               <span>- R$ {couponStatus.discount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </motion.div>
                         )}
                      </AnimatePresence>

                      <div className="pt-6">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">TOTAL FINAL:</span>
                            <div className="text-right">
                               {couponStatus.valid && (
                                 <span className="block text-[10px] text-text-muted line-through mb-1">R$ {precoOriginal.toLocaleString('pt-BR')}</span>
                               )}
                               <span className="text-5xl font-black text-text-primary tracking-tighter">
                                 R$ {precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                               </span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* CUPOM INPUT */}
                   <div className="py-8 space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Possui um Código Promocional?</label>
                      <div className="flex gap-2">
                         <div className="relative flex-1">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                            <input 
                               type="text" 
                               placeholder="CÓDIGO DE ELITE"
                               className="w-full h-14 pl-10 pr-4 bg-background border border-border-custom rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary outline-none transition-all placeholder:opacity-50"
                               value={couponCode}
                               onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            />
                         </div>
                         <button 
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon || !couponCode}
                            className="px-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30"
                         >
                            {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Aplicar'}
                         </button>
                      </div>
                      {couponStatus.error && (
                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-2">
                           <AlertCircle className="w-3 h-3" /> {couponStatus.error}
                        </p>
                      )}
                   </div>

                   <button 
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className="w-full bg-primary hover:bg-primary-dark text-white h-20 rounded-2xl font-ex-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                   >
                      {checkingOut ? <Loader2 className="w-6 h-6 animate-spin" /> : <>FINALIZAR PEDIDO <ArrowRight className="w-5 h-5" /></>}
                   </button>

                   <div className="mt-10 pt-10 border-t border-border-custom space-y-6">
                      <div className="flex items-center gap-3 text-emerald-500">
                         <Lock className="w-4 h-4" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em]">Security Protocol Active</span>
                      </div>
                      <p className="text-[10px] text-text-muted font-medium text-center italic leading-relaxed">
                        Ao clicar em finalizar, você será redirecionado para o ambiente seguro do Mercado Pago para processar sua transação via PIX ou Cartão.
                      </p>
                   </div>
                </motion.div>
             </div>

          </div>
       </div>
    </main>
  )
}
