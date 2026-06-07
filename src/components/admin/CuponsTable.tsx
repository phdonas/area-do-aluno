'use client'

import { useState } from 'react'
import { Tag, DollarSign, Percent, CheckCircle, Clock, Search } from 'lucide-react'
import CouponActions from './CouponActions'
import { Cupom } from './CouponModal'

interface CuponsTableProps {
  cupons: Cupom[]
}

export default function CuponsTable({ cupons }: CuponsTableProps) {
  const [busca, setBusca] = useState('')

  const termo = busca.trim().toLowerCase()
  const cuponsFiltrados = termo
    ? cupons.filter((c) => c.codigo.toLowerCase().includes(termo))
    : cupons

  return (
    <>
      <div className="p-10 border-b border-border-custom flex items-center justify-between bg-black/[0.01]">
         <h2 className="text-lg font-black text-text-primary uppercase tracking-widest text-xs flex items-center gap-3">
            <Tag className="w-5 h-5 text-amber-500" /> Códigos Promocionais
         </h2>
         <div className="flex items-center gap-6">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-amber-500 transition-colors" />
               <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar código..."
                  className="pl-10 pr-4 py-2 bg-background border border-border-custom rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-amber-500 w-64"
               />
            </div>
         </div>
      </div>

      <div className="overflow-x-auto">
         <table className="w-full text-left">
            <thead>
               <tr className="border-b border-border-custom bg-black/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Código / Benefit</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Utilização</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Período de Validade</th>
                  <th className="px-10 py-6 text-right"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
               {cuponsFiltrados.map((cupom) => {
                  const isExpired = !!cupom.validade_fim && new Date(cupom.validade_fim) < new Date()
                  const isLimitReached = !!cupom.limite_uso && cupom.uso_atual >= cupom.limite_uso
                  const isActive = cupom.ativo && !isExpired && !isLimitReached

                  return (
                     <tr key={cupom.id} className="hover:bg-black/[0.01] transition-colors group">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-[10px] ${isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-surface border border-border-custom text-text-muted'}`}>
                                 {cupom.tipo === 'porcentagem' ? <Percent className="w-4 h-4 mb-0.5" /> : <DollarSign className="w-4 h-4 mb-0.5" />}
                              </div>
                              <div className="space-y-1">
                                 <p className="text-lg font-black text-text-primary tracking-tight">{cupom.codigo}</p>
                                 <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                    {cupom.tipo === 'porcentagem' ? `${cupom.valor}% OFF` : `R$ ${cupom.valor} OFF`}
                                 </p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           {isActive ? (
                              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                 <CheckCircle className="w-3 h-3" /> Ativo
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                                 <Clock className="w-3 h-3" /> {isExpired ? 'Expirado' : isLimitReached ? 'Esgotado' : 'Inativo'}
                              </span>
                           )}
                        </td>
                        <td className="px-10 py-8">
                           <div className="space-y-2 max-w-[120px]">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                 <span className="text-text-muted">{cupom.uso_atual} de {cupom.limite_uso || '∞'}</span>
                              </div>
                              <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                 <div
                                    className="h-full bg-amber-500 transition-all duration-1000"
                                    style={{ width: `${cupom.limite_uso ? (cupom.uso_atual / cupom.limite_uso) * 100 : 0}%` }}
                                 />
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="space-y-1 font-bold text-xs">
                              <p className="text-text-primary">{new Date(cupom.validade_inicio).toLocaleDateString()}</p>
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{cupom.validade_fim ? `Até ${new Date(cupom.validade_fim).toLocaleDateString()}` : 'Sem Expiração'}</p>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                            <CouponActions cupom={cupom} />
                        </td>
                     </tr>
                  )
               })}
               {cuponsFiltrados.length === 0 && (
                  <tr>
                     <td colSpan={5} className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center space-y-6 opacity-30">
                           <Tag className="w-16 h-16" />
                           <p className="text-lg font-black uppercase tracking-widest">{termo ? 'Nenhum cupom encontrado' : 'Nenhum cupom cadastrado'}</p>
                           <p className="text-xs font-medium max-w-[240px]">{termo ? 'Tente buscar por outro código.' : 'Crie um novo desconto para começar.'}</p>
                        </div>
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </>
  )
}
