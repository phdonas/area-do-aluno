'use client'

import { Printer } from 'lucide-react'

export function PrintCertButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="px-6 py-3 bg-surface border border-border-custom rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/5 transition-all flex items-center gap-2"
    >
      <Printer className="w-4 h-4" /> Imprimir / PDF
    </button>
  )
}
