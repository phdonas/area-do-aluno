'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Zap, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Eye, 
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminFerramentasPage() {
  const [ferramentas, setFerramentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  async function loadFerramentas() {
    setLoading(true)
    const { data, error } = await supabase
      .from('ferramentas_saas')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setFerramentas(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFerramentas()
  }, [])

  const filteredFerramentas = ferramentas.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ferramenta?')) {
      const { error } = await supabase.from('ferramentas_saas').delete().eq('id', id)
      if (!error) loadFerramentas()
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tighter flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Gestão de Ferramentas SaaS
          </h1>
          <p className="text-text-secondary font-medium">Cadastre e gerencie as calculadoras e utilitários da Área do Aluno.</p>
        </div>
        <Link 
          href="/admin/ferramentas/novo" 
          className="px-6 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Nova Ferramenta
        </Link>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border-custom shadow-sm">
        <div className="flex-1 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
           <input 
            type="text" 
            placeholder="Buscar ferramenta pelo nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border border-border-custom rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
           />
        </div>
        <button 
          onClick={loadFerramentas}
          className="p-3 bg-background border border-border-custom rounded-xl hover:bg-black/5 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* LISTAGEM */}
      <div className="bg-surface border border-border-custom rounded-[2.5rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-text-muted">
             <RefreshCw className="w-8 h-8 animate-spin text-primary" />
             <p className="text-xs font-black uppercase tracking-widest">Carregando Banco de Dados...</p>
          </div>
        ) : filteredFerramentas.length === 0 ? (
          <div className="p-20 text-center text-text-secondary font-medium italic">
             Nenhuma ferramenta encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-border-custom">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Ferramenta</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Destino</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {filteredFerramentas.map((tool) => {
                  // @ts-ignore
                  const ToolIcon = LucideIcons[tool.icone] || Zap

                  return (
                    <tr key={tool.id} className="hover:bg-black/[0.01] transition-colors group">
                      <td className="p-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                               <ToolIcon className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-sm font-black text-text-primary leading-tight">{tool.nome}</p>
                               <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tight line-clamp-1 max-w-[300px]">{tool.descricao}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-text-muted">URL Externa</span>
                            <a href={tool.url_externa} target="_blank" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                               {tool.url_externa?.substring(0, 30)}... <ExternalLink className="w-3 h-3" />
                            </a>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center gap-2">
                            {tool.status === 'ativo' ? (
                              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center gap-1.5 border border-emerald-500/20">
                                 <CheckCircle2 className="w-3.5 h-3.5" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Ativo</span>
                              </div>
                            ) : (
                              <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full flex items-center gap-1.5 border border-red-500/20">
                                 <XCircle className="w-3.5 h-3.5" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Pausa</span>
                              </div>
                            )}
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`/admin/ferramentas/${tool.id}`}
                              className="p-3 bg-background border border-border-custom rounded-xl hover:border-primary/50 text-text-secondary hover:text-primary transition-all"
                            >
                               <Pencil className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(tool.id)}
                              className="p-3 bg-background border border-border-custom rounded-xl hover:border-red-500/50 text-text-secondary hover:text-red-500 transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
