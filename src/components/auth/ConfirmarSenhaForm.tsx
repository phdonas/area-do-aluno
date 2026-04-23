'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/app/(auth)/confirmar-senha/actions'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'

export function ConfirmarSenhaForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, null)

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Nova Senha
        </h1>
        <p className="text-text-secondary text-sm mt-2 font-medium">
          Defina sua nova senha de acesso à PHDonassolo Academy.
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
            <label className="block text-sm font-medium text-text-primary mb-1">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="No mínimo 6 caracteres"
                disabled={isPending}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-custom bg-background/50 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Repita a nova senha"
                disabled={isPending}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-custom bg-background/50 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all flex justify-center items-center shadow-lg shadow-primary/20"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Atualizar Senha'
          )}
        </button>
      </form>
    </div>
  )
}
