'use client'

import { useState, useEffect, useTransition } from 'react'
import { Globe, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { getLmsLiberado, setLmsLiberado } from './actions'

export default function ConfigAcessoPage() {
  const [liberado, setLiberado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro', mensagem: string } | null>(null)

  const load = async () => {
    try {
      const valor = await getLmsLiberado()
      setLiberado(valor)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSalvar = () => {
    setFeedback(null)
    startTransition(async () => {
      const res = await setLmsLiberado(liberado)
      if (res.success) {
        setFeedback({ tipo: 'sucesso', mensagem: 'Configuração salva com sucesso!' })
      } else {
        setFeedback({ tipo: 'erro', mensagem: res.error || 'Erro ao salvar. Tente novamente.' })
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">ACESSO À PLATAFORMA</h1>
        </div>
        <p className="text-text-secondary text-sm">
          Controle se a Área do Aluno está liberada para acesso público ou se exibe a página &quot;Em Breve&quot;.
        </p>
      </header>

      {/* Card principal */}
      <div className="bg-bg-dark border border-border-custom p-6 rounded-[32px] shadow-xl space-y-6">
        {loading ? (
          <div className="p-12 text-center text-text-secondary animate-pulse italic">Carregando configuração...</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Área do Aluno liberada para acesso público</h2>
                <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
                  Quando desativado, visitantes são redirecionados para a página &quot;Em Breve&quot;.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={liberado}
                  onChange={(e) => setLiberado(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-border-custom peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border-custom">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status atual:</span>
              {liberado ? (
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg">LIBERADO</span>
              ) : (
                <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg">EM BREVE</span>
              )}
            </div>

            {feedback && (
              <div className={`flex items-center gap-2 p-4 rounded-xl text-sm border ${feedback.tipo === 'sucesso' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                {feedback.tipo === 'sucesso' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <p>{feedback.mensagem}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSalvar}
                disabled={isPending}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-primary/20"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Salvar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
