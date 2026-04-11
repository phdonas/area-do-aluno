import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Award, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { CertificatePaper } from '@/components/CertificatePaper'
import { PrintCertButton } from '@/components/PrintCertButton'

export default async function CertificateViewPage({ 
  params 
}: { 
  params: Promise<{ emitidoId: string }> 
}) {
  const { emitidoId } = await params
  const supabase = await createClient()

  // Buscar emissão com config e dados do aluno/curso
  const { data: cert } = await supabase
    .from('certificados_emitidos')
    .select(`
      *,
      usuarios(full_name),
      cursos(titulo),
      certificados_config(*)
    `)
    .eq('id', emitidoId)
    .single()

  if (!cert) notFound()

  const config = cert.certificados_config
  const elements = config?.elements || []

  // Substituir variáveis dinâmicas nos elementos
  const renderedElements = elements.map((el: any) => {
    let content = el.content
    content = content.replace(/{nome}/g, cert.usuarios?.full_name || '')
    content = content.replace(/{curso}/g, cert.cursos?.titulo || '')
    content = content.replace(/{data}/g, new Date(cert.data_emissao).toLocaleDateString('pt-BR'))
    content = content.replace(/{codigo}/g, cert.codigo_verificacao)
    
    return { ...el, content }
  })

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 space-y-12 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-border-custom pb-12 print:hidden">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
              <Award className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase italic line-clamp-1">Seu Certificado</h1>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">{cert.cursos?.titulo}</p>
           </div>
        </div>
        <div className="flex gap-4">
           <PrintCertButton />
           <Link 
             href={`/verificar-certificado/${cert.codigo_verificacao}`}
             className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
           >
             <ShieldCheck className="w-4 h-4" /> Verificar Autenticidade
           </Link>
        </div>
      </header>

      <main className="flex justify-center">
         <div className="w-full max-w-[1000px]">
           <CertificatePaper 
             templateUrl={config?.template_url} 
             elements={renderedElements} 
           />
         </div>
      </main>

      <footer className="text-center pt-12 space-y-2 opacity-40 print:hidden">
         <p className="text-[10px] font-black uppercase tracking-[0.3em]">VALIDAÇÃO DIGITAL</p>
         <p className="text-[9px] font-bold">Código de Autenticidade: {cert.codigo_verificacao}</p>
      </footer>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: landscape; margin: 0; }
          body { margin: 0; }
          .min-h-screen { padding: 0 !important; margin: 0 !important; }
        }
      `}} />
    </div>
  )
}
