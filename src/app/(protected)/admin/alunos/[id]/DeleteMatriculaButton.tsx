'use client'

import { Trash2 } from 'lucide-react'

export function DeleteMatriculaButton() {
  return (
    <button 
      type="submit"
      className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
      title="Cancelar Acesso"
      onClick={(e) => {
        if (!confirm('Cortar acesso deste aluno a este pacote?')) {
          e.preventDefault()
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
