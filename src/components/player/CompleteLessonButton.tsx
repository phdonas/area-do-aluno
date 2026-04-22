'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { toggleAulaConcluida } from '@/app/(protected)/player/actions'

interface CompleteLessonButtonProps {
  aulaId: string
  isConcluida: boolean
  cursoId: string
}

export function CompleteLessonButton({ aulaId, isConcluida, cursoId }: CompleteLessonButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  async function handleToggle() {
    try {
      setLoading(true)
      const result = await toggleAulaConcluida(aulaId, !isConcluida, cursoId)
      
      if (result?.success) {
        if (!isConcluida) {
          toast.success("Aula concluída! +5 PH Coins")
        } else {
          toast.info("Progresso removido")
        }
        
        // Força a atualização de todos os Server Components na página (incluindo a sidebar)
        router.refresh()
      } else {
        toast.error("Erro ao salvar progresso")
      }
    } catch (error) {
      toast.error("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`
        w-full md:w-auto flex items-center justify-center gap-4 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all
        ${isConcluida 
          ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/25' 
          : 'bg-background border border-border-custom text-text-primary hover:border-primary/50'}
        ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}
      `}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle2 className={`w-5 h-5 ${isConcluida ? 'text-white' : 'text-emerald-500'}`} />
      )}
      {loading ? 'Processando...' : (isConcluida ? 'Aula Finalizada' : 'Concluir esta Aula')}
    </button>
  )
}
