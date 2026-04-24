'use client'

import React, { useState, useEffect } from 'react'
import { 
  Activity, Search, Calendar, Users, MousePointer2, 
  ArrowLeft, RefreshCcw, Database, BarChart3, Clock,
  ExternalLink, Hammer
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { listarUsoFerramentas, getStatsFerramentas } from './actions'

export default function TelemetriaPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    email: '',
    ferramenta: '',
    page: 1
  })
  const [total, setTotal] = useState(0)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [logsRes, statsRes] = await Promise.all([
        listarUsoFerramentas(filters),
        getStatsFerramentas()
      ])
      setLogs(logsRes.logs)
      setTotal(logsRes.total)
      setStats(statsRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* 🟠 HEADER PREMIUM */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface border border-border-custom p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[100%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="space-y-4 relative z-10">
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
               <ArrowLeft className="w-3 h-3" /> Painel de Controle
            </Link>
            <h1 className="text-5xl font-black text-text-primary tracking-tighter flex items-center gap-4">
               Uso de <span className="text-blue-600">Ferramentas</span>
            </h1>
            <p className="text-sm font-medium text-text-muted max-w-md">Monitore o engajamento dos alunos com os simuladores e ferramentas interativas em tempo real.</p>
         </div>

         <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={fetchData}
              className="p-4 bg-surface border border-border-custom rounded-2xl hover:bg-black/5 transition-all shadow-sm"
            >
               <RefreshCcw className={`w-5 h-5 text-text-muted ${loading ? 'animate-spin' : ''}`} />
            </button>
         </div>
      </header>

      {/* 📊 DASHBOARD DE STATS RAPIDAS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {stats.slice(0, 3).map((s, idx) => (
            <div key={idx} className="bg-surface border border-border-custom p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BarChart3 size={80} />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Top {idx + 1} Ferramenta</p>
               <h3 className="text-xl font-black text-text-primary tracking-tight mb-4 line-clamp-1">{s.ferramenta_nome}</h3>
               <div className="flex items-end gap-6">
                  <div>
                     <p className="text-3xl font-black text-blue-600">{s.total_usos}</p>
                     <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Acessos Totais</p>
                  </div>
                  <div className="pb-1">
                     <p className="text-xl font-bold text-text-secondary">{s.usuarios_unicos}</p>
                     <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Alunos Únicos</p>
                  </div>
               </div>
            </div>
         ))}
         {stats.length === 0 && (
            <div className="col-span-3 py-12 text-center bg-surface border border-border-custom border-dashed rounded-[2.5rem]">
               <Activity className="w-8 h-8 text-text-muted/20 mx-auto mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Aguardando dados de telemetria...</p>
            </div>
         )}
      </section>

      {/* 🔍 FILTROS */}
      <section className="bg-surface border border-border-custom p-8 rounded-[2.5rem] shadow-sm flex flex-wrap items-end gap-6">
         <div className="flex-1 min-w-[240px] space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-2">Filtrar por Aluno</label>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
               <input 
                 type="text" 
                 placeholder="Nome ou e-mail..." 
                 value={filters.email}
                 onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value, page: 1 }))}
                 className="w-full pl-12 pr-4 h-14 bg-background border border-border-custom rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-600 outline-none transition-all"
               />
            </div>
         </div>

         <div className="flex-1 min-w-[240px] space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-2">Filtrar por Ferramenta</label>
            <div className="relative">
               <Hammer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
               <input 
                 type="text" 
                 placeholder="Nome da ferramenta..." 
                 value={filters.ferramenta}
                 onChange={(e) => setFilters(prev => ({ ...prev, ferramenta: e.target.value, page: 1 }))}
                 className="w-full pl-12 pr-4 h-14 bg-background border border-border-custom rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-600 outline-none transition-all"
               />
            </div>
         </div>
      </section>

      {/* 📋 LISTA DETALHADA */}
      <section className="bg-surface border border-border-custom rounded-[3rem] overflow-hidden shadow-xl flex flex-col">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border-custom bg-black/[0.02]">
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Data / Hora</th>
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Ferramenta</th>
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Aluno</th>
                     <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-custom">
                  {loading ? (
                     <tr>
                        <td colSpan={4} className="py-32 text-center">
                           <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Carregando telemetria...</p> 
                        </td>
                     </tr>
                  ) : logs.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="py-32 text-center">
                           <Database className="w-8 h-8 text-text-muted/20 mx-auto mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Nenhum uso registrado ainda.</p> 
                        </td>
                     </tr>
                  ) : logs.map((log: any) => (
                     <tr key={log.id} className="hover:bg-black/[0.01] transition-colors group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-text-muted" />
                              <div className="space-y-0.5">
                                 <p className="text-xs font-black text-text-primary tracking-tighter">
                                    {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                                 </p>
                                 <p className="text-[10px] font-medium text-text-muted">
                                    {format(new Date(log.created_at), 'HH:mm:ss')}
                                 </p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                 <MousePointer2 className="w-4 h-4" />
                              </div>
                              <p className="text-sm font-black text-text-primary tracking-tight">{log.ferramenta_nome}</p>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-3">
                              <Users className="w-4 h-4 text-text-muted" />
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                {log.usuarios?.nome || log.usuarios?.email || log.usuario_id || 'Desconhecido'}
                              </p>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           {log.url_acessada && (
                              <a 
                                href={log.url_acessada} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 p-2 hover:bg-blue-500/10 rounded-lg text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                                title="Ver URL original"
                              >
                                 <ExternalLink className="w-4 h-4" />
                              </a>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* PAGINAÇÃO */}
         <div className="mt-auto p-10 border-t border-border-custom flex items-center justify-between bg-black/[0.01]">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total de {total} interações capturadas</p>
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
                 className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-20 shadow-lg shadow-blue-600/20"
               >
                  Próxima
               </button>
            </div>
         </div>
      </section>
    </div>
  )
}
