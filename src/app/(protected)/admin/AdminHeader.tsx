'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export function AdminHeader() {
  const pathname = usePathname()

  if (pathname === '/admin') {
    return null
  }

  return (
    <div className="mb-6">
      <Link 
        href="/admin" 
        className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border-custom hover:bg-black/5 hover:border-text-muted rounded-xl text-text-primary text-sm font-bold transition-all shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar para o Menu Gestor
      </Link>
    </div>
  )
}
