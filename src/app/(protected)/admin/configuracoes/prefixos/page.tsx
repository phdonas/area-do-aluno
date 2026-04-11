'use client'

import { useState, useEffect, useTransition } from 'react'
import { Plus, Trash2, ShieldCheck, Info } from 'lucide-react'
import { getPrefixos, addPrefixo, deletePrefixo } from './actions'

export default function ConfigPrefixosPage() {
  const [prefixos, setPrefixos] = useState<{ id: string, prefixo: string }[]>([])
  const [novoPrefixo, setNovoPrefixo] = useState('')
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await getPrefixos()
      setPrefixos(data as any)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = () => {
    if (!novoPrefixo.trim()) return
    startTransition(async () => {
      const res = await addPrefixo(novoPrefixo)
      if (res.success) {
        setNovoPrefixo('')
        await load()
      } else {
        alert('Erro ao salvar prefixo: ' + (res.error || 'Erro desconhecido'))
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Deseja realmente excluir este prefixo?')) return
    startTransition(async () => {
      const res = await deletePrefixo(id)
      if (res.success) {
        await load()
      } else {
        alert('Erro ao excluir: ' + (res.error || 'Tente novamente'))
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">LIMPEZA DE PREFIXOS</h1>
        </div>
        <p className="text-text-secondary text-sm">
          Gerencie aqui as siglas e códigos internos (ex: CS ATEND, FIN DRE) que devem ser ocultados do aluno no título das aulas.
        </p>
      </header>

      {/* Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-[24px] p-5 flex gap-4 items-start">
        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="text-sm text-primary/80 leading-relaxed">
          <strong>Como funciona?</strong> Sempre que o portal exibir o título de uma aula ou módulo, se ele começar com um desses prefixos, essa parte será removida automaticamente.
          <br /><br />
          <em>Exemplo: "CS ATEND Introdução" ➔ "Introdução"</em>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-bg-dark border border-border-custom p-6 rounded-[32px] shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest px-2">Adicionar Novo Prefixo</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={novoPrefixo}
            onChange={(e) => setNovoPrefixo(e.target.value)}
            placeholder="Ex: FIN DRE"
            className="flex-1 bg-black/40 border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-secondary/30 focus:border-primary outline-none transition-all font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={isPending || !novoPrefixo}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold px-8 rounded-2xl flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Salvar
          </button>
        </div>
      </div>

      {/* List Area */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest px-2">Prefixos Ativos</h2>
        
        {loading ? (
          <div className="p-12 text-center text-text-secondary animate-pulse italic">Carregando lista...</div>
        ) : prefixos.length === 0 ? (
          <div className="p-12 text-center text-text-secondary italic bg-bg-dark border border-border-custom rounded-[32px]">
            Nenhum prefixo cadastrado até agora.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prefixos.map((prefixo) => (
              <div 
                key={prefixo.id}
                className="group flex items-center justify-between p-5 bg-bg-dark border border-border-custom rounded-2xl hover:border-primary/50 transition-all shadow-md hover:shadow-primary/5"
              >
                <div className="flex items-center gap-4">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-mono font-bold text-lg text-text-primary uppercase">{prefixo.prefixo}</span>
                </div>
                <button
                  onClick={() => handleDelete(prefixo.id)}
                  className="p-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Excluir prefixo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
