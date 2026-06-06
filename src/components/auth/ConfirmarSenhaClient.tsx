'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ConfirmarSenhaForm } from './ConfirmarSenhaForm'

type Status = 'loading' | 'ready' | 'expired'

export function ConfirmarSenhaClient() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    async function init() {
      const supabase = createClient()

      // Fluxo implícito: token no hash da URL (#access_token=...)
      const hash = window.location.hash.substring(1)
      if (hash) {
        const params = new URLSearchParams(hash)
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        const type = params.get('type')

        if (access_token && refresh_token && type === 'recovery') {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (!error) {
            window.history.replaceState(null, '', window.location.pathname)
            setStatus('ready')
            return
          }
          setStatus('expired')
          return
        }
      }

      // Fluxo PKCE/OTP: sessão já estabelecida pelo /auth/callback via cookie
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStatus('ready')
        return
      }

      setStatus('expired')
    }

    init()
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center text-red-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-primary">Link Expirado</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Este link de recuperação já foi utilizado ou expirou por segurança.
          </p>
        </div>
        <Link
          href="/esqueci-senha"
          className="inline-flex w-full justify-center items-center gap-2 py-3.5 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all"
        >
          Solicitar Novo Link
        </Link>
      </div>
    )
  }

  return <ConfirmarSenhaForm />
}
