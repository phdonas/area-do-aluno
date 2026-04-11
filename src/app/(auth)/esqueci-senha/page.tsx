import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recuperar Senha | Área do Aluno',
  description: 'Recupere o acesso à sua conta na Área do Aluno PH Donassolo',
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Decoração Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-light/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md apple-blur bg-surface/70 border border-border-custom rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Recuperar Senha
            </h1>
            <p className="text-text-secondary text-sm mt-2 font-medium">
              Não se preocupe, vamos ajudar você a voltar.
            </p>
          </div>

          <ForgotPasswordForm />
          
        </div>
      </div>
    </main>
  )
}
