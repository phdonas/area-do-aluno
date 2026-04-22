'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useTransition } from 'react'

export function DeleteButton({ 
  id, 
  action 
}: { 
  id: string, 
  action: () => Promise<{ success: boolean, error?: string }> 
}) {
  const { success, error } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    if(!confirm('Certeza que deseja deletar permanentemente este curso? Pilares e Módulos globais NÃO SERÃO DELETADOS, mas a estrutura do curso montada aqui será quebrada e alunos perderão o acesso à jornada.')) {
      return
    }

    startTransition(async () => {
      try {
        const result = await action()
        if (result.success) {
          success('Curso excluído com sucesso!')
        } else if (result.error) {
          error(result.error)
        }
      } catch (e) {
        error('Erro inesperado ao excluir curso.')
        console.error(e)
      }
    })
  }

  return (
    <button 
      type="button" 
      disabled={isPending}
      onClick={handleDelete}
      className="p-2 text-text-secondary hover:text-red-500 bg-background border border-border-custom hover:border-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Excluir Curso"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  )
}
