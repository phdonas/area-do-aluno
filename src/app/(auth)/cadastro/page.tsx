import { createClient } from '@/lib/supabase/server'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Metadata } from 'next'
import { AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cadastro | Área do Aluno',
  description: 'Crie sua conta no Ecossistema PH Donassolo',
}

interface CadastroPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function CadastroPage({ searchParams }: CadastroPageProps) {
  const { token } = await searchParams
  const supabase = await createClient()

  let initialEmail = ''
  let errorMsg = ''

  // Validação de Token de Convite (v5.2 - Ajustado para convites_matricula)
  if (token) {
    const { data: convite, error } = await supabase
      .from('convites_matricula')
      .select('*')
      .eq('token', token)
      .eq('usado', false)
      .single()

    if (error || !convite) {
      errorMsg = 'Este link de convite é inválido ou já foi utilizado.'
    } else {
      // Verifica se expirou (Padrão: 7 dias)
      const dataCriacao = new Date(convite.created_at)
      const dataExpiracao = new Date(dataCriacao)
      dataExpiracao.setDate(dataExpiracao.getDate() + 7)

      if (dataExpiracao < new Date()) {
        errorMsg = 'Este link de convite expirou (validade de 7 dias).'
      } else {
        initialEmail = convite.email
      }
    }
  }

  return (
    <main className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Decoração Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md apple-blur bg-surface/70 border border-border-custom rounded-[2.5rem] p-8 sm:p-12 shadow-xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary-dark to-primary-light rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20 mb-6 group overflow-hidden">
              <span className="text-2xl text-white font-bold">PH</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Crie sua Conta
            </h1>
            <p className="text-text-secondary text-sm mt-2">
              Junte-se ao nosso ecossistema de aprendizado
            </p>
          </div>

          {errorMsg ? (
            <div className="flex flex-col items-center gap-4 text-center p-6 bg-red-50/50 rounded-2xl border border-red-100">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div>
                <h3 className="font-bold text-red-900 text-lg">Convite Inválido</h3>
                <p className="text-red-700 text-sm mt-1">{errorMsg}</p>
                <a href="/login" className="mt-4 block text-primary font-bold hover:underline">Voltar para o Login</a>
              </div>
            </div>
          ) : (
            <RegisterForm initialEmail={initialEmail} token={token} />
          )}
        </div>

        <p className="mt-8 text-center text-sm text-text-muted font-medium">
          Ao prosseguir, você concorda com nossos <br className="sm:hidden" />
          <a href="#" className="underline hover:text-text-secondary">Termos de Serviço</a>
        </p>
      </div>
    </main>
  )
}
