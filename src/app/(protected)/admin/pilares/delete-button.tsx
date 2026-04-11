'use client'

import { Trash2 } from 'lucide-react'
import { ReactNode } from 'react'

export function DeleteButton({ 
  id, 
  action 
}: { 
  id: string, 
  action: (formData: FormData) => void 
}) {
  return (
    <form action={action}>
      <button 
        type="submit" 
        className="p-2 text-text-secondary hover:text-red-500 bg-background border border-border-custom hover:border-red-500/30 rounded-lg transition-colors"
        onClick={(e) => {
          if(!confirm('Certeza que deseja deletar este pilar? Todos os cursos atrelados perderão essa referência.')) {
            e.preventDefault();
          }
        }}
        title="Excluir Pilar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  )
}
