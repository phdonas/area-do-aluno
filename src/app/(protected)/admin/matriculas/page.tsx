'use client'

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Search, 
  Filter, 
  DollarSign, 
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { aprovarPagamentoManual, recusarPagamentoManual } from './actions'
// Removido sonner para evitar erro de build, usando feedback local suave

export default function GestaoMatriculasPage() {
  const [matriculas, setMatriculas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pendente')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchMatriculas = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('assinaturas')
      .select(`
        *,
        usuarios(nome, email),
        cursos(titulo),
        planos(nome)
      `)
      .order('created_at', { ascending: false })
    
    setMatriculas(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMatriculas()
  }, [])

  const filtered = matriculas.filter(m => {
    const matchesFilter = filter === 'todas' || m.status_pagamento === filter
    const searchLow = searchTerm.toLowerCase()
    const matchesSearch = 
      m.usuarios?.nome?.toLowerCase().includes(searchLow) || 
      m.usuarios?.email?.toLowerCase().includes(searchLow) ||
      m.cursos?.titulo?.toLowerCase().includes(searchLow)
    
    return matchesFilter && matchesSearch
  })

  async function handleAprovar(id: string) {
    if (!confirm('Deseja realmente aprovar este pagamento e liberar o acesso?')) return
    const res = await aprovarPagamentoManual(id)
    if (res.success) {
      toast.success('Matrícula aprovada com sucesso!')
      fetchMatriculas()
    } else {
      alert(res.error)
    }
  }

  async function handleRecusar(id: string) {
    if (!confirm('Deseja recusar este pagamento?')) return
    const res = await recusarPagamentoManual(id)
    if (res.success) {
      toast.success('Matrícula recusada.')
      fetchMatriculas()
    } else {
      alert(res.error)
    }
  }

  // Helper para toast fake
  const toast = {
    success: (msg: string) => alert(`SUCESSO: ${msg}`),
    error: (msg: string) => alert(`ERRO: ${msg}`)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-text-primary tracking-tight italic uppercase">Gestão de <span className="text-primary italic">Matrículas</span></h1>
           <p className="text-text-muted text-sm font-medium">Aprovação de pagamentos manuais e controle de assinaturas.</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Buscar aluno, e-mail ou treinamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border-custom rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
         </div>
         <div className="flex bg-surface p-1 rounded-2xl border border-border-custom">
            {['pendente', 'pago', 'recusado', 'todas'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
              >
                {f}
              </button>
            ))}
         </div>
      </div>

      {/* LISTA */}
      <div className="bg-surface border border-border-custom rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-border-custom text-[10px] font-black uppercase tracking-widest text-text-muted">
                <th className="px-8 py-6">Aluno / Status Interno</th>
                <th className="px-8 py-6">Treinamento / Plano</th>
                <th className="px-8 py-6">Pagamento Details</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center"><LoaderSpinner /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-text-muted font-medium italic">Nenhuma matrícula encontrada com estes critérios.</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="font-black text-text-primary uppercase tracking-tight">{m.usuarios?.nome || 'Sem Nome'}</span>
                       <span className="text-[10px] text-text-muted font-medium">{m.usuarios?.email}</span>
                       <div className="mt-2 flex items-center gap-2">
                          <StatusBadge status={m.status} />
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{new Date(m.created_at).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="font-black text-white/80 group-hover:text-primary transition-colors">{m.cursos?.titulo}</span>
                       <span className="text-[10px] text-text-muted font-black uppercase tracking-widest italic">{m.planos?.nome || 'Plano Único'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col space-y-2">
                       <div className="flex items-center gap-2">
                          {m.status_pagamento === 'pago' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : m.status_pagamento === 'recusado' ? <XCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                          <span className={`text-[11px] font-black uppercase tracking-widest ${m.status_pagamento === 'pago' ? 'text-emerald-500' : m.status_pagamento === 'recusado' ? 'text-red-500' : 'text-amber-500'}`}>
                            {m.status_pagamento?.toUpperCase() || 'PENDENTE'}
                          </span>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-text-primary italic">{m.moeda || 'R$'} {m.valor_pago?.toLocaleString()}</span>
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-black uppercase tracking-widest text-text-muted">{m.metodo_pagamento || 'N/D'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {m.comprovante_url && (
                         <a href={m.comprovante_url} target="_blank" className="p-2 hover:bg-primary/20 text-primary rounded-xl transition-colors" title="Ver Comprovante">
                           <FileText className="w-5 h-5" />
                         </a>
                       )}
                       {m.status_pagamento === 'pendente' && (
                         <>
                            <button onClick={() => handleAprovar(m.id)} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                               Aprovar
                            </button>
                            <button onClick={() => handleRecusar(m.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                               <XCircle className="w-5 h-5" />
                            </button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: any = {
    ativa: { color: 'bg-emerald-500', text: 'Liberada' },
    inativa: { color: 'bg-red-500', text: 'Inativa' },
    pendente: { color: 'bg-amber-500', text: 'Pendente' }
  }
  const s = config[status] || { color: 'bg-gray-500', text: status }
  return (
    <div className="flex items-center gap-1.5">
       <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
       <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{s.text}</span>
    </div>
  )
}

function LoaderSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Carregando Matrículas...</span>
    </div>
  )
}
