import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Faça login para acessar a PHD Academy',
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
            <div className="w-16 h-16 bg-primary-dark rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20 mb-6 relative group overflow-hidden border border-white/10">
               <div className="absolute inset-0 bg-white/5 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 pointer-events-none"/>
              <span className="text-2xl text-white font-black tracking-tighter">PHD</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Bem-vindo(a) de volta
            </h1>
            <p className="text-text-secondary text-sm mt-2 font-medium">
              Acesse seu ecossistema de aprendizado
            </p>
          </div>

          <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/30" /></div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-8 pt-8 border-t border-border-custom">
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-2xl">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1 text-center">Aviso Importante</p>
              <p className="text-[11px] text-text-secondary text-center leading-tight">
                A nova Área do Aluno será liberada em <b>maio/2026</b>. 
                <a href="/em-breve" className="block mt-2 text-primary font-bold hover:underline">Clique aqui para saber mais e se cadastrar</a>
              </p>
            </div>
          </div>
          
        </div>
        
        {/* Footer info do form */}
        <p className="mt-8 text-center text-sm text-text-muted font-medium">
          Ao prosseguir, você concorda com nossos <a href="#" className="underline hover:text-text-secondary">Termos de Serviço</a>
        </p>
      </div>
    </main>
  )
}
