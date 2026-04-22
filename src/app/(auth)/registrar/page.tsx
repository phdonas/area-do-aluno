'use client'

import { useState, useActionState } from 'react'
import { registrarVisitante } from './actions'
import { Mail, Loader2, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function RegistrarVisitantePage() {
  const [state, formAction, isPending] = useActionState(registrarVisitante, null)

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="apple-blur bg-surface border border-border-custom rounded-[3rem] p-10 sm:p-14 shadow-2xl">
          <Link href="/login" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-12 text-[10px] font-black uppercase tracking-widest outline-none">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
          </Link>

          <div className="text-center mb-10 space-y-4">
             <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                <Sparkles className="w-7 h-7" />
             </div>
             <h1 className="text-3xl font-black text-text-primary tracking-tighter italic">Comece agora.</h1>
             <p className="text-sm text-text-muted font-medium max-w-xs mx-auto italic">
               Insira seu e-mail para receber o acesso instantâneo ao nosso ecossistema gratuito.
             </p>
          </div>

          <AnimatePresence mode="wait">
            {state?.success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/20">
                   <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-bold text-text-primary">Verifique seu E-mail</h3>
                   <p className="text-sm text-text-muted leading-relaxed font-medium">
                     Enviamos um link de confirmação. Clique nele para validar seu e-mail e definir sua senha de acesso.
                   </p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-xs font-black text-primary uppercase tracking-widest hover:underline outline-none"
                >
                  Não recebeu? Tentar novamente
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                action={formAction} 
                className="space-y-8"
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-4">
                   <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest group-focus-within:text-primary transition-colors">
                      <Mail className="w-3.5 h-3.5" /> E-mail de Registro
                    </label>
                    <input 
                      name="email"
                      type="email"
                      required
                      placeholder="seu@melhor-email.com"
                      className="w-full bg-background border border-border-custom focus:border-primary p-5 rounded-2xl text-sm font-bold text-text-primary outline-none transition-all placeholder:text-text-muted/30 shadow-inner"
                    />
                  </div>
                </div>

                {state?.error && (
                  <p className="text-rose-500 text-[10px] font-black uppercase text-center tracking-widest animate-pulse">
                    {state.error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-text-primary text-background py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:scale-[1.02] shadow-2xl transition-all disabled:opacity-20"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Solicitar Acesso Imediato'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-10 text-center text-[9px] font-black text-text-muted/40 uppercase tracking-[0.4em]">
          Ambiente Blindado &copy; PHD Academy 2026
        </p>
      </motion.div>
    </main>
  )
}
