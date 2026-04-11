'use client'

import { useActionState } from 'react'
import { login } from '@/app/(auth)/login/actions'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

import { useSearchParams } from 'next/navigation'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  return (
    <form action={formAction} className="space-y-6 w-full max-w-sm mx-auto">
      {message && (
        <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl text-center font-medium">
          {message}
        </div>
      )}
      
      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-medium">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="seu@email.com"
            disabled={isPending}
            className="w-full px-4 py-3 rounded-xl border border-border-custom bg-background/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isPending}
            className="w-full px-4 py-3 rounded-xl border border-border-custom bg-background/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded border-border-custom text-primary focus:ring-primary/20" />
          <span className="text-sm text-text-secondary">Lembrar-me</span>
        </label>
        <Link 
          href="/esqueci-senha" 
          className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
        >
          Esqueceu a senha?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-primary/20"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Entrar na Plataforma'
        )}
      </button>
    </form>
  )
}
