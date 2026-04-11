'use client'

import { useState, useEffect } from 'react'
import { 
  Lightbulb, 
  Download, 
  Search, 
  BookOpen, 
  Layers, 
  MonitorPlay,
  Calendar,
  FileText,
  ChevronRight,
  RefreshCw,
  Printer
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

export default function WorkspaceInsightsPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCurso, setSelectedCurso] = useState<string>('todos')
  const supabase = createClient()

  useEffect(() => {
    async function loadInsights() {
      const { data, error } = await supabase
        .from('insights')
        .select(`
          id,
          conteudo,
          created_at,
          aulas (
            titulo,
            modulos (
              titulo,
              cursos (id, titulo)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setInsights(data)
      }
      setLoading(false)
    }
    loadInsights()
  }, [])

  // Lista de cursos únicos para o filtro
  const cursosUnicos = Array.from(new Set(insights.map(i => i.aulas?.modulos?.cursos?.titulo))).filter(Boolean)

  const filteredInsights = insights.filter(i => {
    const matchesSearch = i.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.aulas?.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCurso = selectedCurso === 'todos' || i.aulas?.modulos?.cursos?.titulo === selectedCurso
    return matchesSearch && matchesCurso
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER - OCULTO NO PRINT */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                  <Lightbulb className="w-6 h-6 text-amber-500" />
               </div>
               <h1 className="text-4xl font-black text-text-primary tracking-tighter">Seu Workspace de Insights</h1>
            </div>
            <p className="text-text-secondary font-medium max-w-xl">
               Consolide todo o seu conhecimento. Aqui você gerencia seus pensamentos estratégicos capturados durante as aulas.
            </p>
         </div>

         <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              disabled={filteredInsights.length === 0}
              className="px-6 py-3 bg-white text-black border border-border-custom rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
               <Printer className="w-4 h-4" /> Exportar PDF
            </button>
         </div>
      </header>

      {/* FILTROS - OCULTO NO PRINT */}
      <section className="bg-surface border border-border-custom rounded-[2.5rem] p-6 shadow-sm flex flex-col md:flex-row gap-4 print:hidden">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar por palavra-chave ou aula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border border-border-custom rounded-xl text-sm focus:border-primary outline-none transition-all"
            />
         </div>
         <div className="flex items-center gap-2 min-w-[200px]">
            <BookOpen className="w-4 h-4 text-text-muted" />
            <select 
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
              className="flex-1 bg-background border border-border-custom px-4 py-3 rounded-xl text-sm font-bold focus:border-primary outline-none"
            >
               <option value="todos">Todos os Cursos</option>
               {cursosUnicos.map((c: any) => (
                 <option key={c} value={c}>{c}</option>
               ))}
            </select>
         </div>
      </section>

      {/* CONTEÚDO DE INSIGHTS */}
      <main className="space-y-10">
         {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
               <RefreshCw className="w-10 h-10 text-primary animate-spin" />
               <p className="text-xs font-black text-text-muted uppercase tracking-widest">Sincronizando seus insights...</p>
            </div>
         ) : filteredInsights.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-surface rounded-[3rem] border border-dashed border-border-custom">
               <FileText className="w-12 h-12 text-text-muted mx-auto opacity-20" />
               <p className="text-text-secondary font-medium">Nenhum insight encontrado. Comece a anotar durante as aulas!</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 gap-8 print:block">
               {filteredInsights.map((i, idx) => (
                 <motion.div 
                   key={i.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-surface border border-border-custom rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all shadow-sm group print:border-b print:rounded-none print:shadow-none print:mb-8"
                 >
                    <div className="p-8 md:p-12 space-y-6">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-custom pb-6">
                          <div className="flex flex-wrap items-center gap-3">
                             <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3" /> {i.aulas?.modulos?.cursos?.titulo}
                             </div>
                             <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Layers className="w-3 h-3" /> {i.aulas?.modulos?.titulo}
                             </div>
                             <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <MonitorPlay className="w-3 h-3" /> {i.aulas?.titulo}
                             </div>
                          </div>
                          <div className="flex items-center gap-2 text-text-muted">
                             <Calendar className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-black uppercase">{new Date(i.created_at).toLocaleDateString()}</span>
                          </div>
                       </div>

                       <div className="relative">
                          <p className="text-lg md:text-xl text-text-primary font-medium leading-[1.6] whitespace-pre-wrap">
                             {i.conteudo}
                          </p>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
         )}
      </main>

      {/* ESTILO DE IMPRESSÃO (PDF) */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .max-w-6xl { max-width: 100% !important; margin: 0 !important; }
          main { space: 0 !important; }
          h1, h2, h3, p, span { color: black !important; }
          .bg-surface { background: transparent !important; }
          .border-border-custom { border-color: #eee !important; }
          .bg-primary/10, .bg-indigo-500/10, .bg-emerald-500/10 { 
            background: #f5f5f5 !important; 
            border: 1px solid #ddd !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  )
}
