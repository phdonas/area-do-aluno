'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Tag, 
  Unlink, 
  Plus, 
  DollarSign, 
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  ChevronRight,
  MonitorPlay,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Search,
  ArrowRightLeft,
  LayoutGrid,
  Filter,
  Check,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { 
  vincularCursoAoPlano, 
  removerVinculoPlano, 
  atualizarPlano, 
  excluirPlano, 
  criarNovoPlano,
  alternarDestaqueVinculo,
  alternarAtivoVinculo
} from './actions'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type ViewMode = 'por-plano' | 'por-curso'

export default function GestaoPlanosPage() {
  const [planos, setPlanos] = useState<any[]>([])
  const [cursos, setCursos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('por-plano')
  
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPlanoId, setEditingPlanoId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    preco_mensal: '',
    duracao_meses: 12,
    is_vitalicio: false,
    ativo: true
  })

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const { data: planosData } = await supabase
      .from('planos')
      .select('*, planos_cursos(curso_id, valor_venda, valor_original, is_featured, ativo, cursos(titulo, thumb_url))')
      .order('created_at', { ascending: false })
    
    const { data: cursosData } = await supabase
      .from('cursos')
      .select('*, planos_cursos(plano_id, valor_venda, valor_original, is_featured, ativo, planos(nome))')
      .order('titulo')
    
    setPlanos(planosData || [])
    setCursos(cursosData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filtragem inteligente
  const filteredItems = useMemo(() => {
    const data = viewMode === 'por-plano' ? planos : cursos
    if (!searchTerm) return data
    return data.filter((item: any) => 
      (item.nome || item.titulo).toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [viewMode, planos, cursos, searchTerm])

  const handleOpenCreateModal = () => {
    setEditingPlanoId(null)
    setFormData({ nome: '', preco_mensal: '', duracao_meses: 12, is_vitalicio: false, ativo: true })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (plano: any) => {
    setEditingPlanoId(plano.id)
    setFormData({
      nome: plano.nome,
      preco_mensal: plano.preco_mensal?.toString() || '',
      duracao_meses: plano.duracao_meses || 12,
      is_vitalicio: plano.duracao_meses === 0,
      ativo: plano.ativo ?? true
    })
    setIsModalOpen(true)
  }

  const handleVincular = async (cursoId: string, planoId: string) => {
    const valor = prompt('Digite o valor de venda (Ex: 197.00 ou 0 para Grátis):')
    if (valor === null) return
    
    if (valor.trim() === '' || isNaN(Number(valor))) {
      alert('Valor inválido!')
      return
    }

    const res = await vincularCursoAoPlano(cursoId, planoId, Number(valor))
    if (res.success) fetchData()
    else alert(`Erro: ${res.error}`)
  }

  const handleToggleDestaque = async (cursoId: string, planoId: string, current: boolean) => {
    const res = await alternarDestaqueVinculo(cursoId, planoId, !current)
    if (res.success) fetchData()
  }

  const handleToggleAtivoVinculo = async (cursoId: string, planoId: string, current: boolean) => {
    const res = await alternarAtivoVinculo(cursoId, planoId, !current)
    if (res.success) fetchData()
  }

  const handleDesvincular = async (cursoId: string, planoId: string) => {
    if(!confirm('Deseja remover este vínculo permanentemente?')) return
    const res = await removerVinculoPlano(cursoId, planoId)
    if (res.success) fetchData()
  }

  const handleExcluirPlano = async (id: string) => {
    if(!confirm('Tem certeza? Isso pode afetar assinaturas ativas se não for cuidadoso.')) return
    const res = await excluirPlano(id)
    if (res.success) {
      fetchData()
      if(selectedId === id) setSelectedId(null)
    } else {
      if (res.canDeactivate) {
        if (confirm(`${res.error}\n\nDeseja apenas DESATIVAR o plano para novas vendas em vez de excluir?`)) {
          await atualizarPlano(id, { ativo: false })
          fetchData()
        }
      } else {
        alert(res.error)
      }
    }
  }

  const handleSavePlano = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    const payload = {
      nome: formData.nome,
      preco_mensal: Number(formData.preco_mensal),
      duracao_meses: formData.is_vitalicio ? 0 : formData.duracao_meses,
      ativo: formData.ativo
    }

    const res = editingPlanoId 
      ? await atualizarPlano(editingPlanoId, payload)
      : await criarNovoPlano(payload)

    if (res.success) {
      setIsModalOpen(false)
      fetchData()
    } else {
      alert(`Erro: ${res.error}`)
    }
    setIsSaving(false)
  }

  const currentSelection = useMemo(() => {
    if (!selectedId) return null
    return (viewMode === 'por-plano' ? planos : cursos).find(i => i.id === selectedId)
  }, [selectedId, viewMode, planos, cursos])

  return (
    <div className="py-8 space-y-10 min-h-screen pb-20">
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
           <Link href="/admin" className="text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-2 mb-4">
              <ChevronRight className="w-3 h-3 rotate-180" />
              Painel Administrativo
           </Link>
           <h1 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase">
             {viewMode === 'por-plano' ? 'Gestão por' : 'Gestão por'} <span className="text-primary italic">{viewMode === 'por-plano' ? 'Planos' : 'Cursos'}</span>
           </h1>
           <p className="text-text-muted text-sm font-medium">Controle total sobre precificação, ofertas e destaques na vitrine.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCreateModal}
            className="px-6 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 group shadow-xl shadow-primary/20"
          >
             <Plus className="w-4 h-4 text-white group-hover:scale-125 transition-transform" />
             Novo Plano
          </button>
        </div>
      </div>

      {/* TABS DE VISÃO */}
      <div className="flex p-1.5 bg-surface border border-white/5 rounded-[2rem] w-fit">
          <button 
            onClick={() => { setViewMode('por-plano'); setSelectedId(null); }}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'por-plano' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:bg-white/5'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Visão por Plano
          </button>
          <button 
            onClick={() => { setViewMode('por-curso'); setSelectedId(null); }}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'por-curso' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:bg-white/5'}`}
          >
            <MonitorPlay className="w-4 h-4" /> Visão por Curso
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUNA ESQUERDA: LISTA DE SELEÇÃO */}
        <div className="lg:col-span-4 space-y-6">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder={`Pesquisar ${viewMode === 'por-plano' ? 'planos' : 'cursos'}...`}
                className="w-full h-16 pl-14 pr-6 bg-surface border border-border-custom rounded-3xl outline-none focus:border-primary/50 transition-all font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-5 rounded-3xl border transition-all relative overflow-hidden group ${selectedId === item.id ? 'bg-primary/10 border-primary shadow-xl' : 'bg-surface border-border-custom hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                      {viewMode === 'por-curso' ? (
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden shrink-0">
                           <img src={item.thumb_url || "/placeholder.png"} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedId === item.id ? 'bg-primary text-white' : 'bg-white/5 text-text-muted'}`}>
                           <Tag className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-text-primary uppercase tracking-tight truncate text-sm italic">{item.nome || item.titulo}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[9px] font-bold text-primary uppercase">{item.planos_cursos?.length || 0} vínculos</span>
                           {item.ativo === false && <span className="text-[8px] font-black bg-red-500/10 text-red-500 px-1.5 rounded uppercase">Inativo</span>}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedId === item.id ? 'translate-x-1 text-primary' : 'text-white/10'}`} />
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* COLUNA DIREITA: DETALHES E VÍNCULOS */}
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
              {selectedId ? (
                <motion.div 
                  key={selectedId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* CARD DE RESUMO DO ITEM SELECIONADO */}
                  <div className="bg-surface border border-border-custom rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 flex gap-3">
                        {viewMode === 'por-plano' && (
                          <>
                            <button onClick={() => handleOpenEditModal(currentSelection)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 text-text-muted hover:text-primary">
                               <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleExcluirPlano(selectedId)} className="p-3 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/10 text-red-500/50 hover:text-red-500">
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                     </div>

                     <div className="flex items-start gap-8">
                        {viewMode === 'por-curso' && (
                           <div className="w-32 h-32 rounded-3xl overflow-hidden border border-white/10 shrink-0 shadow-2xl">
                              <img src={currentSelection?.thumb_url || "/placeholder.png"} className="w-full h-full object-cover" />
                           </div>
                        )}
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">{viewMode === 'por-plano' ? 'Plano' : 'Treinamento'}</span>
                              {currentSelection?.is_global && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">Global</span>}
                           </div>
                           <h2 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase leading-none">
                              {currentSelection?.nome || currentSelection?.titulo}
                           </h2>
                           <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-text-muted">
                              {viewMode === 'por-plano' && (
                                <>
                                  <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Base: R$ {Number(currentSelection?.preco_mensal || 0).toLocaleString('pt-BR')}</div>
                                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {currentSelection?.duracao_meses === 0 ? 'Vitalício' : `${currentSelection?.duracao_meses} Meses`}</div>
                                </>
                              )}
                              <div className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> {currentSelection?.planos_cursos?.length || 0} Vinculados Ativos</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* LISTA DE VÍNCULOS */}
                  <div className="space-y-6">
                     <div className="flex items-center justify-between px-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                           {viewMode === 'por-plano' ? <MonitorPlay className="w-4 h-4" /> : <Tag className="w-4 h-4" />} 
                           {viewMode === 'por-plano' ? 'Cursos neste Plano' : 'Planos com este Curso'}
                        </h3>
                        <button 
                          onClick={() => {
                            // Abre modal de vinculação rápida
                            const otherId = prompt(`ID do ${viewMode === 'por-plano' ? 'Curso' : 'Plano'} para vincular:`)
                            if (otherId) handleVincular(viewMode === 'por-plano' ? otherId : selectedId!, viewMode === 'por-plano' ? selectedId! : otherId)
                          }}
                          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Adicionar Novo Vínculo
                        </button>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        {currentSelection?.planos_cursos?.length > 0 ? (
                          currentSelection.planos_cursos.map((pc: any) => {
                             const itemDisplay = viewMode === 'por-plano' ? pc.cursos : pc.planos
                             return (
                               <div key={pc.curso_id + pc.plano_id} className={`p-6 rounded-[2rem] border bg-surface transition-all flex items-center gap-6 group ${!pc.ativo ? 'opacity-50 grayscale' : 'hover:border-primary/30'}`}>
                                  {viewMode === 'por-plano' && (
                                     <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/5 shrink-0 shadow-lg">
                                        <img src={itemDisplay?.thumb_url || "/placeholder.png"} className="w-full h-full object-cover" />
                                     </div>
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-black text-text-primary uppercase tracking-tight truncate italic">{itemDisplay?.titulo || itemDisplay?.nome}</h4>
                                        {pc.is_featured && (
                                           <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                              <Star className="w-2.5 h-2.5 fill-current" /> DESTAQUE
                                           </div>
                                        )}
                                     </div>
                                     <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                           <span className="text-[8px] font-black text-text-muted uppercase tracking-tighter">Valor Oferta:</span>
                                           <span className="text-sm font-black text-emerald-500 italic">R$ {Number(pc.valor_venda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className={`flex items-center gap-1 text-[8px] font-black uppercase ${pc.ativo ? 'text-emerald-500/60' : 'text-red-500/60'}`}>
                                           {pc.ativo ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                           {pc.ativo ? 'Venda Ativa' : 'Venda Inativa'}
                                        </div>
                                     </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                     <button 
                                        onClick={() => handleToggleDestaque(pc.curso_id, pc.plano_id, pc.is_featured)}
                                        className={`p-3 rounded-xl border transition-all ${pc.is_featured ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-lg shadow-amber-500/10' : 'bg-white/5 border-white/5 text-text-muted hover:text-amber-500'}`}
                                        title={pc.is_featured ? "Remover destaque" : "Tornar plano de destaque para este curso"}
                                     >
                                        <Star className={`w-4 h-4 ${pc.is_featured ? 'fill-current' : ''}`} />
                                     </button>
                                     <button 
                                        onClick={() => handleToggleAtivoVinculo(pc.curso_id, pc.plano_id, pc.ativo)}
                                        className={`p-3 rounded-xl border transition-all ${pc.ativo ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'}`}
                                        title={pc.ativo ? "Inativar venda" : "Reativar venda"}
                                     >
                                        {pc.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                     </button>
                                     <button 
                                        onClick={() => handleDesvincular(pc.curso_id, pc.plano_id)}
                                        className="p-3 bg-white/5 border border-white/5 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
                                        title="Remover vínculo"
                                     >
                                        <Unlink className="w-4 h-4" />
                                     </button>
                                  </div>
                               </div>
                             )
                          })
                        ) : (
                          <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-6">
                             <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto">
                                <Plus className="w-8 h-8 text-white/10" />
                             </div>
                             <div className="space-y-2">
                                <p className="text-lg font-black text-text-primary uppercase tracking-tighter italic">Nenhum vínculo encontrado</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted max-w-[200px] mx-auto">Comece vinculando este item a {viewMode === 'por-plano' ? 'um treinamento' : 'um plano de venda'}.</p>
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8 bg-surface/50 border border-white/5 rounded-[3rem] border-dashed">
                   <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                      <Filter className="w-10 h-10 text-primary" />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">Selecione um item</h3>
                      <p className="text-sm text-text-muted max-w-sm mx-auto font-medium">Escolha um {viewMode === 'por-plano' ? 'plano' : 'curso'} na lista ao lado para gerenciar seus preços e vinculações.</p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* CREATE / EDIT PLAN MODAL (Ajustado para o novo padrão) */}
      <AnimatePresence>
         {isModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-[#050505]/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl bg-surface border border-white/10 rounded-[3.5rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-10 overflow-hidden"
              >
                 {/* Efeito Decorativo */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                 <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                       {editingPlanoId ? <Pencil className="w-10 h-10 text-white" /> : <Plus className="w-10 h-10 text-white" />}
                    </div>
                    <div>
                       <h2 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase">{editingPlanoId ? 'Editar' : 'Novo'} <span className="text-primary">Plano</span></h2>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Configure as bases da sua estratégia de vendas.</p>
                    </div>
                 </div>

                 <form onSubmit={handleSavePlano} className="space-y-8">
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">Nome Comercial do Plano</label>
                          <input 
                            required
                            type="text" 
                            placeholder="EX: ACESSO ELITE VITALÍCIO"
                            className="w-full h-20 px-8 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-primary/50 transition-all font-black uppercase tracking-widest text-sm"
                            value={formData.nome}
                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">Preço Base (BRL)</label>
                             <div className="relative">
                                <DollarSign className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                <input 
                                  required
                                  type="number" 
                                  placeholder="0.00"
                                  className="w-full h-20 pl-16 pr-8 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-primary/50 transition-all font-black text-xl"
                                  value={formData.preco_mensal}
                                  onChange={(e) => setFormData({...formData, preco_mensal: e.target.value})}
                                />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">Duração de Acesso</label>
                             <div className="flex h-20 bg-white/5 border border-white/10 rounded-3xl p-2 overflow-hidden">
                                <button 
                                  type="button"
                                  onClick={() => setFormData({...formData, is_vitalicio: false})}
                                  className={`flex-1 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${!formData.is_vitalicio ? 'bg-white/10 text-white shadow-xl' : 'text-text-muted'}`}
                                >
                                   Período
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setFormData({...formData, is_vitalicio: true})}
                                  className={`flex-1 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.is_vitalicio ? 'bg-primary text-white shadow-2xl shadow-primary/20' : 'text-text-muted'}`}
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
                           className="space-y-3"
                         >
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">Meses de Acesso Liberado</label>
                            <input 
                              type="number" 
                              className="w-full h-20 px-8 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-primary/50 transition-all font-black text-2xl text-center"
                              value={formData.duracao_meses}
                              onChange={(e) => setFormData({...formData, duracao_meses: Number(e.target.value)})}
                            />
                         </motion.div>
                       )}

                       <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                          <div className="flex-1">
                             <h4 className="text-[10px] font-black uppercase text-text-primary">Status do Plano</h4>
                             <p className="text-[9px] font-bold text-text-muted mt-1">Planos inativos não aparecem na vitrine.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, ativo: !formData.ativo})}
                            className={`w-16 h-8 rounded-full transition-all relative p-1 ${formData.ativo ? 'bg-primary' : 'bg-white/10'}`}
                          >
                             <div className={`w-6 h-6 bg-white rounded-full transition-all ${formData.ativo ? 'ml-8' : 'ml-0'}`} />
                          </button>
                       </div>
                    </div>

                    <div className="flex gap-6 pt-6">
                       <button 
                         type="button"
                         onClick={() => setIsModalOpen(false)}
                         className="flex-1 py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all text-text-muted"
                       >
                          Cancelar
                       </button>
                       <button 
                         disabled={isSaving}
                         className="flex-1 py-6 bg-primary text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 group"
                       >
                          {isSaving ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Finalizar Configuração <CheckCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" /></>}
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
