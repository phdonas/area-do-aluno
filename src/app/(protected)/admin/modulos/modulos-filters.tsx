'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'

export function ModulosFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [titulo, setTitulo] = useState(searchParams.get('titulo') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at-desc')

  // Using a debounce for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams()
      if (titulo) {
        params.set('titulo', titulo)
      }
      
      if (status !== 'all') {
        params.set('status', status)
      }

      if (sortBy !== 'created_at-desc') {
        params.set('sortBy', sortBy)
      }
      
      const newQuery = params.toString()
      const currentQuery = searchParams.toString()
      
      if (newQuery !== currentQuery) {
        router.push(`?${newQuery}`)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [titulo, status, sortBy, router, searchParams])

  return (
    <div className="bg-surface border border-border-custom p-4 rounded-xl mb-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
      <div className="flex-1 w-full flex flex-col gap-1">
        <label className="text-xs font-bold text-text-muted uppercase">Buscar por Título</label>
        <input 
          type="text" 
          placeholder="Ex: Introdução..." 
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
          <option value="global">Global (Biblioteca)</option>
          <option value="isolado">Isolado/Legado</option>
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
          <option value="status-asc">Status (Globais 1º)</option>
          <option value="status-desc">Status (Isolados 1º)</option>
        </select>
      </div>
    </div>
  )
}
