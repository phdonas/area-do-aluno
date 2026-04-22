'use client'

import React, { useState } from 'react'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { simularMatricula } from '@/app/(protected)/loja/curso/actions'

interface CheckoutButtonProps {
  cursoId: string
  userEmail: string
  label?: string
}

/**
 * ATENÇÃO: Atualmente configurado para MODO SIMULAÇÃO (Fase de Testes).
 * Não envia para o Mercado Pago real, registra a matrícula direto no banco.
 */
export default function CheckoutButton({ cursoId, userEmail, label = 'Garantir Vaga no Curso' }: CheckoutButtonProps) {
  const router = useRouter()

  const handleGoToCheckout = () => {
    router.push(`/checkout/${cursoId}`)
  }

  return (
    <button 
      onClick={handleGoToCheckout}
      className="w-full py-5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-600/30 relative z-10 group uppercase tracking-widest text-[11px] overflow-hidden"
    >
      <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none" />
      <ShoppingCart className="w-5 h-5 group-hover:rotate-[-10deg] transition-transform" />
      {label}
    </button>
  )
}
