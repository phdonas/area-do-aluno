'use client'

import { useActionState } from 'react'
import { trocarSenha } from './actions'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { Metadata } from 'next'

export function TrocarSenhaPage() {
  const [state, formAction, isPending] = useActionState(trocarSenha, null)

  return (
    <main className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Decoração background suave */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary-light/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md apple-blur bg-surface/80 border border-border-custom rounded-[2.5rem] p-10 sm:p-14 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Troca de Senha Obrigatória
            </h1>
            <p className="text-text-secondary text-sm mt-3 leading-relaxed">
              Para sua segurança, pedimos que escolha uma<br />nova senha pessoal para seu primeiro acesso.
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-medium">
                {state.error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-sm font-medium text-text-primary mb-1 pl-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Mínimo de 6 caracteres"
                    disabled={isPending}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border-custom bg-background/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-text-primary mb-1 pl-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    disabled={isPending}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border-custom bg-background/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-primary/20 mt-8"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Salvar e Acessar Painel'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default TrocarSenhaPage
