'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Search, Plus, X, UserPlus, Phone, Mail, Globe, Hash } from 'lucide-react'
import { adminCreateUsuario } from './actions'
import { motion, AnimatePresence } from 'framer-motion'

// Nota: Usei icons da Mail, etc. Se houver erro de import, certifique-se que o lucide-react está atualizado.

export function AlunosSearchableList({ initialAlunos }: { initialAlunos: any[] }) {
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPais, setSelectedPais] = useState('Brasil')

  const filteredAlunos = initialAlunos.filter(aluno => 
    aluno.nome?.toLowerCase().includes(search.toLowerCase()) ||
    aluno.email?.toLowerCase().includes(search.toLowerCase()) ||
    (aluno.nif || aluno.cpf)?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddAluno = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    try {
      await adminCreateUsuario(formData)
      setShowAddModal(false)
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="bg-surface border border-border-custom rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full max-w-md">
          {/* <Search className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" /> */}
          <input 
            type="text" 
            placeholder="Pesquisar por nome, email ou número fiscal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border-custom rounded-xl pl-12 pr-4 py-3 text-sm text-text-primary font-medium focus:outline-none focus:border-primary transition-all shadow-inner"
          />
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-fit px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          Novo Aluno
        </button>
      </div>

      {/* Main List */}
      <div className="bg-surface border border-border-custom rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/80 border-b border-border-custom text-[10px] uppercase font-black tracking-[0.2em] text-text-muted">
                <th className="p-6">Identificação</th>
                <th className="p-6">Origem / Contato</th>
                <th className="p-6 text-center">Status Acesso</th>
                <th className="p-6 text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom/50">
              {filteredAlunos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-text-muted italic bg-background/20">
                    <span className="font-bold uppercase text-[10px] tracking-widest">Nenhum resultado encontrado</span>
                  </td>
                </tr>
              ) : (
                filteredAlunos.map(aluno => {
                  const numMatriculas = aluno.assinaturas?.[0]?.count || 0;

                  return (
                    <tr key={aluno.id} className="hover:bg-black/5 transition-all group">
                      <td className="p-6">
                        <Link href={`/admin/alunos/${aluno.id}`} className="block group-hover:text-primary transition-colors">
                          <div className="flex flex-col">
                            <span className="font-black text-text-primary group-hover:text-primary transition-colors">
                              {aluno.nome}
                            </span>
                            <span className="text-xs font-bold text-text-muted">{aluno.email}</span>
                            {(aluno.nif || aluno.cpf) && (
                               <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest mt-1">
                                  Doc: {aluno.nif || aluno.cpf}
                               </span>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 border w-fit px-3 py-1 rounded-lg ${
                              aluno.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-600' :
                              aluno.role === 'secretaria' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                              'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                            }`}>
                               <span className="text-[10px] uppercase font-black tracking-widest leading-none">
                                 {aluno.role || 'aluno'}
                               </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-background border border-border-custom w-fit px-3 py-1 rounded-lg">
                               <span className="text-[9px] uppercase font-bold tracking-tight text-text-muted italic">
                                 {aluno.origem || 'Direto'}
                               </span>
                            </div>
                          </div>
                          {aluno.whatsapp && (
                            <span className="text-[10px] font-black text-text-muted">{aluno.whatsapp}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex flex-col items-center">
                            <span className={`flex items-center justify-center w-10 h-10 rounded-2xl border-2 font-black text-xs transition-all ${numMatriculas > 0 ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 shadow-lg shadow-emerald-500/5' : 'bg-background border-border-custom text-text-muted opacity-40'}`}>
                              {numMatriculas}
                            </span>
                            <span className="text-[8px] uppercase font-black mt-2 tracking-widest text-text-muted">Matrículas</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <Link 
                          href={`/admin/alunos/${aluno.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background border border-border-custom text-text-secondary hover:text-primary hover:border-primary/50 hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/5 transition-all text-xs font-black shadow-sm"
                        >
                          Liberar Curso
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Aluno */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-surface border border-border-custom w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative"
             >
                <div className="p-8 md:p-12">
                   <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                         <div>
                            <h2 className="text-2xl font-black text-text-primary tracking-tighter">Novo Aluno</h2>
                            <p className="text-sm font-medium text-text-muted leading-none mt-1">Cadastre o aluno para liberar cursos e materiais imediatamente.</p>
                         </div>
                      </div>
                      <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-full transition-all opacity-40 hover:opacity-100">
                         X
                      </button>
                   </div>

                   {error && (
                     <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs font-bold animate-shake">
                        Erro: {error}
                     </div>
                   )}

                   <form onSubmit={handleAddAluno} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Nome Completo</label>
                            <input name="nome" required className="w-full bg-background border border-border-custom rounded-2xl px-5 py-3.5 font-bold text-text-primary focus:outline-none focus:border-indigo-500 transition-all" placeholder="Ex: João da Silva" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">E-mail</label>
                            <input name="email" type="email" required className="w-full bg-background border border-border-custom rounded-2xl px-5 py-3.5 font-bold text-text-primary focus:outline-none focus:border-indigo-500 transition-all" placeholder="email@exemplo.com" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                               {selectedPais === 'Brasil' ? 'CPF (Opcional)' : 'NIF (Opcional)'}
                            </label>
                            <input name="cpf" className="w-full bg-background border border-border-custom rounded-2xl px-5 py-3.5 font-bold text-text-primary focus:outline-none focus:border-indigo-500 transition-all" placeholder={selectedPais === 'Brasil' ? '000.000.000-00' : '000 000 000'} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Telefone / WhatsApp</label>
                            <input name="whatsapp" className="w-full bg-background border border-border-custom rounded-2xl px-5 py-3.5 font-bold text-text-primary focus:outline-none focus:border-indigo-500 transition-all" placeholder={selectedPais === 'Brasil' ? '(00) 00000-0000' : '+351 000 000 000'} />
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1 text-[8px]">País</label>
                            <select 
                              name="pais" 
                              value={selectedPais}
                              onChange={(e) => setSelectedPais(e.target.value)}
                              className="w-full bg-background border border-border-custom rounded-2xl px-5 py-3.5 font-black text-indigo-600 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer text-xs"
                            >
                               <option value="Brasil">Brasil 🇧🇷</option>
                               <option value="Portugal">Portugal 🇵🇹</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1 text-[8px]">Tipo de Acesso</label>
                            <select name="role" className="w-full bg-background border border-border-custom rounded-2xl px-5 py-3.5 font-black text-indigo-600 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer text-xs">
                               <option value="aluno">Aluno</option>
                               <option value="secretaria">Secretaria / Staff</option>
                               <option value="admin">Administrador</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1 text-[8px]">Origem</label>
                            <select name="origem" className="w-full bg-background border border-border-custom rounded-2xl px-5 py-3.5 font-black text-indigo-600 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer text-xs">
                               <option value="direto">Direto (Site)</option>
                               <option value="espm">ESPM</option>
                               <option value="unisinos">Unisinos</option>
                               <option value="udemy">Udemy</option>
                               <option value="hotmart">Hotmart</option>
                               <option value="remax">Remax</option>
                               <option value="c21">C21</option>
                               <option value="outros">Outros</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1 text-[8px]">Contato</label>
                            <select name="contato_preferencial" className="w-full bg-background border border-border-custom rounded-2xl px-5 py-3.5 font-black text-indigo-600 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer text-xs">
                               <option value="email">Apenas E-mail</option>
                               <option value="whatsapp">Apenas WhatsApp</option>
                               <option value="ambos">E-mail e WhatsApp</option>
                            </select>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-border-custom/50 flex gap-4">
                         <button 
                           type="button" 
                           onClick={() => setShowAddModal(false)}
                           className="flex-1 py-4 bg-background border border-border-custom rounded-2xl font-black text-text-secondary hover:bg-black/5 transition-all text-xs uppercase tracking-wider"
                         >
                            Cancelar
                         </button>
                         <button 
                           type="submit" 
                           disabled={loading}
                           className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                         >
                            {loading ? 'Processando...' : 'Confirmar Cadastro'}
                         </button>
                      </div>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
