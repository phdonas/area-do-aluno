import { createClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ConfirmarSenhaForm } from '@/components/auth/ConfirmarSenhaForm'

export default async function ConfirmarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_code?: string; [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const code = params.code
  const errorParam = params.error
  const errorCode = params.error_code
  
  let isLinkExpired = errorCode === 'otp_expired' || errorParam === 'access_denied'

  // Troca o código por sessão no SERVIDOR (evita erro de PKCE)
  if (code && !isLinkExpired) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Erro ao validar código no servidor:', error.message)
      isLinkExpired = true
    }
  } else if (!code && !isLinkExpired) {
    // Se não tem código, verifica se já existe sessão ativa
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      isLinkExpired = true
    }
  }

  return (
    <main className="flex min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Decoração Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-light/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md apple-blur bg-surface/70 border border-border-custom rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {isLinkExpired ? (
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
          ) : (
            <ConfirmarSenhaForm />
          )}
        </div>
      </div>
    </main>
  )
}
