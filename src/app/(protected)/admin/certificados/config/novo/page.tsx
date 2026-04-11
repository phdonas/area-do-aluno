import { createAdminClient } from '@/lib/supabase/admin'
import { CertificateDesigner } from '../CertificateDesigner'
import { saveCertificateConfig } from '../../actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NovoCertificatePage() {
  const supabase = createAdminClient()

  const { data: cursos } = await supabase
    .from('cursos')
    .select('id, titulo')
    .order('titulo')

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-6 md:p-10">
      <header className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/certificados/config" 
            className="p-3 bg-surface border border-border-custom rounded-2xl text-text-muted hover:text-primary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-1 block">Editor de Ativos</span>
            <h1 className="text-3xl font-black text-text-primary tracking-tighter italic uppercase">Novo Template de Certificado</h1>
          </div>
        </div>
      </header>

      <main className="pt-6">
        <CertificateDesigner 
          cursos={cursos || []} 
          saveAction={saveCertificateConfig} 
        />
      </main>
    </div>
  )
}
