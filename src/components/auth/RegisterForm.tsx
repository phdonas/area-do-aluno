'use client'

import { useActionState } from 'react'
import { cadastrarUsuario } from '@/app/(auth)/cadastro/actions'
import { Loader2, Mail, Lock, User } from 'lucide-react'

interface RegisterFormProps {
  initialEmail?: string
  token?: string
}

export function RegisterForm({ initialEmail = '', token = '' }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(cadastrarUsuario, null)

  return (
    <form action={formAction} className="space-y-5 w-full max-w-sm mx-auto">
      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-medium">
          {state.error}
        </div>
      )}

      {/* Hidden Token do Convite */}
      <input type="hidden" name="token" value={token} />

      <div className="space-y-4">
        {/* Campo Nome */}
        <div className="relative group">
          <label className="block text-sm font-medium text-text-primary mb-1 pl-1">
            Nome Completo
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              id="nome"
              name="nome"
              type="text"
              required
              placeholder="Como quer ser chamado(a)?"
              disabled={isPending}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-custom bg-background/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Campo E-mail */}
        <div className="relative group">
          <label className="block text-sm font-medium text-text-primary mb-1 pl-1">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={initialEmail}
              readOnly={!!initialEmail}
              placeholder="seu@email.com"
              disabled={isPending}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border border-border-custom bg-background/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 ${initialEmail ? 'bg-surface/30 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Campo Senha */}
        <div className="relative group">
          <label className="block text-sm font-medium text-text-primary mb-1 pl-1">
            Criar Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="No mínimo 6 caracteres"
              disabled={isPending}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-custom bg-background/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Campo Confirmação */}
        <div className="relative group">
          <label className="block text-sm font-medium text-text-primary mb-1 pl-1">
            Confirmar Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Repita sua senha"
              disabled={isPending}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-custom bg-background/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {/* Checkbox Termos (Obrigatório) */}
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5">
            <input
              id="aceitaTermos"
              name="aceitaTermos"
              type="checkbox"
              required
              disabled={isPending}
              className="w-4 h-4 rounded border-border-custom text-primary focus:ring-primary/20 bg-background/50 transition-colors cursor-pointer"
            />
          </div>
          <div className="text-sm">
            <label htmlFor="aceitaTermos" className="font-medium text-text-primary cursor-pointer">
              Eu concordo com os{' '}
              <a href="/termos" target="_blank" className="text-primary hover:underline">
                Termos de Serviço e Política de Privacidade
              </a>
              *
            </label>
          </div>
        </div>

        {/* Checkbox Marketing (Opcional) */}
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5">
            <input
              id="aceitaMarketing"
              name="aceitaMarketing"
              type="checkbox"
              disabled={isPending}
              className="w-4 h-4 rounded border-border-custom text-primary focus:ring-primary/20 bg-background/50 transition-colors cursor-pointer"
            />
          </div>
          <div className="text-sm">
            <label htmlFor="aceitaMarketing" className="text-text-secondary cursor-pointer">
              Aceito receber e-mails sobre novos cursos, ferramentas e dicas da PHD Academy.
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-primary/20 mt-6"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Concluir meu Cadastro'
        )}
      </button>

      <p className="text-center text-sm text-text-secondary mt-4">
        Já tem uma conta? <a href="/login" className="text-primary font-bold hover:underline">Faça login</a>
      </p>
    </form>
  )
}
