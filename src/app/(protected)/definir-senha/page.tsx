'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { KeyRound, ShieldCheck, Loader2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DefinirSenhaPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return setError('As senhas não coincidem')
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres')

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push('/onboarding/perfil-profissional')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao definir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface border border-border-custom rounded-[48px] p-12 shadow-2xl space-y-10"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tighter italic">Sua Segurança.</h1>
          <p className="text-sm text-text-muted font-medium uppercase tracking-widest">Defina sua senha de acesso</p>
        </div>

        {success ? (
          <div className="py-10 text-center space-y-4">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Senha definida com sucesso!</p>
             <p className="text-[10px] text-text-muted font-black animate-pulse uppercase tracking-[0.2em]">Redirecionando para o Cadastro...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest group-focus-within:text-primary transition-colors">Nova Senha</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-background border border-border-custom focus:border-primary p-5 rounded-2xl text-text-primary outline-none transition-all placeholder:text-text-muted/30 shadow-inner"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest group-focus-within:text-primary transition-colors">Confirmar Senha</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-background border border-border-custom focus:border-primary p-5 rounded-2xl text-text-primary outline-none transition-all placeholder:text-text-muted/30 shadow-inner"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center tracking-widest">{error}</p>}

            <button
              disabled={loading}
              className="w-full bg-text-primary text-background py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all disabled:opacity-20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Definir e Prosseguir
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
