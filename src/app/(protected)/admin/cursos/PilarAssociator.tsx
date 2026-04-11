'use client'

import { useState } from 'react'
import { togglePilarCurso } from './actions'

type Pilar = {
  id: string
  nome: string
  cor_badge: string
}

export function PilarAssociator({ 
  cursoId, 
  todosPilares, 
  pilaresAtivos 
}: { 
  cursoId: string
  todosPilares: Pilar[]
  pilaresAtivos: string[] 
}) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (pilarId: string, isAtivo: boolean) => {
    setLoading(true);
    try {
      if (isAtivo) {
        // Se estava ativo, desassocia
        await togglePilarCurso(cursoId, pilarId, false);
      } else {
        // Se não estava ativo, associa
        await togglePilarCurso(cursoId, pilarId, true);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar associação de pilar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-text-primary">Associação a Pilares</h2>
        <p className="text-sm text-text-secondary mt-1">
          Em quais prateleiras / categorias principais o aluno vai encontrar este curso?
        </p>
      </div>
      
      {todosPilares.length === 0 ? (
        <div className="p-4 bg-background border border-border-custom rounded-xl text-center text-sm text-text-muted">
          Você ainda não cadastrou nenhum Pilar no sistema.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {todosPilares.map(pilar => {
            const isAtivo = pilaresAtivos.includes(pilar.id);
            return (
              <button
                key={pilar.id}
                type="button"
                disabled={loading}
                onClick={() => handleToggle(pilar.id, isAtivo)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isAtivo 
                    ? 'border-primary bg-primary/5 text-text-primary' 
                    : 'border-border-custom bg-background opacity-70 hover:opacity-100 hover:border-text-muted text-text-secondary'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: pilar.cor_badge || '#3b82f6' }}
                />
                <span className="font-medium text-sm truncate flex-1">{pilar.nome}</span>
                {isAtivo && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">Ativo</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
