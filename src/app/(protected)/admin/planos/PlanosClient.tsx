'use client'

import React, { useState, useEffect } from 'react'
import { 
  Tag, 
  Link as LinkIcon, 
  Unlink, 
  Plus, 
  DollarSign, 
  Settings, 
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  ChevronRight,
  MonitorPlay,
  Pencil,
  Trash2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { vincularCursoAoPlano, removerVinculoPlano, atualizarPlano, excluirPlano, criarNovoPlano } from './actions'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function GestaoPlanosPage() {
  const [planos, setPlanos] = useState<any[]>([])
  const [cursos, setCursos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlano, setSelectedPlano] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPlanoId, setEditingPlanoId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    preco_mensal: '',
    duracao_meses: 12,
    is_vitalicio: false
  })

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Busca Planos
    const { data: planosData } = await supabase
      .from('planos')
      .select('*, planos_cursos(curso_id, valor_venda)')
      .order('created_at', { ascending: false })
    
    // Busca Cursos e seus planos atuais
    const { data: cursosData } = await supabase
      .from('cursos')
      .select('*, planos_cursos(plano_id, valor_venda, valor_original, planos(nome))')
      .order('titulo')
    
    setPlanos(planosData || [])
    setCursos(cursosData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingPlanoId(null)
    setFormData({ nome: '', preco_mensal: '', duracao_meses: 12, is_vitalicio: false })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (plano: any) => {
    setEditingPlanoId(plano.id)
    setFormData({
      nome: plano.nome,
      preco_mensal: plano.preco_mensal?.toString() || '',
      duracao_meses: plano.duracao_meses || 12,
      is_vitalicio: plano.duracao_meses === 0
    })
    setIsModalOpen(true)
  }

  const handleVincular = async (cursoId: string, planoId: string) => {
    const valor = prompt('Digite o valor de venda deste curso para este plano (Ex: 197.00 ou 0 para Grátis):')
    if (valor === null) return // Cancelou o prompt
    
    if (valor.trim() === '' || isNaN(Number(valor))) {
      alert('Por favor, digite um valor numérico válido!')
      return
    }

    const res = await vincularCursoAoPlano(cursoId, planoId, Number(valor))
    if (res.success) {
      fetchData()
    } else {
      alert(`Erro: ${res.error}`)
    }
  }

  const handleDesvincular = async (cursoId: string, planoId: string) => {
    if(!confirm('Deseja remover o plano deste curso? Isso impedirá novas vendas.')) return
    const res = await removerVinculoPlano(cursoId, planoId)
    if (res.success) {
      fetchData()
    }
  }

  const handleExcluir = async (id: string) => {
    if(!confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) return
    const res = await excluirPlano(id)
    if (res.success) {
      fetchData()
      if(selectedPlano === id) setSelectedPlano(null)
    } else {
      alert(res.error)
    }
  }

  const handleSavePlano = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    const payload = {
      nome: formData.nome,
      preco_mensal: Number(formData.preco_mensal),
      duracao_meses: formData.is_vitalicio ? 0 : formData.duracao_meses,
      ativo: true
    }

    const res = editingPlanoId 
      ? await atualizarPlano(editingPlanoId, payload)
      : await criarNovoPlano(payload)

    if (res.success) {
      setIsModalOpen(false)
      setFormData({ nome: '', preco_mensal: '', duracao_meses: 12, is_vitalicio: false })
      fetchData()
    } else {
      alert(`Erro ao salvar plano: ${res.error}`)
    }
    setIsSaving(false)
  }

  return (
    <div className="py-8 space-y-10 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
           <Link href="/admin" className="text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-2 mb-4">
              <ChevronRight className="w-3 h-3 rotate-180" />
              Voltar para o Menu Gestor
           </Link>
           <h1 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase">Gestão de <span className="text-primary italic">Vendas</span></h1>
           <p className="text-text-muted text-sm font-medium">Configure preços, durações e planos para os seus treinamentos.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="px-6 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 group shadow-xl shadow-primary/20"
        >
           <Plus className="w-4 h-4 text-white group-hover:scale-125 transition-transform" />
           Criar Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUNA ESQUERDA: LISTA DE PLANOS */}
        <div className="lg:col-span-4 space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Planos Ativos
           </h3>
           <div className="space-y-4">
              {planos.length === 0 && !loading && (
                <div className="p-10 border-2 border-dashed border-white/5 rounded-[2rem] text-center space-y-4">
                   <ShoppingCart className="w-10 h-10 text-white/10 mx-auto" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Nenhum plano configurado ainda.</p>
                </div>
              )}
              {planos.map(plano => (
                <div key={plano.id} className="relative group">
                  <button 
                    onClick={() => setSelectedPlano(plano.id === selectedPlano ? null : plano.id)}
                    className={`w-full text-left p-6 rounded-[2rem] border transition-all relative overflow-hidden ${selectedPlano === plano.id ? 'bg-primary/10 border-primary shadow-xl shadow-primary/10' : 'bg-surface border-border-custom hover:border-white/20'}`}
                  >
                    {plano.is_global && (
                      <div className="absolute top-4 right-4 p-1.5 bg-indigo-500 rounded-full shadow-lg">
                          <Globe className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedPlano === plano.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-text-muted transition-colors group-hover:text-primary'}`}>
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-ex-black text-text-primary uppercase tracking-tight leading-none text-lg italic">{plano.nome}</h4>
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 block">
                              Base: R$ {Number(plano.preco_mensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-black text-text-muted uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{plano.duracao_meses === 0 ? 'Acesso Vitalício' : `${plano.duracao_meses} Meses`}</span>
                        <span className="ml-auto bg-white/5 px-2 py-1 rounded-lg border border-white/5">{plano.planos_cursos?.length || 0} Vinculados</span>
                    </div>
                  </button>
                  
                  {/* ACTIONS OVERLAY */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(plano); }}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors backdrop-blur-md border border-white/10"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleExcluir(plano.id); }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors backdrop-blur-md border border-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* COLUNA DIREITA: CURSOS E VINCULAÇÃO */}
        <div className="lg:col-span-8 space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-2 flex items-center gap-2">
              <MonitorPlay className="w-4 h-4" /> Status dos Treinamentos
           </h3>
           <div className="bg-surface border border-border-custom rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/5 border-b border-border-custom text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">
                       <th className="px-8 py-6">Treinamento</th>
                       <th className="px-8 py-6">Oferta Ativa</th>
                       <th className="px-8 py-6 text-right">Ação</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-custom">
                    {cursos.map(curso => {
                      const hasPlano = curso.planos_cursos && curso.planos_cursos.length > 0
                      const currentPlano = hasPlano ? curso.planos_cursos[0].planos : null
                      const valorVenda = hasPlano ? curso.planos_cursos[0].valor_venda : 0
                      
                      return (
                        <tr key={curso.id} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 overflow-hidden shrink-0 group-hover:border-primary/30 transition-colors">
                                    <img src={curso.thumb_url || "/placeholder.png"} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                                 </div>
                                 <span className="font-ex-black text-text-primary uppercase tracking-tighter italic text-sm">{curso.titulo}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              {hasPlano ? (
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{currentPlano.nome}</span>
                                   </div>
                                   <div className="text-[11px] font-black text-text-primary pl-4">
                                      R$ {Number(valorVenda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                   </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/10 w-fit">
                                   <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                   <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic opacity-80">Sem Plano Ativo</span>
                                </div>
                              )}
                           </td>
                           <td className="px-8 py-6 text-right">
                              {selectedPlano ? (
                                <button 
                                  onClick={() => handleVincular(curso.id, selectedPlano)}
                                  disabled={hasPlano && curso.planos_cursos[0].plano_id === selectedPlano}
                                  className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${hasPlano && curso.planos_cursos[0].plano_id === selectedPlano ? 'bg-emerald-500/10 text-emerald-500 opacity-50 cursor-not-allowed border border-emerald-500/20' : 'bg-primary text-white hover:scale-105 shadow-xl shadow-primary/30'}`}
                                >
                                   {hasPlano && curso.planos_cursos[0].plano_id === selectedPlano ? 'VINCULADO' : 'VINCULAR / ALTERAR VALOR'}
                                </button>
                              ) : (
                                hasPlano && (
                                  <button 
                                    onClick={() => handleDesvincular(curso.id, curso.planos_cursos[0].plano_id)}
                                    className="p-3 bg-white/5 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5"
                                  >
                                     <Unlink className="w-4 h-4" />
                                  </button>
                                )
                              )}
                           </td>
                        </tr>
                      )
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* CREATE / EDIT PLAN MODAL */}
      <AnimatePresence>
         {isModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl bg-surface border border-white/10 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] z-10"
              >
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20">
                       {editingPlanoId ? <Pencil className="w-8 h-8 text-primary" /> : <Plus className="w-8 h-8 text-primary" />}
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-text-primary tracking-tighter italic uppercase">{editingPlanoId ? 'Editar' : 'Novo'} <span className="text-primary">Plano</span></h2>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{editingPlanoId ? 'Atualize as configurações do plano' : 'Defina as bases financeiras do produto'}</p>
                    </div>
                 </div>

                 <form onSubmit={handleSavePlano} className="space-y-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">Nome do Plano</label>
                          <input 
                            required
                            type="text" 
                            placeholder="EX: ACESSO ELITE VITALÍCIO"
                            className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 transition-all font-black uppercase tracking-widest text-[11px]"
                            value={formData.nome}
                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">Preço Sugerido (BRL)</label>
                             <div className="relative">
                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <input 
                                  required
                                  type="number" 
                                  placeholder="0.00"
                                  className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 transition-all font-black text-lg"
                                  value={formData.preco_mensal}
                                  onChange={(e) => setFormData({...formData, preco_mensal: e.target.value})}
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">Duração</label>
                             <div className="flex h-16 bg-white/5 border border-white/10 rounded-2xl p-1 overflow-hidden">
                                <button 
                                  type="button"
                                  onClick={() => setFormData({...formData, is_vitalicio: false})}
                                  className={`flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!formData.is_vitalicio ? 'bg-white/10 text-white' : 'text-text-muted'}`}
                                >
                                   Periodo
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setFormData({...formData, is_vitalicio: true})}
                                  className={`flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.is_vitalicio ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted'}`}
                                >
                                   Vitalício
                                </button>
                             </div>
                          </div>
                       </div>

                       {!formData.is_vitalicio && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           className="space-y-2"
                         >
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">Meses de Acesso</label>
                            <input 
                              type="number" 
                              className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 transition-all font-black text-lg text-center"
                              value={formData.duracao_meses}
                              onChange={(e) => setFormData({...formData, duracao_meses: Number(e.target.value)})}
                            />
                         </motion.div>
                       )}
                    </div>

                    <div className="flex gap-4 pt-6">
                       <button 
                         type="button"
                         onClick={() => setIsModalOpen(false)}
                         className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all text-text-muted"
                       >
                          Cancelar
                       </button>
                       <button 
                         disabled={isSaving}
                         className="flex-1 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                       >
                          {isSaving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Salvar Alterações <CheckCircle className="w-4 h-4" /></>}
                       </button>
                    </div>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  )
}
