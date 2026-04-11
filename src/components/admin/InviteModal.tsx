'use client'

import React, { useState } from 'react'
import { Plus, X, Mail, BookOpen, Send, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { criarConvite } from '@/app/(protected)/admin/convites/actions'

export default function InviteModal({ cursos }: { cursos: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    curso_id: '',
    plano_tipo: 'venda_direta'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const res = await criarConvite({
      ...formData,
      origem: 'admin_manual'
    })

    if (res.error) {
      alert(res.error)
    } else {
      alert('Convite criado com sucesso! Token: ' + res.token)
      setIsOpen(false)
      setFormData({ email: '', curso_id: '', plano_tipo: 'venda_direta' })
    }
    setLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Novo Convite
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-surface border border-border-custom w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
               <div className="p-8 border-b border-border-custom flex items-center justify-between bg-black/[0.02]">
                  <h3 className="font-ex-black text-text-primary uppercase tracking-widest text-xs flex items-center gap-3">
                     <UserPlus className="w-5 h-5 text-emerald-500" /> Gerar Novo Acesso
                  </h3>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-all">
                     <X className="w-5 h-5 text-text-muted" />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">E-mail do Aluno</label>
                     <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input 
                           required
                           type="email" 
                           placeholder="ex: aluno@vortex.com"
                           className="w-full pl-12 pr-4 h-14 bg-background border border-border-custom rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Vincular ao Curso</label>
                     <div className="relative">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors" />
                        <select 
                           className="w-full pl-12 pr-10 h-14 bg-background border border-border-custom rounded-2xl text-sm font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                           value={formData.curso_id}
                           onChange={e => setFormData({...formData, curso_id: e.target.value})}
                        >
                           <option value="">Acesso Global (Todos os Cursos)</option>
                           {cursos.map(c => (
                              <option key={c.id} value={c.id}>{c.titulo}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Gerar Convite Ativo</>}
                  </button>

                  <p className="text-[10px] text-text-muted text-center font-medium italic">
                     O aluno receberá um e-mail automático com o link de ativação após a geração.
                  </p>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function UserPlus(props: any) {
   return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
}
