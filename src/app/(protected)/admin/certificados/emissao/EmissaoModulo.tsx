'use client'

import React, { useState, useMemo } from 'react'
import { UserCheck, Award, Send, Search, Filter, CheckCircle2, ChevronDown } from 'lucide-react'
import { emitirCertificadoManual } from '../actions'

interface Aluno {
  id: string
  full_name: string
  email: string
}

interface Config {
  id: string
  curso_id: string
  cursos: { titulo: string }
}

interface EmissaoModuloProps {
  alunos: Aluno[]
  configs: Config[]
  idsComCertificadoPorCurso: Record<string, string[]> // curso_id -> [usuario_ids]
}

export default function EmissaoModulo({ alunos, configs, idsComCertificadoPorCurso }: EmissaoModuloProps) {
  const [cursoId, setCursoId] = useState('')
  const [search, setSearch] = useState('')
  const [somenteSemCertificado, setSomenteSemCertificado] = useState(true)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Filtragem Dinâmica de Alunos Elitizada
  const alunosFiltrados = useMemo(() => {
    return alunos.filter(aluno => {
      // 1. Filtro de Texto (Nome ou E-mail)
      const matchesSearch = 
        aluno.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        aluno.email?.toLowerCase().includes(search.toLowerCase())
      
      if (!matchesSearch) return false

      // 2. Filtro de "Sem Certificado"
      if (somenteSemCertificado && cursoId) {
        const jaPossui = idsComCertificadoPorCurso[cursoId]?.includes(aluno.id)
        if (jaPossui) return false
      }

      return true
    }).slice(0, 100) // Performance: Limitar a 100 resultados na UI
  }, [alunos, search, cursoId, somenteSemCertificado, idsComCertificadoPorCurso])

  const selectedConfig = configs.find(c => c.curso_id === cursoId)

  async function handleSubmit(formData: FormData) {
    if (!cursoId) return alert('Por favor, selecione um curso.')
    
    // Adicionar a config_id correta baseada no curso selecionado
    if (selectedConfig) {
      formData.append('config_id', selectedConfig.id)
    }

    try {
      setStatus(null)
      await emitirCertificadoManual(formData)
      setStatus({ type: 'success', message: 'Certificado emitido com sucesso!' })
      // Resetar form se necessário ou manter para próximas emissões
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Erro ao emitir certificado.' })
    }
  }

  return (
    <div className="bg-surface border border-border-custom rounded-[3rem] p-8 md:p-10 space-y-8 sticky top-32 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-sm font-black text-text-primary uppercase tracking-widest italic leading-none">Nova Emissão</h2>
        </div>
        {status?.type === 'success' && (
          <div className="flex items-center gap-2 text-emerald-500 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sucesso</span>
          </div>
        )}
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* FILTRO 1: CURSO / TEMPLATE */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-text-muted px-2 flex items-center gap-2">
            <Award className="w-3.5 h-3.5" /> 1. Certificado do Curso
          </label>
          <div className="relative group">
            <select 
              name="curso_id" 
              required 
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm font-bold focus:border-emerald-500 transition-all appearance-none outline-none group-hover:border-emerald-500/50"
            >
              <option value="">Selecione o Curso...</option>
              {configs.map(c => (
                <option key={c.id} value={c.curso_id}>{c.cursos?.titulo}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>

        {/* FILTRO 2: BUSCA DE ALUNO */}
        <div className="space-y-4 pt-4 border-t border-border-custom border-dashed">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-text-muted px-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Search className="w-3.5 h-3.5" /> 2. Localizar Aluno</span>
              <span className="text-[9px] opacity-50">{alunosFiltrados.length} encontrados</span>
            </label>
            <div className="relative group">
               <input 
                 type="text"
                 placeholder="Digite nome ou e-mail..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 pl-12 text-sm font-bold focus:border-emerald-500 transition-all outline-none"
               />
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-emerald-500 transition-colors" />
            </div>
          </div>

          <div className="px-2 flex items-center gap-6">
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={somenteSemCertificado}
                    onChange={(e) => setSomenteSemCertificado(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-6 bg-border-custom rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-text-primary transition-colors">Apenas pendentes</span>
             </label>
          </div>

          <div className="space-y-2">
            <select 
              name="usuario_id" 
              required 
              className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-sm font-bold focus:border-emerald-500 transition-all appearance-none outline-none h-[60px]"
            >
              <option value="">{alunosFiltrados.length > 0 ? 'Selecione o Aluno...' : 'Nenhum aluno encontrado'}</option>
              {alunosFiltrados.map(a => (
                <option key={a.id} value={a.id}>
                  {a.full_name} ({a.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {status?.type === 'error' && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
             <p className="text-[10px] font-bold text-red-500 text-center">{status.message}</p>
          </div>
        )}

        <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 space-y-2">
           <p className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-2 italic">
              <Filter className="w-3.5 h-3.5" /> Atenção Administrativa
           </p>
           <p className="text-[9px] text-emerald-700/70 font-medium leading-relaxed">
             A emissão manual gera um código irrevogável e notifica o aluno no dashboard. Use apenas para conclusões reconhecidas.
           </p>
        </div>

        <button 
          type="submit"
          className="w-full py-5 bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 group"
        >
          <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Confirmar Emissão de Mérito
        </button>
      </form>
    </div>
  )
}
