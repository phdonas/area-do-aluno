'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, 
  ArrowRight,
  X,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  TrendingUp,
  Calculator,
  Cpu,
  ShieldCheck,
  Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import * as LucideIcons from 'lucide-react'

export default function FerramentasPage() {
  const [ferramentas, setFerramentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeUrl, setActiveUrl] = useState<string | null>(null)
  const [toolName, setToolName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadFerramentas() {
      const { data, error } = await supabase
        .from('ferramentas_saas')
        .select('*')
        .eq('status', 'ativo')
        .order('created_at', { ascending: true })

      if (!error && data) {
        setFerramentas(data)
      }
      setLoading(true)
      setTimeout(() => setLoading(false), 500)
    }
    loadFerramentas()
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      
      {/* HEADER DA CENTRAL */}
      <section className="space-y-6">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
               <Zap className="w-8 h-8 text-primary" />
            </div>
            <div>
               <h1 className="text-4xl font-black text-text-primary tracking-tighter">Central de Ferramentas</h1>
               <p className="text-sm text-text-secondary font-black uppercase tracking-[0.2em]">Prof. Paulo H. Donassolo</p>
            </div>
         </div>
         <p className="text-lg text-text-secondary/60 max-w-2xl font-medium leading-relaxed">
            Utilitários exclusivos projetados para acelerar sua tomada de decisão e produtividade no dia a dia profissional.
         </p>
      </section>

      {/* GRID DINÂMICO DE FERRAMENTAS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <RefreshCw className="w-10 h-10 text-primary animate-spin" />
           <p className="text-xs font-black text-text-muted uppercase tracking-widest">Sincronizando Ferramentas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ferramentas.length === 0 && (
              <div className="col-span-full py-20 text-center bg-surface border border-dashed border-border-custom rounded-[3rem]">
                 <p className="text-text-muted font-medium">Nenhuma ferramenta disponível no momento.</p>
              </div>
            )}
            
            {ferramentas.map((tool) => {
              // @ts-ignore
              const Icon = LucideIcons[tool.icone] || Zap
              
              return (
                <div 
                  key={tool.id}
                  className="group p-10 bg-surface border border-border-custom rounded-[3rem] text-left hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full"
                >
                   <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Icon className="w-7 h-7" />
                   </div>
                   
                   {tool.capa_url && (
                     <div className="mb-6 rounded-2xl overflow-hidden aspect-video border border-border-custom bg-black/5">
                        <img src={tool.capa_url} alt={tool.nome} className="w-full h-full object-cover" />
                     </div>
                   )}

                   <h3 className="text-2xl font-black text-text-primary mb-3">
                      {tool.nome}
                   </h3>
                   <p className="text-sm text-text-secondary leading-relaxed mb-10 flex-1">
                      {tool.descricao}
                   </p>
                   
                   <button 
                    onClick={() => {
                      if (tool.url_externa) {
                        setActiveUrl(null) // Reset para forçar reload do iframe se necessário
                        setTimeout(() => {
                          setActiveUrl(tool.url_externa)
                          setToolName(tool.nome)
                        }, 10)
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-primary/5 group-hover:bg-primary text-primary group-hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                   >
                      {tool.label_botao || 'Acessar'} <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              )
            })}
        </div>
      )}

      {/* OVERLAY DE INTERFACE (IFRAME) */}
      <AnimatePresence>
        {activeUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            {/* Barra de Topo do Iframe - ULTRA CONTRASTE */}
            <div className="p-5 bg-[#0A0F1E] border-b border-white/20 flex items-center justify-between shadow-2xl">
               <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setActiveUrl(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white group"
                  >
                     <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-primary-light uppercase tracking-widest leading-none mb-1.5 opacity-80">Ambiente de Ferramentas</span>
                     <h2 className="text-lg font-black text-white uppercase tracking-tighter leading-none">{toolName}</h2>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <a 
                    href={activeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black hover:bg-primary-dark transition-all uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir em Tela Cheia
                  </a>
                  <button 
                    onClick={() => setActiveUrl(null)}
                    className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Conteúdo da Ferramenta */}
            <div className="flex-1 bg-white relative overflow-hidden">
               <iframe 
                 src={activeUrl}
                 className="w-full h-full border-none bg-white font-sans"
                 title={toolName}
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               />
               
               {/* Fallback de Carregamento / Bloqueio */}
               <div className="absolute inset-0 z-[-1] flex flex-col items-center justify-center bg-background p-8 text-center">
                  <RefreshCw className="w-12 h-12 text-primary animate-spin mb-6" />
                  <p className="text-white font-black uppercase tracking-widest text-xs mb-2">Carregando Ferramenta...</p>
                  <p className="text-white/40 text-xs max-w-xs leading-relaxed mb-8">
                    Se o conteúdo demorar ou não aparecer, o fornecedor pode estar bloqueando a visualização interna por segurança.
                  </p>
                  <a 
                    href={activeUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    Abrir em Nova Aba
                  </a>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
