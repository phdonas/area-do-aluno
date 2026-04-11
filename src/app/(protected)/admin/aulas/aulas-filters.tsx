'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect, Suspense } from 'react'

export function AulasFilters() {
  return (
    <Suspense fallback={<div className="h-20 bg-surface animate-pulse rounded-xl mb-4" />}>
      <AulasFiltersComponent />
    </Suspense>
  )
}

function AulasFiltersComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pathname = usePathname()
  const [titulo, setTitulo] = useState(searchParams.get('titulo') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at-desc')

  // Using a debounce for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentParams = new URLSearchParams(searchParams.toString())
      const nextParams = new URLSearchParams(searchParams.toString())
      
      if (titulo) {
        nextParams.set('titulo', titulo)
      } else {
        nextParams.delete('titulo')
      }
      
      if (status !== 'all') {
        nextParams.set('status', status)
      } else {
        nextParams.delete('status')
      }

      if (sortBy !== 'created_at-desc') {
        nextParams.set('sortBy', sortBy)
      } else {
        nextParams.delete('sortBy')
      }
      
      // Only push if something actually changed AND we are still on the aulas list page
      // to avoid interrupting other navigations (like "Nova Aula")
      if (nextParams.toString() !== currentParams.toString() && pathname === '/admin/aulas') {
        router.push(`?${nextParams.toString()}`)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [titulo, status, sortBy, router, searchParams, pathname])

  return (
    <div className="bg-surface border border-border-custom p-4 rounded-xl mb-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
      <div className="flex-1 w-full flex flex-col gap-1">
        <label className="text-xs font-bold text-text-muted uppercase">Buscar por Título</label>
        <input 
          type="text" 
          placeholder="Ex: Como configurar..." 
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full bg-background border border-border-custom rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
        />
      </div>

      <div className="w-full md:w-48 flex flex-col gap-1">
        <label className="text-xs font-bold text-text-muted uppercase">Status/Propriedade</label>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-background border border-border-custom rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
        >
          <option value="all">Todos</option>
          <option value="solto">Acervo Solto</option>
          <option value="vinculado">Vinculada Estaticamente</option>
        </select>
      </div>

      <div className="w-full md:w-48 flex flex-col gap-1">
        <label className="text-xs font-bold text-text-muted uppercase">Ordenar por</label>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-background border border-border-custom rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
        >
          <option value="created_at-desc">Mais Recentes</option>
          <option value="created_at-asc">Mais Antigas</option>
          <option value="titulo-asc">Título (A-Z)</option>
          <option value="titulo-desc">Título (Z-A)</option>
          <option value="status-asc">Status (Soltos 1º)</option>
          <option value="status-desc">Status (Vinculados 1º)</option>
        </select>
      </div>
    </div>
  )
}
