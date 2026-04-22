'use client'

import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, Loader2, ExternalLink, X } from 'lucide-react'

function ExternalSimulatorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const url = searchParams.get('url')
  const titulo = searchParams.get('titulo') || 'Ferramenta Externa'
  const tipo = searchParams.get('tipo') || 'Simulador Interativo'

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-8 text-center">
        <h2 className="text-xl font-black text-text-primary uppercase tracking-widest mb-4">URL não fornecida</h2>
        <button onClick={() => router.back()} className="btn-flow btn-flow-primary px-8">Voltar</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* BOTÃO SAIR GLOBAL (Top Right) */}
      <div className="fixed top-6 right-6 z-[200]">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-border-custom rounded-full shadow-lg hover:shadow-xl transition-all group active:scale-95"
        >
          <div className="w-5 h-5 flex items-center justify-center bg-rose-500 rounded-full text-white">
            <X size={14} strokeWidth={3} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">SAIR E VOLTAR</span>
        </button>
      </div>

      {/* Header do Player */}
      <div className="bg-surface border-b border-border-custom px-4 py-3 shadow-sm z-50">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-sm font-black text-text-primary uppercase tracking-widest leading-none">{titulo}</h1>
              <p className="text-[10px] font-bold text-indigo-500 leading-none mt-1 uppercase tracking-wider">{tipo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Área do Simulador */}
      <div className="flex-1 relative bg-[#0A0F1E]">
        <iframe 
          src={url} 
          className="absolute inset-0 w-full h-full border-none"
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}

export default function ExternalSimulatorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ExternalSimulatorContent />
    </Suspense>
  )
}
