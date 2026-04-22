'use client'

import React, { useState, useEffect } from 'react'
import { 
  Save, Loader2, Layout, CheckCircle2, ShieldCheck, Zap, Star, 
  DollarSign, Globe, Banknote, Mail, Phone, Hash, CreditCard, Users 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCheckoutConfig, saveCheckoutConfig, getFinancialConfig, saveFinancialConfig } from './actions'

type Tab = 'marketing' | 'financeiro'

export default function CheckoutConfigPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [finConfig, setFinConfig] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('marketing')

  useEffect(() => {
    async function load() {
      const [mktData, finData] = await Promise.all([
        getCheckoutConfig(),
        getFinancialConfig()
      ])
      if (mktData) setConfig(mktData)
      if (finData) setFinConfig(finData)
      setLoading(false)
    }
    load()
  }, [])

  async function handleMktSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    try {
      await saveCheckoutConfig(formData)
      alert('Configurações de Marketing salvas!')
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleFinSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    try {
      await saveFinancialConfig(formData)
      alert('Dados Financeiros atualizados!')
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Carregando Configurações de Elite...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-4 border-primary pl-8 py-2">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">Painel de Configuração</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">Checkout <span className="text-primary">&</span> Financeiro</h1>
          <p className="text-zinc-500 text-sm font-medium">Controle total sobre a experiência de compra e recebimentos.</p>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex bg-surface p-1.5 rounded-2xl border border-border-custom shadow-2xl">
           <button 
             onClick={() => setActiveTab('marketing')}
             className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'marketing' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'}`}
           >
             Marketing
           </button>
           <button 
             onClick={() => setActiveTab('financeiro')}
             className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'financeiro' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-text-muted hover:text-white'}`}
           >
             Financeiro
           </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'marketing' ? (
          <motion.form 
            key="mkt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleMktSubmit} 
            className="space-y-8"
          >
            {/* SEÇÃO AO TOPO */}
            <section className="bg-surface border border-border-custom rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layout className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">Vitrine do Produto</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup 
                  label="Badge de Destaque" 
                  name="badge_topo" 
                  defaultValue={config?.badge_topo} 
                  placeholder="Ex: Acesso Elite • Vitalício" 
                />
                <InputGroup 
                  label="Tagline de Validação" 
                  name="tagline_topo" 
                  defaultValue={config?.tagline_topo} 
                  placeholder="Ex: Altamente Recomendado" 
                />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Propósito da Transformação (Intro)</label>
                  <textarea 
                    name="texto_intro"
                    defaultValue={config?.texto_intro}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-[2rem] px-6 py-5 text-sm font-medium text-white focus:border-primary/50 outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              </div>
            </section>

            {/* SEÇÃO BENEFÍCIOS */}
            <section className="bg-surface border border-border-custom rounded-[3rem] p-10 space-y-8 shadow-2xl">
              <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">Engrenagens de Valor (Cards)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="space-y-4 p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Card de Benefício {num}</span>
                       <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          {num % 2 === 0 ? <Zap className="w-4 h-4 text-primary" /> : <Star className="w-4 h-4 text-amber-500" />}
                       </div>
                    </div>
                    <div className="space-y-4">
                      <input 
                        name={`beneficio_${num}_titulo`} 
                        defaultValue={config?.[`beneficio_${num}_titulo`]} 
                        placeholder="Título de impacto" 
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest text-white focus:border-primary outline-none transition-all" 
                      />
                      <input 
                        name={`beneficio_${num}_desc`} 
                        defaultValue={config?.[`beneficio_${num}_desc`]} 
                        placeholder="Descrição magnética" 
                        className="w-full bg-black/40 border border-white/0 rounded-2xl px-5 py-3 text-xs text-text-muted italic focus:bg-white/5 transition-all outline-none" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SEÇÃO SEGURANÇA */}
            <section className="bg-surface border border-border-custom rounded-[3rem] p-10 space-y-8 shadow-2xl">
              <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">Segurança & Reforço</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <InputGroup 
                  label="Tagline do Resumo" 
                  name="checkout_card_tagline" 
                  defaultValue={config?.checkout_card_tagline} 
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Texto de Blindagem SSL</label>
                  <textarea 
                    name="texto_seguranca"
                    defaultValue={config?.texto_seguranca}
                    rows={2}
                    className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] px-6 py-4 text-xs font-medium text-white/70 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner"
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end sticky bottom-8">
               <button 
                 type="submit" 
                 disabled={saving}
                 className="bg-primary hover:bg-primary-dark text-white px-12 h-18 rounded-[2rem] font-black uppercase tracking-widest flex items-center gap-4 shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 italic"
               >
                 {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Publicar Alterações de MKT
               </button>
            </div>
          </motion.form>
        ) : (
          <motion.form 
            key="fin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleFinSubmit} 
            className="space-y-8"
          >
             {/* 🇧🇷 BRASIL CONFIG */}
             <section className="bg-surface border border-border-custom rounded-[3rem] p-10 space-y-8 shadow-2xl border-l-[12px] border-l-emerald-600">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                         <DollarSign className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">Configuração Brasil (BRL)</h2>
                   </div>
                   <span className="text-[10px] font-black p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">ATIVO</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <InputGroup label="Chave PIX Oficial" name="chave_pix_br" defaultValue={finConfig?.chave_pix_br} icon={<Hash className="w-4 h-4" />} />
                   <InputGroup label="Nome do Favorecido" name="favorecido_br" defaultValue={finConfig?.favorecido_br} icon={<Users className="w-4 h-4" />} />
                   <InputGroup label="Instituição Bancária" name="banco_nome_br" defaultValue={finConfig?.banco_nome_br} placeholder="Ex: Banco Nu S.A." />
                </div>
             </section>

             {/* 🇵🇹 PORTUGAL / EU CONFIG */}
             <section className="bg-surface border border-border-custom rounded-[3rem] p-10 space-y-8 shadow-2xl border-l-[12px] border-l-primary">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                         <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">Configuração Portugal / Europa (EUR)</h2>
                   </div>
                   <span className="text-[10px] font-black p-2 bg-primary/10 text-primary rounded-lg">ATIVO</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <InputGroup label="Telemóvel MBWay" name="mbway_telemovel_pt" defaultValue={finConfig?.mbway_telemovel_pt} icon={<Phone className="w-4 h-4" />} />
                   <InputGroup label="IBAN Internacional" name="iban_pt" defaultValue={finConfig?.iban_pt} icon={<Banknote className="w-4 h-4" />} />
                   <InputGroup label="Nome do Favorecido (PT)" name="favorecido_pt" defaultValue={finConfig?.favorecido_pt} icon={<Users className="w-4 h-4" />} />
                </div>
             </section>

             {/* 🔔 SISTEMA DE ALERTAS */}
             <section className="bg-surface border border-border-custom rounded-[3rem] p-10 space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                   <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-500" />
                   </div>
                   <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">Alertas e Notificações</h2>
                </div>

                <div className="max-w-md">
                   <InputGroup 
                     label="E-mail de Notificação Admin" 
                     name="email_notificacao_admin" 
                     defaultValue={finConfig?.email_notificacao_admin || 'admin@phdonassolo.com'} 
                     icon={<Mail className="w-4 h-4" />}
                     placeholder="Onde receberá avisos de PIX/MBWay"
                   />
                </div>
                <p className="text-[10px] text-text-muted font-medium italic">Este e-mail receberá os avisos de pagamento manual realizados no checkout para acelerar sua conferência.</p>
             </section>

             <div className="flex justify-end sticky bottom-8">
               <button 
                 type="submit" 
                 disabled={saving}
                 className="bg-amber-600 hover:bg-amber-500 text-white px-12 h-18 rounded-[2rem] font-black uppercase tracking-widest flex items-center gap-4 shadow-[0_20px_50px_rgba(217,119,6,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 italic"
               >
                 {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Atualizar Dados Financeiros
               </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function InputGroup({ label, name, defaultValue, placeholder, icon }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-3 group-focus-within:text-primary transition-colors">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input 
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full bg-black/40 border border-white/10 rounded-2xl ${icon ? 'pl-14' : 'px-6'} py-4 text-sm font-bold text-white focus:border-primary/50 outline-none transition-all shadow-inner placeholder:text-zinc-700`}
        />
      </div>
    </div>
  )
}
