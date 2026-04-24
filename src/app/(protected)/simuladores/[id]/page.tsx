'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink, Download, Monitor, Loader2, X } from 'lucide-react'
import { logFerramentaUsage } from '../actions'

export default function SimuladorPlayerPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const supabase = createClient()
  
  const [recurso, setRecurso] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function fetchRecurso() {
      try {
        const { data, error } = await supabase
          .from('recursos')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) {
          setError('Recurso não encontrado')
        } else {
          setRecurso(data)
          // Registrar uso na telemetria (sem aguardar para não travar a UI)
          console.log('📡 [Client] Tentando registrar telemetria (Player)...');
          logFerramentaUsage({
            ferramentaId: data.id,
            ferramentaNome: data.titulo,
            urlAcessada: data.arquivo_url
          }).then(res => {
            if (res?.success) console.log('✅ [Client] Telemetria registrada!');
            else console.error('❌ [Client] Falha na telemetria:', res?.error);
          }).catch(err => {
            console.error('💥 [Client] Erro crítico na telemetria:', err);
          });
        }
      } catch (err) {
        setError('Erro ao carregar recurso')
      } finally {
        setLoading(false)
      }
    }

    fetchRecurso()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-text-muted font-bold animate-pulse uppercase tracking-widest text-[10px]">Carregando Ferramenta...</p>
      </div>
    )
  }

  if (error || !recurso) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Monitor className="w-16 h-16 text-text-muted mb-4 opacity-20" />
        <h1 className="text-2xl font-bold text-text-primary">Recurso Indisponível</h1>
        <p className="text-text-secondary mt-2">{error || 'Este simulador ou ferramenta está temporariamente desativado.'}</p>
        <Link href="/dashboard" className="mt-6 text-primary font-bold hover:underline">Voltar ao Dashboard</Link>
      </div>
    )
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
           <button onClick={() => router.back()} className="text-[10px] font-black text-text-muted hover:text-text-primary transition-colors uppercase tracking-widest">
             Voltar para a Aula
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* BOTÃO SAIR GLOBAL (Top Right) */}
      <div className="fixed top-6 right-6 z-[200]">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-border-custom rounded-full shadow-lg hover:shadow-xl transition-all group active:scale-95"
        >
          <div className="w-5 h-5 flex items-center justify-center bg-rose-500 rounded-full text-white">
            <X size={14} strokeWidth={3} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">SAIR E VOLTAR</span>
        </button>
      </div>

      {/* Header do Player (Versão Minimalista p/ Simulação) */}
      <div className="bg-surface border-b border-border-custom px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-sm font-black text-text-primary uppercase tracking-widest leading-none">{recurso.titulo}</h1>
            <p className="text-[10px] font-bold text-indigo-500 leading-none mt-1.5 uppercase tracking-wider">Simulador Interativo</p>
          </div>
        </div>
      </div>

      {/* Iframe Viewport */}
      <div className="flex-1 bg-black relative overflow-hidden">
         <iframe 
            src={recurso.arquivo_url} 
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
         />
         
         {/* Overlay de carregamento sutil */}
         {!recurso.arquivo_url && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                <Monitor className="w-32 h-32 text-white animate-pulse" />
            </div>
         )}
      </div>
    </div>
  )
}
