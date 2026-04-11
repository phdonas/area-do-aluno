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
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSimularCompra = async () => {
    setLoading(true)
    try {
      // 1. "Envia e Recebe" - Simulação Completa
      const res = await simularMatricula(cursoId, userEmail)
      
      if (res?.success) {
        // 2. Redireciona para página de sucesso
        router.push(`/checkout/sucesso?curso_id=${cursoId}&status=approved&via=simulacao`)
      } else {
        alert('Falha na simulação: ' + (res?.error || 'Tente novamente.'))
      }
    } catch (error) {
      console.error('Simulation error:', error)
      alert('Falha interna no motor de simulação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleSimularCompra}
      disabled={loading}
      className="w-full py-5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-600/30 relative z-10 disabled:opacity-70 disabled:cursor-not-allowed group uppercase tracking-widest text-[11px]"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <ShoppingCart className="w-5 h-5 group-hover:rotate-[-10deg] transition-transform" />
      )}
      {loading ? 'Processando Matrícula...' : label}
    </button>
  )
}
