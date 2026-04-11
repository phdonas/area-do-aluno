import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink, Download, Monitor } from 'lucide-react'

export default async function SimuladorPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recurso, error } = await supabase
    .from('recursos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !recurso) {
    notFound()
  }

  // Verificar se o recurso está ativo
  if (recurso.status !== 'ativo') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Monitor className="w-16 h-16 text-text-muted mb-4 opacity-20" />
        <h1 className="text-2xl font-bold text-text-primary">Recurso Indisponível</h1>
        <p className="text-text-secondary mt-2">Este simulador ou ferramenta está temporariamente desativado.</p>
        <Link href="/dashboard" className="mt-6 text-primary font-bold hover:underline">Voltar ao Dashboard</Link>
      </div>
    )
  }

  // Se for abertura em aba externa ou download, redirecionamos ou mostramos um aviso
  if (recurso.abertura_tipo === 'nova_aba' || recurso.abertura_tipo === 'download') {
    return (
      <div className="max-w-xl mx-auto mt-20 p-10 bg-surface border border-border-custom rounded-[40px] text-center shadow-2xl">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mx-auto mb-6">
           {recurso.abertura_tipo === 'download' ? <Download className="w-10 h-10" /> : <ExternalLink className="w-10 h-10" />}
        </div>
        <h1 className="text-3xl font-black text-text-primary tracking-tighter mb-2">{recurso.titulo}</h1>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed">{recurso.descricao || 'Este recurso será aberto em uma ferramenta externa para melhor experiência.'}</p>
        
        <a 
          href={recurso.arquivo_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          {recurso.abertura_tipo === 'download' ? 'Baixar Arquivo Agora' : 'Acessar Ferramenta Externa'}
          <ExternalLink className="w-5 h-5" />
        </a>
        
        <div className="mt-10 pt-8 border-t border-border-custom">
           <button onClick={() => redirect(-1)} className="text-xs font-bold text-text-muted hover:text-text-primary transition-colors">Voltar para a Aula</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header do Player */}
      <div className="bg-surface border-b border-border-custom px-6 py-4 flex items-center justify-between z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 hover:bg-black/5 rounded-xl text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-black text-text-primary uppercase tracking-widest">{recurso.titulo}</h1>
            <p className="text-[10px] font-bold text-indigo-500 leading-none mt-0.5">SIMULADOR INTERATIVO</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="text-[10px] font-black text-text-muted bg-background border border-border-custom px-3 py-1.5 rounded-full uppercase tracking-tighter">Ambiente Seguro</div>
        </div>
      </div>

      {/* Iframe Viewport */}
      <div className="flex-1 bg-black relative">
         <iframe 
            src={recurso.arquivo_url} 
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
         />
         
         {/* Overlay de carregamento (opcional visual) */}
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
            <Monitor className="w-32 h-32 text-white animate-pulse" />
         </div>
      </div>
    </div>
  )
}
