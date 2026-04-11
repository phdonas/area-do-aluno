'use client'

import { useState } from 'react'
import { LayoutTemplate, Layers, Megaphone, CheckCircle2, PenTool, CheckSquare } from 'lucide-react'

interface CourseEditorTabsProps {
  vendasContent: React.ReactNode
  conteudoContent: React.ReactNode
  stats?: {
    modulos: number
    aulas: number
    recursos: number
    testes: number
  }
}

export function CourseEditorTabs({ vendasContent, conteudoContent, stats }: CourseEditorTabsProps) {
  const [activeTab, setActiveTab] = useState<'vendas' | 'conteudo'>('vendas')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-border-custom p-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('vendas')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'vendas'
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-text-muted hover:text-text-primary hover:bg-background'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Página de Vendas
          </button>
          <button
            onClick={() => setActiveTab('conteudo')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'conteudo'
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-text-muted hover:text-text-primary hover:bg-background'
            }`}
          >
            <Layers className="w-4 h-4" />
            Grade / Conteúdo
          </button>
        </div>

        {/* Mini Stats Bar */}
        <div className="hidden md:flex items-center gap-6 px-6 border-l border-border-custom">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Módulos</span>
            <span className="text-sm font-black text-text-primary">{stats?.modulos || 0}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Aulas</span>
            <span className="text-sm font-black text-text-primary">{stats?.aulas || 0}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Ferramentas</span>
            <span className="text-sm font-black text-text-primary">{stats?.recursos || 0}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Testes</span>
            <span className="text-sm font-black text-text-primary">{stats?.testes || 0}</span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'vendas' ? (
          <div className="space-y-8">
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-600 text-xs font-bold leading-relaxed">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Estás a editar a Vitrine do Curso. Estes dados aparecem na página pública e influenciam a decisão de compra do aluno.
            </div>
            {vendasContent}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl flex items-center gap-3 text-indigo-600 text-xs font-bold leading-relaxed">
              <Layers className="w-5 h-5 shrink-0" />
              Aqui geres a estrutura técnica. Podes herdar módulos da biblioteca global ou criar conteúdos exclusivos para este curso.
            </div>
            {conteudoContent}
          </div>
        )}
      </div>
    </div>
  )
}
