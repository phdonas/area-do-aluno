'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Globe,
  Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function FinanceiroDashboardPage() {
  const [stats, setStats] = useState<any>({
    totalBRL: 0,
    totalEUR: 0,
    vendasBR: 0,
    vendasPT: 0,
    vendasPorCurso: [],
    vendasPorMetodo: {},
    ultimasVendas: []
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      const supabase = createClient()
      
      // Busca todas as assinaturas pagas no período
      const { data: assinaturas } = await supabase
        .from('assinaturas')
        .select(`
          *,
          usuarios(nome),
          cursos(titulo)
        `)
        .eq('status_pagamento', 'pago')
        .order('data_pagamento', { ascending: false })

      if (assinaturas) {
        const brl = assinaturas.filter(a => a.moeda === 'BRL').reduce((acc, a) => acc + Number(a.valor_pago || 0), 0)
        const eur = assinaturas.filter(a => a.moeda === 'EUR').reduce((acc, a) => acc + Number(a.valor_pago || 0), 0)
        
        const countBR = assinaturas.filter(a => a.pais_origem === 'BR').length
        const countPT = assinaturas.filter(a => a.pais_origem === 'PT').length

        // Agrupamento por método
        const metodos = assinaturas.reduce((acc: any, a) => {
          acc[a.metodo_pagamento || 'N/D'] = (acc[a.metodo_pagamento || 'N/D'] || 0) + 1
          return acc
        }, {})

        // Agrupamento por curso
        const cursosMap = assinaturas.reduce((acc: any, a) => {
          const titulo = a.cursos?.titulo || 'N/D'
          if(!acc[titulo]) acc[titulo] = { nome: titulo, valor: 0, qtd: 0 }
          acc[titulo].valor += Number(a.valor_pago || 0)
          acc[titulo].qtd += 1
          return acc
        }, {})

        setStats({
          totalBRL: brl,
          totalEUR: eur,
          vendasBR: countBR,
          vendasPT: countPT,
          vendasPorMetodo: metodos,
          vendasPorCurso: Object.values(cursosMap).sort((a: any, b: any) => b.valor - a.valor),
          ultimasVendas: assinaturas.slice(0, 10)
        })
      }
      setLoading(false)
    }
    fetchStats()
  }, [period])

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
           <h1 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase">Dash <span className="text-primary italic">Financeiro</span></h1>
           <p className="text-text-muted text-sm font-medium">Controle de faturamento global em tempo real.</p>
        </div>
        
        <div className="flex bg-surface p-1 rounded-2xl border border-border-custom shadow-xl">
           {[
             { id: '7', label: '7 DIAS' },
             { id: '30', label: '30 DIAS' },
             { id: '90', label: '90 DIAS' },
             { id: 'all', label: 'TOTAL' }
           ].map((p) => (
             <button
               key={p.id}
               onClick={() => setPeriod(p.id)}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.id ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
             >
               {p.label}
             </button>
           ))}
        </div>
      </div>

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard 
            title="Receita Realizada (BR)" 
            value={`R$ ${stats.totalBRL.toLocaleString()}`} 
            icon={<DollarSign className="w-5 h-5" />}
            trend="+12.5%" 
            positive={true}
            color="primary"
         />
         <StatCard 
            title="Receita Realizada (PT/EU)" 
            value={`€ ${stats.totalEUR.toLocaleString()}`} 
            icon={<Globe className="w-5 h-5" />}
            trend="+4.2%" 
            positive={true}
            color="indigo-500"
         />
         <StatCard 
            title="Vendas Convertidas BR" 
            value={stats.vendasBR} 
            icon={<Users className="w-5 h-5" />}
            trend="+8" 
            positive={true}
            color="emerald-500"
         />
         <StatCard 
            title="Vendas Convertidas PT" 
            value={stats.vendasPT} 
            icon={<Zap className="w-5 h-5" />}
            trend="-2" 
            positive={false}
            color="amber-500"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* TABELA DE FARTURAMENTO POR CURSO */}
         <div className="lg:col-span-8 bg-surface border border-border-custom rounded-[3rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black text-text-primary uppercase tracking-tight italic">Top <span className="text-primary italic">Resultados</span> por Produto</h3>
               <BarChartIcon className="w-5 h-5 text-text-muted" />
            </div>
            
            <div className="space-y-6">
               {stats.vendasPorCurso.map((curso: any, i: number) => (
                 <div key={i} className="group flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-sm font-black uppercase tracking-widest">
                       <span className="text-text-primary group-hover:text-primary transition-colors">{curso.nome}</span>
                       <span className="text-white">{curso.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({curso.qtd})</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (curso.valor / stats.totalBRL) * 100)}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* COMPOSIÇÃO DE MÉTODOS */}
         <div className="lg:col-span-4 bg-surface border border-border-custom rounded-[3rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black text-text-primary uppercase tracking-tight italic">Mix de <span className="text-primary italic">Pagamento</span></h3>
               <PieChartIcon className="w-5 h-5 text-text-muted" />
            </div>

            <div className="space-y-4">
               {Object.entries(stats.vendasPorMetodo).map(([metodo, qtd]: any) => (
                 <div key={metodo} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-[10px]">
                          {metodo.substring(0,2).toUpperCase()}
                       </div>
                       <span className="text-xs font-black text-text-muted uppercase tracking-widest group-hover:text-white">{metodo}</span>
                    </div>
                    <span className="text-sm font-black text-text-primary italic">{qtd}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* ÚLTIMAS TRANSAÇÕES */}
      <div className="bg-surface border border-border-custom rounded-[3rem] p-8 shadow-2xl">
         <h3 className="text-lg font-black text-text-primary uppercase tracking-tight italic mb-8">Fluxo de <span className="text-primary italic">Caixa</span> Recente</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-white/5">
                     <th className="pb-6">Data</th>
                     <th className="pb-6">Aluno</th>
                     <th className="pb-6">Curso</th>
                     <th className="pb-6">Método</th>
                     <th className="pb-6 text-right">Valor</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03]">
                  {stats.ultimasVendas.map((v: any) => (
                    <tr key={v.id} className="group hover:bg-white/[0.01] transition-colors">
                       <td className="py-5 text-[11px] font-medium text-text-muted">{new Date(v.data_pagamento).toLocaleDateString()}</td>
                       <td className="py-5">
                          <span className="text-[12px] font-black text-text-primary uppercase tracking-tight">{v.usuarios?.nome}</span>
                       </td>
                       <td className="py-5 text-[11px] font-black uppercase text-white/60">{v.cursos?.titulo}</td>
                       <td className="py-5">
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">{v.metodo_pagamento}</span>
                       </td>
                       <td className="py-5 text-right font-black text-primary italic">
                          {v.moeda} {v.valor_pago?.toLocaleString()}
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

function StatCard({ title, value, icon, trend, positive, color }: any) {
  return (
    <div className={`p-8 bg-surface border border-border-custom rounded-[2.5rem] shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group`}>
       <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-${color}/20 transition-all`} />
       <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-${color}`}>
             {icon}
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-black ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
             {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
             {trend}
          </div>
       </div>
       <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{title}</h4>
       <div className="text-3xl font-black text-text-primary tracking-tighter italic">{value}</div>
    </div>
  )
}
