'use client'

import { Trash2 } from 'lucide-react'

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
          if(!confirm('Certeza que deseja deletar permanentemente esta aula do banco de dados? Anexos vinculados podem ser perdidos.')) {
            e.preventDefault();
          }
        }}
        title="Excluir Aula"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  )
}
