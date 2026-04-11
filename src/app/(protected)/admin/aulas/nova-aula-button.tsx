'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Plus, Loader2 } from 'lucide-react'

export function NovaAulaButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleNavigate = () => {
    startTransition(() => {
      router.push('/admin/aulas/novo')
    })
  }

  return (
    <button 
      onClick={handleNavigate}
      disabled={isPending}
      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-80"
      title="Cadastrar nova aula no acervo"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      {isPending ? 'Direcionando...' : 'Nova Aula'}
    </button>
  )
}
