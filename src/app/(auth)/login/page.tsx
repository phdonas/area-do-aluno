import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Área do Aluno',
  description: 'Faça login para acessar o Ecossistema PH Donassolo',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Elemento de decoração background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 hover:bg-primary-light/30 transition-colors blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-light/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md apple-blur bg-surface/70 border border-border-custom rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary-dark to-primary-light rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20 mb-6 relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 pointer-events-none"/>
              <span className="text-2xl text-white font-bold tracking-tighter">PH</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Bem-vindo(a) de volta
            </h1>
            <p className="text-text-secondary text-sm mt-2 font-medium">
              Acesse seu ecossistema de aprendizado
            </p>
          </div>

          <LoginForm />
          
        </div>
        
        {/* Footer info do form */}
        <p className="mt-8 text-center text-sm text-text-muted font-medium">
          Ao prosseguir, você concorda com nossos <a href="#" className="underline hover:text-text-secondary">Termos de Serviço</a>
        </p>
      </div>
    </main>
  )
}
