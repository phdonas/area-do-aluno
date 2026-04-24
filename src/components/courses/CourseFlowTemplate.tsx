'use client'

import React, { useState } from 'react'
import '@/styles/course-flow.css'
import { ArrowRight, Download, Play, CheckCircle2, ChevronDown } from 'lucide-react'
import { logFerramentaUsage } from '@/app/(protected)/simuladores/actions'

interface Tool {
  id: string
  num: string | number
  phase: 1 | 2 | 3 | 'x'
  tag: string
  title: string
  description: string
  target?: string
  context?: string
  instructions?: string
  result: string
  status: 'ok' | 'build'
  actionUrl?: string
  downloadUrl?: string
}

interface CourseFlowTemplateProps {
  titulo: string
  subtitulo: string
  meta: {
    ferramentas: string
    fases: string
    perfis: string
    versao: string
  }
  introTitle: string
  introText: string
  tools: Tool[]
  completedToolsIds?: string[]
}

export const CourseFlowTemplate: React.FC<CourseFlowTemplateProps> = ({
  titulo,
  subtitulo,
  meta,
  introTitle,
  introText,
  tools,
  completedToolsIds = []
}) => {
  const [openId, setOpenId] = useState<string | null>(tools[0]?.id || null)

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  const getPhaseClass = (phase: Tool['phase']) => {
    if (phase === 1) return 'f1'
    if (phase === 2) return 'f2'
    if (phase === 3) return 'f3'
    return 'fx'
  }

  const handleAction = async (url: string, title: string, id?: string) => {
    console.log('📡 [Flow] Iniciando acesso via mapa:', title);
    
    // Registrar telemetria preventivamente
    logFerramentaUsage({
      ferramentaId: id,
      ferramentaNome: title,
      urlAcessada: url
    }).then(res => {
      if (res.success) console.log('✅ [Flow] Telemetria registrada');
      else console.error('❌ [Flow] Falha na telemetria:', res.error);
    }).catch(console.error);
  }

  const getWrappedUrl = (url: string, title: string) => {
    if (!url) return url;
    const isExternal = url.startsWith('http');
    const isAlreadyWrapped = url.includes('/simuladores/');
    const isInternalPlayer = url.includes('/player/');

    // Se for um arquivo HTML externo e não estiver envelopado, envolver
    if (isExternal && !isAlreadyWrapped && !isInternalPlayer) {
      return `/simuladores/external?url=${encodeURIComponent(url)}&titulo=${encodeURIComponent(title)}&tipo=ferramenta`;
    }
    return url;
  }

  return (
    <div className="course-flow-container rounded-[24px] overflow-hidden">
      {/* 1. CAPA */}
      <div className="flow-cover">
        <div className="flow-cover-deco">{(titulo || '?').charAt(0)}</div>
        <div className="flow-cover-top">
          <div className="flow-cover-brand">PHD ACADEMY · Programa Managing & Coaching</div>
          <div className="flow-cover-badge">Uso Interno · Confidencial</div>
        </div>
        <h1>{titulo}</h1>
        <p className="flow-cover-sub">{subtitulo}</p>
        <div className="flow-cover-meta">
          <div className="flow-cover-meta-item">
            <label>Ferramentas</label>
            <span>{meta.ferramentas}</span>
          </div>
          <div className="flow-cover-meta-item">
            <label>Fases</label>
            <span>{meta.fases}</span>
          </div>
          <div className="flow-cover-meta-item">
            <label>Perfis cobertos</label>
            <span>{meta.perfis}</span>
          </div>
          <div className="flow-cover-meta-item">
            <label>Versão</label>
            <span>{meta.versao}</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 lg:p-12">
        {/* 2. INTRODUÇÃO */}
        <div className="flow-section">
          <div className="flow-section-label">Visão Geral do Sistema</div>
          <h2 className="flow-section-title">{introTitle}</h2>
          <p className="flow-section-intro">{introText}</p>

          <div className="bg-primary/5 border border-primary/10 text-text-primary px-5 py-4 rounded-xl flex items-center gap-3 mb-8 w-fit shadow-sm">
             <span className="text-xl">🖱️</span>
             <p className="text-xs font-bold m-0 uppercase tracking-widest">
               Clique no card da jornada ou no descritivo abaixo para acessar a ferramenta
             </p>
          </div>

          {/* Fluxo visual sequencial resumido */}
          <div className="flow-sequence">
            {tools.map((t) => {
              const isCompleted = completedToolsIds.includes(t.id);
              const cardContent = (
                <div className={`flow-step-card ${isCompleted ? 'completed' : ''}`}>
                  <div className={`flow-step-num ${getPhaseClass(t.phase)}`}>
                    {isCompleted ? <CheckCircle2 size={24} /> : t.num}
                  </div>
                  <h4>{t.title}</h4>
                </div>
              );

              return (
                <div key={`seq-${t.id}`} className="flow-step-wrapper">
                  {t.actionUrl ? (
                    <a 
                      href={getWrappedUrl(t.actionUrl, t.title)} 
                      target={getWrappedUrl(t.actionUrl, t.title).includes('/simuladores/') ? "_self" : "_blank"} 
                      rel="noopener noreferrer" 
                      className="no-underline"
                      onClick={() => handleAction(t.actionUrl!, t.title, t.id)}
                    >
                      {cardContent}
                    </a>
                  ) : (
                    cardContent
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. LISTA DE FERRAMENTAS (ACCORDIONS) */}
        <div className="flow-section">
          <div className="flow-section-label">Mapa de Atuação</div>
          
          <div className="space-y-4">
            {tools.map((tool) => (
              <div 
                key={tool.id} 
                className={`flow-tool-card ${openId === tool.id ? 'open' : ''}`}
              >
                <div className="flow-tool-header" onClick={() => toggle(tool.id)}>
                  <div className={`flow-tool-num ${getPhaseClass(tool.phase)} ${completedToolsIds.includes(tool.id) ? 'completed-num' : ''}`}>
                    {completedToolsIds.includes(tool.id) ? <CheckCircle2 size={24} /> : tool.num}
                  </div>
                  <div className="flow-tool-title-block">
                    <div className="flex items-center gap-2">
                      <span className="flow-tool-tag">{tool.tag}</span>
                      {/* Ocultado a pedido do usuário */}
                    </div>
                    <h4>{tool.title}</h4>
                  </div>
                  <div className="flow-tool-toggle">
                    <ChevronDown size={20} />
                  </div>
                </div>

                <div className="flow-tool-body">
                   <div className="flow-tool-grid">
                      <div className="flow-tool-cell">
                        <label>Para que serve</label>
                        <p>{tool.description}</p>
                      </div>
                      <div className="flow-tool-cell">
                        <label>Público / Contexto</label>
                        <p>{tool.target || 'Todos os perfis'}</p>
                      </div>
                      <div className="flow-tool-cell full">
                        <label>Como Utilizar</label>
                        <p>{tool.instructions || 'Siga as orientações da aula correspondente para aplicar esta ferramenta com sucesso.'}</p>
                      </div>
                   </div>

                   <div className="flow-tool-result">
                      <h5>Resultado prático esperado</h5>
                      <p>{tool.result}</p>
                   </div>

                   <div className="flow-tool-action">
                      {tool.actionUrl && (
                        <a 
                          href={getWrappedUrl(tool.actionUrl, tool.title)} 
                          target={getWrappedUrl(tool.actionUrl, tool.title).includes('/simuladores/') ? "_self" : "_blank"} 
                          rel="noopener noreferrer" 
                          className="btn-flow btn-flow-primary"
                          onClick={() => handleAction(tool.actionUrl!, tool.title, tool.id)}
                        >
                          <Play size={16} fill="white" />
                          Acessar Ferramenta
                        </a>
                      )}
                      {tool.downloadUrl && (
                        <a href={tool.downloadUrl} download className="btn-flow btn-flow-outline">
                          <Download size={16} />
                          Download
                        </a>
                      )}
                   </div>

                   <div className="mt-6">
                     <span className={`flow-status-badge ${tool.status === 'ok' ? 'flow-status-ok' : ''}`}>
                       {tool.status === 'ok' ? '✓ Disponível' : '⋯ Em Construção'}
                     </span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RODAPÉ INTERNO */}
      <footer className="mt-20 p-12 bg-[#1B3A6B] text-white/40 flex justify-between items-center text-[10px] uppercase tracking-widest font-mono">
        <div>PHD ACADEMY · Managing & Coaching · v6.0</div>
        <div>{new Date().getFullYear()} © Todos os direitos reservados</div>
      </footer>
    </div>
  )
}
