'use client'

import React, { useState } from 'react'
import { submitComingSoonForm } from './actions'
import { CheckCircle2, AlertCircle, Loader2, Mail, User, Phone, ArrowRight } from 'lucide-react'

export default function ComingSoonPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)
    const result = await submitComingSoonForm(formData)

    if (result.error) {
      setStatus('error')
      setErrorMessage(result.error)
    } else {
      setStatus('success')
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full relative z-10">
        {/* Header / Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">PH Donassolo • PHD Academy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-4 text-balance">
            Área do Aluno <span className="text-secondary">em Breve</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Estamos preparando uma experiência de aprendizado transformadora. 
            A liberação oficial ocorrerá na <span className="text-foreground font-bold underline decoration-secondary/30">primeira semana de maio de 2026</span>.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-[32px] p-8 md:p-10 border border-border shadow-2xl">
          {status === 'success' ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Inscrição Confirmada!</h2>
              <p className="text-muted-foreground">
                Obrigado pelo seu interesse. Você será o primeiro a saber quando a plataforma estiver liberada.
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-8 text-sm font-bold text-secondary hover:underline transition-all"
              >
                Voltar
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Pré-cadastro de Alunos</h2>
                <p className="text-sm text-muted-foreground">
                  Informe seus dados abaixo para receber o aviso de liberação e garantir condições exclusivas de lançamento.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Como deseja ser chamado?"
                      className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    E-mail Principal
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="seu@email.com"
                      className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    WhatsApp (Opcional)
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="(00) 00000-0000"
                      className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all"
                    />
                  </div>
                </div>

                {/* LGPD Consent */}
                <div className="flex items-start gap-3 pt-2">
                  <div className="flex items-center h-5">
                    <input
                      id="consent"
                      name="consent"
                      type="checkbox"
                      required
                      className="w-4 h-4 rounded border-border text-secondary focus:ring-secondary/20 transition-all cursor-pointer"
                    />
                  </div>
                  <label htmlFor="consent" className="text-[11px] leading-tight text-muted-foreground cursor-pointer select-none">
                    Concordo em fornecer meus dados para que o PH Donassolo possa entrar em contato comigo para avisar sobre a liberação da Área do Aluno e outras comunicações relevantes (LGPD).
                  </label>
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-4 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full group relative flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-xl font-bold hover:bg-secondary hover:text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl hover:shadow-secondary/20"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>Quero receber o aviso de liberação</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center mt-12 text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
          Prof. Paulo Donassolo • Todos os direitos reservados © 2026
        </p>
      </div>
    </div>
  )
}
