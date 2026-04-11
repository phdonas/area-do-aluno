'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/app/(auth)/esqueci-senha/actions'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPassword, null)

  if (state?.success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600">
          <MailCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-primary">Verifique seu e-mail</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Enviamos um link de recuperação para o seu endereço de e-mail. Por favor, verifique sua caixa de entrada e spam.
          </p>
        </div>
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Login
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-medium">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">
          E-mail de Cadastro
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Ex: joao@email.com"
          disabled={isPending}
          className="w-full px-4 py-3 rounded-xl border border-border-custom bg-background/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
        />
        <p className="text-[10px] text-text-muted font-medium">
          Insira o e-mail que você usa para acessar a plataforma.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-primary/20"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Enviar Link de Recuperação'
        )}
      </button>

      <div className="text-center">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Lembra a senha? Fazer Login
        </Link>
      </div>
    </form>
  )
}
