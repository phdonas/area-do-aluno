"use client"

import { useRouter } from "next/navigation"
import { Filter } from "lucide-react"

interface AdminFiltersProps {
  periodo: string
  cursoId?: string
  cursosLista: { id: string; titulo: string }[] | null
}

export default function AdminFilters({ periodo, cursoId, cursosLista }: AdminFiltersProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-text-muted ml-2" />
      <select 
        className="bg-background border border-border-custom rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:border-indigo-600"
        onChange={(e) => {
          const val = e.target.value;
          router.push(`/admin?periodo=${periodo}${val ? `&cursoId=${val}` : ''}`)
        }}
        defaultValue={cursoId || ''}
      >
        <option value="">Todos os Cursos</option>
        {cursosLista?.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
      </select>
    </div>
  )
}
