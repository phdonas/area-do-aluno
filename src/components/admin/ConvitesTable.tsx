'use client'

import { useState } from 'react'
import { Users, CheckCircle, Clock, Ban, Search, Filter } from 'lucide-react'
import { CONVITE_EXPIRACAO_DIAS } from '@/lib/constants'
import ConviteActions from './ConviteActions'

interface Convite {
  id: string
  email: string
  token: string
  usado: boolean
  revogado?: boolean | null
  revogado_em?: string | null
  curso_id?: string | null
  origem: string
  created_at: string
}

interface ConvitesTableProps {
  convites: Convite[]
}

export default function ConvitesTable({ convites }: ConvitesTableProps) {
  const [busca, setBusca] = useState('')

  const termo = busca.trim().toLowerCase()
  const convitesFiltrados = termo
    ? convites.filter((c) => c.email.toLowerCase().includes(termo))
    : convites

  return (
    <>
      <div className="p-10 border-b border-border-custom flex items-center justify-between bg-black/[0.01]">
        <h2 className="text-lg font-black text-text-primary uppercase tracking-widest text-xs flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" /> Histórico de Acessos
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Filtrar por e-mail..."
              className="pl-10 pr-4 py-2 bg-background border border-border-custom rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary w-64"
            />
          </div>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><Filter className="w-4 h-4 text-text-muted" /></button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-custom bg-black/[0.02]">
              <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Aluno / Destinatário</th>
              <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Acesso Vinculado</th>
              <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Data / Expiração</th>
              <th className="px-10 py-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-custom">
            {convitesFiltrados.map((convite) => (
              <tr key={convite.id} className="hover:bg-black/[0.01] transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${convite.revogado ? 'bg-red-500/10 text-red-500' : convite.usado ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                      {convite.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <p className={`text-sm font-black tracking-tight ${convite.revogado ? 'text-text-muted line-through' : 'text-text-primary'}`}>{convite.email}</p>
                      <p className="text-[10px] text-text-muted truncate w-40 font-mono tracking-tighter">Token: {convite.token}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  {convite.revogado ? (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                      <Ban className="w-3 h-3" /> Revogado
                    </span>
                  ) : convite.usado ? (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" /> Ativado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
                      <Clock className="w-3 h-3" /> Aguardando
                    </span>
                  )}
                </td>
                <td className="px-10 py-8">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-text-primary capitalize">{convite.curso_id ? 'Pilar Específico' : 'Acesso Global'}</p>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em]">{convite.origem.replace('_', ' ')}</p>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-text-primary">{new Date(convite.created_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-text-muted font-medium italic">
                      {convite.revogado && convite.revogado_em
                        ? `Revogado em ${new Date(convite.revogado_em).toLocaleDateString()}`
                        : `Expira em ${CONVITE_EXPIRACAO_DIAS} dias`}
                    </p>
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <ConviteActions id={convite.id} usado={convite.usado} revogado={!!convite.revogado} />
                </td>
              </tr>
            ))}
            {convitesFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center space-y-6 opacity-30">
                    <Users className="w-16 h-16" />
                    <p className="text-lg font-black uppercase tracking-widest">{termo ? 'Nenhum convite encontrado' : 'Nenhum convite gerado'}</p>
                    <p className="text-xs font-medium max-w-[240px]">{termo ? 'Tente buscar por outro e-mail.' : 'Inicie gerando um novo convite ou importando uma lista de contatos.'}</p>
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
