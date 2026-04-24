'use client'

import React from 'react'
import { Play, FileCode, CheckCircle2, Bot, ArrowRight } from 'lucide-react'
import { toggleAulaConcluida } from '../../app/(protected)/player/actions'
import { logFerramentaUsage } from '../../app/(protected)/simuladores/actions'

interface InteractiveCTAProps {
  url: string
  titulo: string
  tipo: 'ferramenta' | 'questionario' | 'simulador' | 'recurso'
  metadata?: string
  aulaId?: string
  cursoId?: string
  usuarioEmail?: string // Adicionado para facilitar log se necessário
}

export const InteractiveCTA: React.FC<InteractiveCTAProps> = ({ 
  url, 
  titulo, 
  tipo, 
  metadata,
  aulaId,
  cursoId
}) => {
  if (!url) return null

  const handleAction = async (e: React.MouseEvent) => {
    // 1. Registra a telemetria antes de abrir (segurança extra)
    if (tipo === 'ferramenta' || tipo === 'simulador') {
      logFerramentaUsage({
        ferramentaId: aulaId, // Usamos o ID da aula se não tiver o do recurso
        ferramentaNome: titulo,
        urlAcessada: url
      }).catch(err => console.error('Erro ao registrar log no clique:', err))
    }

    // 2. Rastreamento e Auto-conclusão (Desativado p/ Ferramentas)
    if (aulaId && cursoId && tipo !== 'ferramenta') {
      try {
        await toggleAulaConcluida(aulaId, true, cursoId)
      } catch (err) {
        console.error('Falha ao registrar progresso automático:', err)
      }
    }
  }

  const getStyle = () => {
    switch (tipo) {
      case 'questionario':
        return {
          bg: 'from-primary to-primary-dark',
          icon: <CheckCircle2 size={32} />,
          label: 'Fazer Avaliação Agora',
          sub: 'Teste seu conhecimento prático',
          color: 'text-primary-dark',
          hover: 'group-hover:bg-[#1B3A6B]'
        }
      case 'simulador':
        return {
          bg: 'from-secondary to-secondary-dark',
          icon: <Bot size={32} />,
          label: 'Abrir Simulador de IA',
          sub: 'Treinamento em ambiente seguro',
          color: 'text-indigo-900',
          hover: 'group-hover:bg-[#6366F1]'
        }
      case 'ferramenta':
      default:
        return {
          bg: 'from-primary to-secondary',
          icon: <FileCode size={32} />,
          label: 'Abrir Ferramenta / Simulador',
          sub: 'Ambiente de execução controlado',
          color: 'text-primary-dark',
          hover: 'group-hover:bg-primary-dark'
        }
    }
  }

  const s = getStyle()
  const isExternal = url.startsWith('http')
  const isWrapped = url.includes('/simuladores/') || url.includes('/simuladores/external')
  
  // Forçar o wrapping se for ferramenta e estiver apontando direto para o HTML externo
  const finalUrl = (tipo === 'ferramenta' || tipo === 'simulador') && !isWrapped && isExternal
    ? `/simuladores/external?url=${encodeURIComponent(url)}&titulo=${encodeURIComponent(titulo)}&tipo=${encodeURIComponent(tipo)}`
    : url;

  // Se agora está envelopado ou é interno, usamos _self
  const isNowWrapped = finalUrl.includes('/simuladores/')
  const target = (tipo === 'ferramenta' && isNowWrapped) ? "_self" : (isExternal && !isNowWrapped ? "_blank" : "_self")

  return (
    <div className="my-8 group">
      <a 
        href={finalUrl} 
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : ""}
        onClick={handleAction}
        className={`relative flex items-center justify-between p-6 md:p-8 bg-gradient-to-r ${s.bg} rounded-md border border-white/10 shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] overflow-hidden`}
      >
        {/* Efeito de brilho */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-colors" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner group-hover:scale-110 transition-transform">
            {s.icon}
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">
              {metadata || s.sub}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tight leading-none font-display">
              {s.label}
            </h3>
            <span className="text-xs text-white/70 mt-2 font-medium">
              {titulo}
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-2 relative z-10">
           <div className={`px-5 py-3 bg-white ${s.color} rounded-md font-black text-[11px] uppercase tracking-widest flex items-center gap-2 group-hover:bg-accent group-hover:text-white transition-all shadow-xl`}>
             Acessar {tipo === 'questionario' ? 'Prova' : 'Recurso'} <ArrowRight size={14} />
           </div>
           {isExternal && (
             <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mr-2">Abre em nova aba</span>
           )}
        </div>
      </a>
    </div>
  )
}
