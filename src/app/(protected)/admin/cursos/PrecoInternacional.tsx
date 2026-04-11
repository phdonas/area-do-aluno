'use client'

import React, { useState } from 'react'
import { Landmark, RefreshCw, Euro, Banknote } from 'lucide-react'

interface PrecoInternacionalProps {
  valorReal: string
  valorEur: string
  onChangeEur: (val: string) => void
}

export function PrecoInternacional({ valorReal, valorEur, onChangeEur }: PrecoInternacionalProps) {
  const [loading, setLoading] = useState(false)
  const [cotacao, setCotacao] = useState<number | null>(null)

  const sugerirCambio = async () => {
    setLoading(true)
    try {
      // API gratuita para cotação de câmbio
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/BRL')
      const data = await res.json()
      const rate = data.rates.EUR
      setCotacao(rate)
      
      // Tentar extrair o número do preço em real (ex: "R$ 997,00" -> 997)
      const apenasNumeros = valorReal.replace(/[^\d,]/g, '').replace(',', '.')
      const numeroReal = parseFloat(apenasNumeros)
      
      if (!isNaN(numeroReal)) {
        const sugerido = numeroReal * rate
        // Sugerimos o valor arredondado para cima para ser mais "Premium"
        const arredondado = Math.ceil(sugerido)
        onChangeEur(`€ ${arredondado},00`)
      }
    } catch (error) {
      alert('Erro ao buscar cotação. Tente digitar manualmente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
      <div className="space-y-2">
        <label htmlFor="preco" className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wide">
          <Banknote className="w-3 h-3 text-emerald-500" /> Preço (Brasil)
        </label>
        <input 
          type="text" id="preco" name="preco" defaultValue={valorReal} placeholder="Ex: R$ 997,00"
          className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="preco_eur" className="flex items-center justify-between text-[10px] font-black text-text-primary uppercase tracking-widest h-5">
          <span className="flex items-center gap-1.5">
            <Euro className="w-3 h-3 text-indigo-500" /> Preço (€)
          </span>
          <button 
            type="button"
            onClick={sugerirCambio}
            disabled={loading}
            className="text-[9px] font-black text-primary hover:text-primary-dark flex items-center gap-1 transition-colors uppercase tracking-tight"
          >
            {loading ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Landmark className="w-2.5 h-2.5" />}
            Sugerir Câmbio
          </button>
        </label>
        <div className="relative">
          <input 
            type="text" id="preco_eur" name="preco_eur" value={valorEur} 
            onChange={(e) => onChangeEur(e.target.value)}
            placeholder="Ex: € 165,00"
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-indigo-500 transition-all text-sm pr-10"
          />
          {cotacao && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-text-muted font-mono">
              1 BRL = {cotacao.toFixed(4)} EUR
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
