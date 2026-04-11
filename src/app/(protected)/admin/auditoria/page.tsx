'use client'

import React, { useState, useEffect } from 'react'
import { 
  ShieldAlert, Search, Filter, Calendar, Terminal, Info, 
  CheckCircle, AlertTriangle, XCircle, ArrowLeft, MoreHorizontal,
  ChevronDown, ChevronUp, Database, Download, Trash2, RefreshCcw
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { listarLogs, limparLogsAntigos } from './actions'

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    email: '',
    evento: '',
    nivel: '',
    page: 1
  })
  const [total, setTotal] = useState(0)

  const fetchLogs = async () => {
    setLoading(true)
    const { logs: data, total: count } = await listarLogs(filters)
    setLogs(data)
    setTotal(count)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const getNivelStyles = (nivel: string) => {
    switch (nivel) {
      case 'sucesso': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'erro': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'aviso': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'sucesso': return <CheckCircle className="w-3 h-3" />
      case 'erro': return <XCircle className="w-3 h-3" />
      case 'aviso': return <AlertTriangle className="w-3 h-3" />
      default: return <Info className="w-3 h-3" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* 🟠 HEADER ESTRATÉGICO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface border border-border-custom p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[100%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="space-y-4 relative z-10">
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
               <ArrowLeft className="w-3 h-3" /> Painel de Controle
            </Link>
            <h1 className="text-5xl font-black text-text-primary tracking-tighter flex items-center gap-4">
               Auditoria de <span className="text-indigo-600">Sistema</span>
            </h1>
            <p className="text-sm font-medium text-text-muted max-w-md">Monitore eventos críticos, fluxos de matrícula e integridade operacional em tempo real.</p>
         </div>

         <div className="flex flex-wrap items-center gap-4 relative z-10">
            <button 
              onClick={() => { if(confirm('Limpar logs com mais de 30 dias?')) limparLogsAntigos().then(fetchLogs) }}
              className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
               <Trash2 className="w-4 h-4" /> Purga 30D
            </button>
            <button 
              onClick={fetchLogs}
              className="p-3 bg-surface border border-border-custom rounded-2xl hover:bg-black/5 transition-all"
            >
               <RefreshCcw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
            </button>
         </div>
      </header>

      {/* 🔍 FILTROS AVANÇADOS */}
      <section className="bg-surface border border-border-custom p-8 rounded-[2.5rem] shadow-sm flex flex-wrap items-end gap-6">
         <div className="flex-1 min-w-[240px] space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-2">Buscar Aluno (Email)</label>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
               <input 
                 type="text" 
                 placeholder="aluno@exemplo.com" 
                 value={filters.email}
                 onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value.toLowerCase(), page: 1 }))}
                 className="w-full pl-12 pr-4 h-14 bg-background border border-border-custom rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
               />
            </div>
         </div>

         <div className="w-[200px] space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-2">Evento</label>
            <select 
              value={filters.evento}
              onChange={(e) => setFilters(prev => ({ ...prev, evento: e.target.value, page: 1 }))}
              className="w-full px-4 h-14 bg-background border border-border-custom rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-600"
            >
               <option value="">Todos Eventos</option>
               <option value="MATRICULA_DIRETA">Matrícula Direta</option>
               <option value="VENDA_NOVO_ALUNO">Nova Venda</option>
               <option value="CONTA_ATIVADA">Ativação Conta</option>
               <option value="CHECKOUT_ERR">Erro Checkout</option>
               <option value="CUPOM">Cupons</option>
            </select>
         </div>

         <div className="w-[160px] space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-2">Severidade</label>
            <select 
              value={filters.nivel}
              onChange={(e) => setFilters(prev => ({ ...prev, nivel: e.target.value, page: 1 }))}
              className="w-full px-4 h-14 bg-background border border-border-custom rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-600"
            >
               <option value="">Todos Níveis</option>
               <option value="sucesso">Sucesso</option>
               <option value="info">Informação</option>
               <option value="aviso">Aviso</option>
               <option value="erro">Erro Crítico</option>
            </select>
         </div>
      </section>

      {/* 📊 TABELA DE EVENTOS */}
      <section className="bg-surface border border-border-custom rounded-[3rem] overflow-hidden shadow-xl min-h-[600px] flex flex-col">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border-custom bg-black/[0.02]">
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest w-48">Timestamp</th>
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Evento / Contexto</th>
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Status / Nível</th>
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Origem</th>
                     <th className="px-6 py-6 w-20"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-custom">
                  {loading ? (
                     <tr>
                        <td colSpan={5} className="py-40 text-center">
                           <RefreshCcw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Processando registros...</p> 
                        </td>
                     </tr>
                  ) : logs.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="py-40 text-center">
                           <Database className="w-8 h-8 text-text-muted/20 mx-auto mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Nenhum evento registrado com estes filtros.</p> 
                        </td>
                     </tr>
                  ) : logs.map((log: any) => (
                     <React.Fragment key={log.id}>
                        <tr className={`hover:bg-black/[0.01] transition-colors group cursor-pointer ${expandedId === log.id ? 'bg-black/[0.02]' : ''}`} onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                           <td className="px-10 py-6">
                              <div className="space-y-1">
                                 <p className="text-xs font-black text-text-primary tracking-tighter">
                                    {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                                 </p>
                                 <p className="text-[10px] font-medium text-text-muted">
                                    {format(new Date(log.created_at), 'HH:mm:ss')}
                                 </p>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <div className="space-y-1">
                                 <p className="text-sm font-black text-text-primary tracking-tight">{log.evento}</p>
                                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-70">{log.email || 'Anônimo'}</p>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getNivelStyles(log.nivel)}`}>
                                 {getNivelIcon(log.nivel)} {log.nivel}
                              </span>
                           </td>
                           <td className="px-10 py-6">
                              <span className="text-[9px] font-black text-text-muted bg-black/[0.05] px-3 py-1 rounded-lg uppercase tracking-widest">{log.origem}</span>
                           </td>
                           <td className="px-6 py-6 text-right">
                              {expandedId === log.id ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all" />}
                           </td>
                        </tr>
                        
                        {/* EXPANSÃO DE DETALHES JSON */}
                        <AnimatePresence>
                           {expandedId === log.id && (
                              <tr>
                                 <td colSpan={5} className="px-10 pb-10 bg-black/[0.02] border-t border-border-custom/50">
                                    <motion.div 
                                      initial={{ opacity: 0, y: -10 }} 
                                      animate={{ opacity: 1, y: 0 }}
                                      className="bg-background/80 border border-border-custom rounded-3xl p-8 space-y-6"
                                    >
                                       <div className="flex items-center justify-between">
                                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-3">
                                             <Terminal className="w-4 h-4" /> Payload do Evento
                                          </h4>
                                          <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-2">
                                             <Download className="w-3 h-3" /> Exportar JSON
                                          </button>
                                       </div>
                                       
                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                          {Object.entries(log.detalhes || {}).map(([key, val]: [string, any]) => (
                                             <div key={key} className="space-y-1">
                                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">{key}</p>
                                                <p className="text-xs font-bold text-text-primary break-all">
                                                   {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                </p>
                                             </div>
                                          ))}
                                          {(!log.detalhes || Object.keys(log.detalhes).length === 0) && (
                                             <p className="text-xs text-text-muted italic">Sem metadados adicionais.</p>
                                          )}
                                       </div>
                                    </motion.div>
                                 </td>
                              </tr>
                           )}
                        </AnimatePresence>
                     </React.Fragment>
                  ))}
               </tbody>
            </table>
         </div>

         {/* PAGINAÇÃO */}
         <div className="mt-auto p-10 border-t border-border-custom flex items-center justify-between">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Exibindo {logs.length} de {total} registros</p>
            <div className="flex gap-2">
               <button 
                 disabled={filters.page === 1}
                 onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                 className="px-6 py-2 border border-border-custom rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/5 transition-all disabled:opacity-20"
               >
                  Anterior
               </button>
               <button 
                 disabled={logs.length < 50}
                 onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                 className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-20 shadow-lg shadow-indigo-600/20"
               >
                  Próxima
               </button>
            </div>
         </div>
      </section>
    </div>
  )
}
