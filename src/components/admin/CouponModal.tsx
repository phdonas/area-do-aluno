'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { criarCupom } from '@/app/(protected)/admin/cupons/actions'

// Corrigindo importação para lucide-react corretamente
import { 
  Plus as PlusIcon, 
  X as XIcon, 
  Tag as TagIcon, 
  Calendar as CalendarIcon, 
  DollarSign as DollarIcon, 
  Percent as PercentIcon, 
  Loader2 as LoaderIcon, 
  Sparkles as SparklesIcon, 
  Send as SendIcon 
} from 'lucide-react'

export default function CouponModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'porcentagem' as 'porcentagem' | 'valor_fixo',
    valor: 0,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    limite_uso: 0,
    ativo: true,
    apenas_para_alunos: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const res = await criarCupom({
      codigo: formData.codigo,
      tipo: formData.tipo,
      valor: Number(formData.valor),
      data_inicio: formData.data_inicio || undefined,
      data_fim: formData.data_fim || undefined,
      limite_uso: formData.limite_uso > 0 ? Number(formData.limite_uso) : undefined,
      ativo: formData.ativo,
      apenas_para_alunos: formData.apenas_para_alunos
    })

    if (res.error) {
      alert(res.error)
    } else {
      setIsOpen(false)
      setFormData({
        codigo: '',
        tipo: 'porcentagem',
        valor: 0,
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: '',
        limite_uso: 0,
        ativo: true,
        apenas_para_alunos: false
      })
    }
    setLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
      >
        <PlusIcon className="w-4 h-4" /> Criar Desconto
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-surface border border-border-custom w-full max-w-2xl rounded-[3rem] shadow-3xl relative z-10 overflow-hidden"
            >
               <div className="p-10 border-b border-border-custom flex items-center justify-between bg-black/[0.02]">
                  <div className="space-y-1">
                     <h3 className="font-ex-black text-text-primary uppercase tracking-widest text-xs flex items-center gap-3">
                        <TagIcon className="w-5 h-5 text-amber-500" /> Engenharia de Oferta
                     </h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Inicie uma nova estratégia promocional</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-3 hover:bg-black/5 rounded-full transition-all">
                     <XIcon className="w-5 h-5 text-text-muted" />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Código */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Código do Cupom</label>
                        <div className="relative">
                           <SparklesIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/40" />
                           <input 
                              required
                              type="text" 
                              placeholder="ex: BLACKVORTEX"
                              className="w-full pl-14 pr-6 h-16 bg-background border border-border-custom rounded-2xl text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                              value={formData.codigo}
                              onChange={e => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
                           />
                        </div>
                     </div>

                     {/* Tipo */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Tipo de Desconto</label>
                        <div className="flex bg-background border border-border-custom p-1.5 rounded-2xl gap-1">
                           <button 
                             type="button"
                             onClick={() => setFormData({...formData, tipo: 'porcentagem'})}
                             className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${formData.tipo === 'porcentagem' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-text-muted hover:text-text-primary'}`}
                           >
                              <PercentIcon className="w-3.5 h-3.5" /> Porcentagem
                           </button>
                           <button 
                             type="button"
                             onClick={() => setFormData({...formData, tipo: 'valor_fixo'})}
                             className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${formData.tipo === 'valor_fixo' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-text-muted hover:text-text-primary'}`}
                           >
                              <DollarIcon className="w-3.5 h-3.5" /> Valor Fixo
                           </button>
                        </div>
                     </div>

                     {/* Valor */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Magnitude do Benefício</label>
                        <div className="relative">
                           <input 
                              required
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              className="w-full h-16 px-6 bg-background border border-border-custom rounded-2xl text-xl font-black focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                              value={formData.valor}
                              onChange={e => setFormData({...formData, valor: e.target.valueAsNumber})}
                           />
                           <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-text-muted uppercase text-[10px] tracking-widest">
                              {formData.tipo === 'porcentagem' ? 'OFF %' : 'BRL R$'}
                           </div>
                        </div>
                     </div>

                     {/* Limite de Uso */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Capacidade Máxima</label>
                        <div className="relative">
                           <input 
                              type="number" 
                              name="limite_uso"
                              placeholder="Sem limite"
                              className="w-full h-16 px-6 bg-background border border-border-custom rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                              value={formData.limite_uso || ''}
                              onChange={e => setFormData({...formData, limite_uso: e.target.valueAsNumber})}
                           />
                        </div>
                     </div>

                     {/* Restrição de Aluno (NOVO) */}
                     <div className="md:col-span-2 p-6 bg-black/20 border border-border-custom rounded-3xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">Apenas para Alunos (Fidelidade)</p>
                           <p className="text-[10px] text-text-muted font-bold">Bloqueia o uso para quem nunca comprou nada na plataforma</p>
                        </div>
                        <button 
                           type="button"
                           onClick={() => setFormData({...formData, apenas_para_alunos: !formData.apenas_para_alunos})}
                           className={`w-14 h-8 rounded-full relative transition-all ${formData.apenas_para_alunos ? 'bg-amber-500' : 'bg-background border border-border-custom'}`}
                        >
                           <motion.div 
                              animate={{ x: formData.apenas_para_alunos ? 24 : 4 }}
                              className={`absolute top-1 w-6 h-6 rounded-full shadow-md ${formData.apenas_para_alunos ? 'bg-white' : 'bg-text-muted'}`} 
                           />
                        </button>
                     </div>

                     {/* Data Início */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Ativação em</label>
                        <div className="relative">
                           <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                           <input 
                              type="date" 
                              className="w-full pl-14 pr-6 h-16 bg-background border border-border-custom rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                              value={formData.data_inicio}
                              onChange={e => setFormData({...formData, data_inicio: e.target.value})}
                           />
                        </div>
                     </div>

                     {/* Data Fim */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Expiração em</label>
                        <div className="relative">
                           <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                           <input 
                              type="date" 
                              className="w-full pl-14 pr-6 h-16 bg-background border border-border-custom rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                              value={formData.data_fim}
                              onChange={e => setFormData({...formData, data_fim: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>

                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full h-20 bg-amber-500 hover:bg-amber-600 text-white rounded-[2rem] font-ex-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                     {loading ? <LoaderIcon className="w-6 h-6 animate-spin" /> : <><SendIcon className="w-5 h-5" /> Projetar Campanha</>}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
