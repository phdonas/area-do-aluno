import { redirect } from 'next/navigation'

export default function LojaIndexPage() {
  // Redireciona para o dashboard onde a vitrine (upsell) já está implementada
  redirect('/dashboard#complete-seu-treinamento')
}
