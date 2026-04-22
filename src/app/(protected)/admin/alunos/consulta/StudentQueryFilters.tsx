'use client'

import { Search, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterProps {
  cursos: { id: string; titulo: string }[] | null
  cursoId?: string
  sort?: string
  q?: string
}

export function StudentQueryFilters({ cursos, cursoId, sort, q }: FilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    router.push(`/admin/alunos/consulta?${params.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* BUSCA E CURSO */}
      <div className="lg:col-span-8 bg-surface border border-border-custom p-3 rounded-[2rem] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFilterChange('q', (e.target as HTMLInputElement).value)
              }
            }}
            onBlur={(e) => handleFilterChange('q', e.target.value)}
            placeholder="Buscar por nome ou e-mail..." 
            className="w-full pl-12 pr-4 py-3 bg-background border border-border-custom rounded-2xl text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={cursoId || ''}
            onChange={(e) => handleFilterChange('cursoId', e.target.value)}
            className="flex-1 md:w-64 px-4 py-3 bg-background border border-border-custom rounded-2xl text-[12px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todos os Cursos</option>
            {cursos?.map(c => (
              <option key={c.id} value={c.id}>{c.titulo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ORDENAÇÃO */}
      <div className="lg:col-span-4 bg-surface border border-border-custom p-3 rounded-[2rem] flex items-center justify-between gap-3">
        <Filter className="w-4 h-4 text-text-muted ml-3" />
        <select 
          value={sort || 'date_desc'}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="flex-1 px-4 py-2 bg-background border border-border-custom rounded-2xl text-[12px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="date_desc">Mais Recentes</option>
          <option value="date_asc">Mais Antigos</option>
          <option value="name">Nome (A-Z)</option>
          <option value="progress">Melhor Progresso</option>
          <option value="end_date">Término Próximo</option>
        </select>
      </div>
    </div>
  )
}
