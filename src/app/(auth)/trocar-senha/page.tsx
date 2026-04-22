'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Lock, ShieldCheck, ArrowRight, Loader2, CheckCircle2, 
  MapPin, Target, Sparkles, ChevronLeft, CreditCard, Hash 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPilaresAtivos, finalizarAtivacao } from './actions'
import { createClient } from '@/lib/supabase/client'

type Pilar = {
  id: string
  nome: string
}

export default function AtivacaoContaPage() {
  const [step, setStep] = useState(1)
  const [pilaresDisponiveis, setPilaresDisponiveis] = useState<Pilar[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Onboarding State
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pais, setPais] = useState('')
  const [nif, setNif] = useState('')
  const [endereco, setEndereco] = useState({
    cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: ''
  })
  const [pilaresInteresse, setPilaresInteresse] = useState<string[]>([])

  useEffect(() => {
    const carregarDadosPrevios = async () => {
      const sb = await createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        const { data: dbUser } = await sb.from('usuarios').select('*').eq('id', user.id).single()
        if (dbUser) {
          if (dbUser.pais) setPais(dbUser.pais)
          if (dbUser.nif) setNif(dbUser.nif) // Sincronizado com Admin (que guarda em 'nif')
          setEndereco(prev => ({
            ...prev,
            cep: dbUser.cep || '',
            rua: dbUser.rua || '',
            numero: dbUser.numero || '',
            bairro: dbUser.bairro || '',
            cidade: dbUser.cidade || '',
            estado: dbUser.estado || ''
          }))
        }
      }
    }

    getPilaresAtivos().then(setPilaresDisponiveis)
    carregarDadosPrevios()
  }, [])

  const buscarCep = async (cep: string) => {
    if (pais !== 'Brasil') return
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
           setEndereco(prev => ({ 
              ...prev, 
              rua: data.logradouro, 
              bairro: data.bairro, 
              cidade: data.localidade, 
              estado: data.uf 
           }))
        }
      } catch (e) { console.error('Erro ao buscar CEP') }
    }
  }

  const togglePilar = (nome: string) => {
    setPilaresInteresse(prev => 
      prev.includes(nome) ? prev.filter(p => p !== nome) : [...prev, nome]
    )
  }

  const handleFinalizar = async () => {
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setStep(1)
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('password', password)
      formData.append('pais', pais)
      formData.append('nif', nif)
      formData.append('cep', endereco.cep)
      formData.append('rua', endereco.rua)
      formData.append('numero', endereco.numero)
      formData.append('bairro', endereco.bairro)
      formData.append('cidade', endereco.cidade)
      formData.append('estado', endereco.estado)
      pilaresInteresse.forEach(p => formData.append('pilares', p))

      const result = await finalizarAtivacao(formData)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 3000)
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao ativar sua conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Brand-consistent Ambient Light */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div 
            key="wizard-ph"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-2xl w-full bg-surface border border-border-custom rounded-[2.5rem] shadow-2xl overflow-hidden relative"
          >
            {/* Progress - PHDonassolo Academy Style */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-border-custom/30">
                <motion.div 
                   className="h-full bg-primary" 
                   initial={{ width: '33.33%' }}
                   animate={{ width: `${(step / 3) * 100}%` }}
                   transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                />
            </div>

            <div className="p-10 md:p-14 space-y-8">
               <header className="space-y-3">
                  <div className="flex items-center justify-between">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">PHDonassolo Academy • Ativação</span>
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Passo {step} de 3</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight leading-tight uppercase">
                      {step === 1 ? 'Segurança' : step === 2 ? 'Identidade' : 'Pilares de'}
                      <br/><span className="text-primary">
                        {step === 1 ? 'da Conta' : step === 2 ? 'Fiscal' : 'Interesse'}
                      </span>
                  </h1>
               </header>

               {error && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center">
                    {error}
                 </motion.div>
               )}

               <div className="min-h-[320px]">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div 
                        key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                         <p className="text-sm text-text-secondary font-medium leading-relaxed">Personalize seu acesso. Escolha uma senha segura para entrar na sua nova área do aluno.</p>
                         <div className="space-y-4 pt-4">
                            <div className="relative group">
                               <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                               <input 
                                  type="password" 
                                  placeholder="Nova Senha"
                                  className="w-full h-16 pl-14 pr-6 bg-background border border-border-custom rounded-2xl text-text-primary font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                                  value={password}
                                  onChange={e => setPassword(e.target.value)}
                               />
                            </div>
                            <div className="relative group">
                               <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                               <input 
                                  type="password" 
                                  placeholder="Confirmar Nova Senha"
                                  className="w-full h-16 pl-14 pr-6 bg-background border border-border-custom rounded-2xl text-text-primary font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                                  value={confirmPassword}
                                  onChange={e => setConfirmPassword(e.target.value)}
                               />
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div 
                        key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Seu País de Atuação:</label>
                            <div className="grid grid-cols-2 gap-4">
                               <button 
                                 onClick={() => setPais('Brasil')}
                                 className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${pais === 'Brasil' ? 'bg-primary/10 border-primary' : 'bg-background border-border-custom hover:border-text-muted'}`}
                               >
                                  <span className="text-2xl">🇧🇷</span>
                                  <span className="text-[10px] font-black uppercase text-text-primary">Brasil</span>
                               </button>
                               <button 
                                 onClick={() => setPais('Portugal')}
                                 className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${pais === 'Portugal' ? 'bg-primary/10 border-primary' : 'bg-background border-border-custom hover:border-text-muted'}`}
                               >
                                  <span className="text-2xl">🇵🇹</span>
                                  <span className="text-[10px] font-black uppercase text-text-primary">Portugal</span>
                               </button>
                            </div>
                         </div>

                         <div className="grid grid-cols-6 gap-x-4 gap-y-6 border-t border-border-custom pt-8">
                            <div className="col-span-3">
                               <label className="text-[9px] font-bold text-text-muted uppercase mb-2 block">Cód. Postal (Opcional)</label>
                               <input 
                                  placeholder={pais === 'Brasil' ? '88000-000' : '0000-000'}
                                  className="w-full h-16 px-6 bg-background border border-border-custom rounded-2xl text-text-primary focus:ring-2 focus:ring-primary outline-none placeholder:text-text-muted"
                                  value={endereco.cep}
                                  onChange={e => {
                                    setEndereco(p => ({...p, cep: e.target.value}))
                                    buscarCep(e.target.value)
                                  }}
                               />
                            </div>
                            <div className="col-span-3">
                               <label className="text-[9px] font-black text-primary uppercase mb-2 block">Número Fiscal (Obrigatório)</label>
                               <input 
                                  placeholder={pais === 'Brasil' ? '000.000.000-00' : '000 000 000'}
                                  className="w-full h-16 px-6 bg-background border border-primary/30 rounded-2xl text-text-primary font-black focus:ring-2 focus:ring-primary outline-none"
                                  value={nif}
                                  onChange={e => setNif(e.target.value)}
                               />
                            </div>
                            <div className="col-span-6">
                               <label className="text-[9px] font-bold text-text-muted uppercase mb-2 block">Endereço (Opcional)</label>
                               <input 
                                  placeholder="Rua / Avenida"
                                  className="w-full h-16 px-6 bg-background border border-border-custom rounded-2xl text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                  value={endereco.rua}
                                  onChange={e => setEndereco(p => ({...p, rua: e.target.value}))}
                               />
                            </div>
                            <div className="col-span-3">
                               <input 
                                  placeholder="Número / Complemento"
                                  className="w-full h-16 px-6 bg-background border border-border-custom rounded-2xl text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                  value={endereco.numero}
                                  onChange={e => setEndereco(p => ({...p, numero: e.target.value}))}
                               />
                            </div>
                            <div className="col-span-3">
                               <input 
                                  placeholder="Cidade - Estado"
                                  className="w-full h-16 px-6 bg-background border border-border-custom rounded-2xl text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                  value={endereco.cidade ? (pais === 'Brasil' ? `${endereco.cidade} - ${endereco.estado}` : endereco.cidade) : ''}
                                  onChange={e => setEndereco(p => ({...p, cidade: e.target.value}))}
                               />
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div 
                        key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                         <p className="text-sm text-text-secondary font-bold leading-relaxed mb-6">Selecione seus objetivos prioritários. (Opcional)</p>
                         <div className="grid grid-cols-2 gap-3">
                            {pilaresDisponiveis.map(pilar => (
                              <button
                                key={pilar.id}
                                onClick={() => togglePilar(pilar.nome)}
                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                                   pilaresInteresse.includes(pilar.nome) 
                                   ? 'bg-primary/10 border-primary' 
                                   : 'bg-background border-border-custom hover:border-text-muted'
                                }`}
                              >
                                 <Target className={`w-6 h-6 transition-transform group-hover:scale-110 ${pilaresInteresse.includes(pilar.nome) ? 'text-primary' : 'text-text-muted'}`} />
                                 <span className={`text-[9px] font-black uppercase text-center leading-tight ${pilaresInteresse.includes(pilar.nome) ? 'text-text-primary' : 'text-text-muted'}`}>
                                    {pilar.nome}
                                 </span>
                              </button>
                            ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               <footer className="flex items-center gap-4 pt-8 border-t border-border-custom">
                  {step > 1 && (
                    <button 
                       onClick={() => setStep(prev => prev - 1)}
                       className="w-16 h-16 bg-background text-text-muted hover:text-text-primary rounded-2xl flex items-center justify-center border border-border-custom transition-all hover:bg-surface active:scale-95"
                    >
                       <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      if (step < 3) {
                        setStep(prev => prev + 1);
                      } else {
                        handleFinalizar();
                      }
                    }}
                    disabled={
                      loading || 
                      (step === 1 && (!password || password.length < 6 || password !== confirmPassword)) ||
                      (step === 2 && !nif)
                    }
                    className="flex-1 h-16 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-110 transition-all transform active:scale-95 disabled:opacity-30 disabled:grayscale"
                  >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                           {step === 1 ? 'Confirmar Senha' : step === 2 ? 'Salvar Perfil' : 'Finalizar Ativação'} 
                           <ArrowRight className="w-4 h-4" />
                        </>
                     )}
                  </button>
               </footer>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success-ph"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-surface border border-emerald-500/30 rounded-[2.5rem] p-12 text-center space-y-8 shadow-2xl relative"
          >
             <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
             
             <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto relative border border-emerald-500/20 shadow-xl mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
             </div>
             
             <div className="space-y-3 relative z-10">
                <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight italic">Conta Ativada!</h2>
                <p className="text-sm font-medium text-text-secondary leading-relaxed px-4">
                   Parabéns! Seu perfil completo foi consolidado na PHDonassolo Academy. Redirecionando...
                </p>
             </div>
             
             <div className="h-1.5 w-full bg-border-custom/30 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="h-full bg-emerald-500"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
