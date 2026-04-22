'use client'

import { useState } from 'react'
import { togglePilarCurso } from './actions'
import { Layers } from 'lucide-react'

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
        await togglePilarCurso(cursoId, pilarId, false);
      } else {
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
    <div className="bg-surface border border-border-custom p-8 md:p-10 rounded-[2.5rem] shadow-xl mb-12 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
         <Layers className="w-24 h-24 text-primary" />
      </div>

      <div className="mb-8 relative z-10">
        <h2 className="text-2xl font-black text-text-primary italic uppercase tracking-tight flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-full" />
          Pilares Estratégicos
        </h2>
        <p className="text-sm text-text-secondary mt-2 font-medium">
          Em quais prateleiras este treinamento será exibido na Vitrine e no Catálogo?
        </p>
      </div>
      
      {todosPilares.length === 0 ? (
        <div className="p-10 bg-background border border-border-custom rounded-3xl text-center text-sm text-text-muted font-bold italic uppercase tracking-widest">
          Nenhum pilar estratégico configurado.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {todosPilares.map(pilar => {
            const isAtivo = pilaresAtivos.includes(pilar.id);
            return (
              <button
                key={pilar.id}
                type="button"
                disabled={loading}
                onClick={() => handleToggle(pilar.id, isAtivo)}
                className={`flex items-center gap-4 p-5 rounded-3xl border text-left transition-all duration-300 transform active:scale-95 ${
                  isAtivo 
                    ? 'border-primary bg-primary/5 text-text-primary shadow-lg shadow-primary/5' 
                    : 'border-border-custom bg-background opacity-60 hover:opacity-100 hover:border-primary/30 text-text-secondary'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div 
                  className={`w-4 h-4 rounded-full flex-shrink-0 shadow-sm transition-transform ${isAtivo ? 'scale-125' : ''}`} 
                  style={{ backgroundColor: pilar.cor_badge || '#3b82f6' }}
                />
                <span className="font-black text-xs uppercase tracking-widest truncate flex-1 italic">{pilar.nome}</span>
                {isAtivo && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
