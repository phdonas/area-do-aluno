'use client'

import React, { useState } from 'react'
import { AlertCircle, CreditCard, Zap, PlayCircle, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export function PriceCard({ curso, userEmail }: { curso: any, userEmail: string }) {
  const [selectedPlanoIdx, setSelectedPlanoIdx] = useState(0)
  
  const offers = curso.planos_cursos || []
  const currentOffer = offers[selectedPlanoIdx] || null
  
  if (!currentOffer) return (
    <div className="p-10 bg-surface border border-dashed border-border-custom rounded-[3rem] text-center">
       <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
       <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Este curso está temporariamente sem planos de venda ativos.</p>
    </div>
  )

  const numPrice = currentOffer.valor_venda
  const isFree = numPrice === 0

  const formatPreco = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-8">
      {/* SELETOR DE PLANOS (Se houver mais de um) */}
      {offers.length > 1 && (
        <div className="flex flex-wrap gap-4 justify-center">
           {offers.map((off: any, idx: number) => (
             <button 
               key={idx}
               onClick={() => setSelectedPlanoIdx(idx)}
               className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedPlanoIdx === idx ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface text-text-muted border-border-custom hover:border-white/20'}`}
             >
                {off.planos?.nome}
             </button>
           ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-12 p-16 bg-background border-2 border-border-custom rounded-[4rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:scale-150" />
        
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isFree ? 'bg-primary' : 'bg-emerald-500'}`} />
            <span className={`text-xs font-black uppercase tracking-[0.5em] ${isFree ? 'text-primary' : 'text-emerald-500'}`}>
              {isFree ? 'Oferta Exclusiva: Acesso Gratuito' : `Inscrição: ${currentOffer.planos?.nome}`}
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
              <div className="space-y-2">
                {currentOffer.valor_original > currentOffer.valor_venda && (
                  <span className="text-sm font-black text-text-muted line-through uppercase tracking-widest opacity-50">
                    De R$ {formatPreco(currentOffer.valor_original)}
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-text-muted">R$</span>
                  <span className="text-5xl md:text-7xl font-black text-text-primary tracking-tighter italic leading-none bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
                    {formatPreco(numPrice)}
                  </span>
                </div>
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
          <Link 
            href={`/checkout/${curso.id}?plano=${currentOffer.plano_id}`}
            className="w-full py-5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-600/30 relative z-10 group uppercase tracking-widest text-[11px] overflow-hidden text-center"
          >
            <PlayCircle className="w-5 h-5 group-hover:rotate-[-10deg] transition-transform" />
            {isFree ? "QUERO ME INSCREVER AGORA" : "QUERO GARANTIR MINHA VAGA"}
          </Link>
          <div className="flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-text-muted italic bg-surface/50 py-4 rounded-3xl border border-border-custom">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Transação 100% Segura
          </div>
        </div>
      </div>
    </div>
  )
}
