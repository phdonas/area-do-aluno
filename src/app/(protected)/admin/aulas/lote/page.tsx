'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, Plus, Trash2, Save, Table, AlertCircle, 
  CheckCircle2, Loader2, Video, Copy, HelpCircle, Download
} from 'lucide-react'
import { createAulasLote, checkExistingAulas, fetchYoutubePlaylist } from '../actions'
import { formatDuration, parseDurationToSeconds } from '@/lib/formatter'

interface AulaRow {
  id: number;
  titulo: string;
  video_url: string;
  duracao: string;
  isDuplicate?: boolean;
}

export default function InclusaoLotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [ytUrl, setYtUrl] = useState('')
  const [fetchingYT, setFetchingYT] = useState(false)
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  
  const [rows, setRows] = useState<AulaRow[]>([
    { id: 1, titulo: '', video_url: '', duracao: '' },
    { id: 2, titulo: '', video_url: '', duracao: '' },
    { id: 3, titulo: '', video_url: '', duracao: '' },
    { id: 4, titulo: '', video_url: '', duracao: '' },
    { id: 5, titulo: '', video_url: '', duracao: '' },
  ])

  useEffect(() => {
    const handleInjectEvent = (e: any) => {
      handleInjectData(e.detail);
    };
    window.addEventListener('ph-inject-data', handleInjectEvent);
    return () => window.removeEventListener('ph-inject-data', handleInjectEvent);
  }, []);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), titulo: '', video_url: '', duracao: '' }])
  }

  const removeRow = (index: number) => {
    if (rows.length === 1) return
    const newRows = [...rows]
    newRows.splice(index, 1)
    setRows(newRows)
  }

  const updateRow = (index: number, field: keyof AulaRow, value: any) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value, isDuplicate: false }
    setRows(newRows)
  }

  const handleSave = async () => {
    // Filtrar apenas as linhas preenchidas e que NÃO são duplicadas
    const rowsToSave = rows.filter(r => r.titulo.trim() !== '' && !r.isDuplicate)
    
    if (rowsToSave.length === 0) {
      const hasOnlyDuplicates = rows.some(r => r.isDuplicate && r.titulo.trim() !== '')
      setStatus({ 
        type: 'error', 
        message: hasOnlyDuplicates 
          ? 'Nenhuma aula nova para salvar. Verifique se as novas linhas já existem no acervo.' 
          : 'Preencha pelo menos o título de uma aula válida.' 
      })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const res = await createAulasLote(rowsToSave.map(r => ({
        titulo: r.titulo,
        video_url: r.video_url,
        duracao: r.duracao
      })))

      if (res.success) {
        const skipped = rows.filter(r => r.isDuplicate && r.titulo.trim() !== '').length
        setStatus({ 
          type: 'success', 
          message: `${rowsToSave.length} aulas inseridas com sucesso!${skipped > 0 ? ` (${skipped} que já existiam foram ignoradas)` : ''}` 
        })
        setTimeout(() => router.push('/admin/aulas'), 3000)
      } else {
        setStatus({ type: 'error', message: res.error || 'Erro ao salvar aulas.' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erro inesperado na comunicação.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckDuplicates = async () => {
    const urls = rows.map(r => r.video_url).filter(u => u.trim() !== '')
    if (urls.length === 0) return

    setCheckingDuplicates(true)
    const existing = await checkExistingAulas(urls)
    
    setRows(rows.map(r => ({
      ...r,
      isDuplicate: existing.includes(r.video_url)
    })))
    setCheckingDuplicates(false)
  }

  const handleInjectData = (data: any[]) => {
    const newRows = data.map((item, idx) => ({
      id: Date.now() + idx,
      titulo: item.titulo,
      video_url: item.video_url,
      duracao: item.duracao,
      isDuplicate: false
    }))
    setRows(newRows)
    setStatus({ type: 'success', message: `${data.length} aulas carregadas da playlist!` })
  }

  const handleFetchYoutube = async () => {
     if (!ytUrl) {
       setStatus({ type: 'error', message: 'Por favor, cole o link da playlist do YouTube.' });
       return;
     }

     setFetchingYT(true);
     setStatus(null);

     try {
       const res = await fetchYoutubePlaylist(ytUrl);
       if (res.success && res.videos) {
         handleInjectData(res.videos);
       } else {
         setStatus({ type: 'error', message: res.error || 'Erro ao buscar playlist.' });
       }
     } catch (err) {
       setStatus({ type: 'error', message: 'Erro na conexão com a API do YouTube.' });
     } finally {
       setFetchingYT(false);
     }
  }

  const countToSave = rows.filter(r => r.titulo.trim() !== '' && !r.isDuplicate).length
  const totalSeconds = rows.reduce((acc, row) => acc + parseDurationToSeconds(row.duracao), 0)
  const totalTimeFormatted = formatDuration(totalSeconds)

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            href="/admin/aulas" 
            className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar para o Acervo
          </Link>
          <h1 className="text-3xl font-black text-text-primary tracking-tighter flex items-center gap-3">
            <Table className="w-8 h-8 text-indigo-500" /> Inclusão em Lote
          </h1>
          <p className="text-text-secondary font-medium mt-1">
            Cadastre múltiplas aulas de uma só vez ou importe de uma playlist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={addRow}
            className="p-3 bg-background border border-border-custom rounded-2xl hover:border-primary text-text-primary hover:text-primary transition-all shadow-sm flex items-center gap-2 font-bold text-sm"
          >
            <Plus className="w-4 h-4" /> Nova Linha
          </button>
          <button 
            onClick={handleSave}
            disabled={loading || countToSave === 0}
            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar {countToSave} Novas Aulas
          </button>
        </div>
      </div>

      {/* YouTube Import Area */}
      <div className="bg-surface border border-border-custom rounded-[32px] p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
            <Video className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="font-black text-text-primary uppercase tracking-widest text-xs">Importar do YouTube (Automático)</h3>
            <p className="text-xs text-text-muted font-medium">Busca automática via API Key configurada</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <input 
            type="text" 
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            placeholder="Cole o link da playlist (ex: https://www.youtube.com/playlist?list=...)"
            className="w-full bg-background border border-border-custom rounded-2xl px-6 py-4 text-sm text-text-primary focus:outline-none focus:border-primary transition-all shadow-inner"
          />
          <button 
            onClick={handleFetchYoutube}
            disabled={fetchingYT}
            className="px-8 py-4 bg-rose-500 hover:bg-rose-600 border border-transparent rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all flex items-center gap-3 shadow-lg shadow-rose-500/20 disabled:opacity-50"
          >
            {fetchingYT ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Processar Playlist
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
           <HelpCircle className="w-3 h-3 text-indigo-500" />
           Dica: Cole o link e clique em Processar. O sistema buscará todos os vídeos da playlist automaticamente.
        </div>
      </div>

      {status && (
        <div className={`p-5 rounded-[24px] flex items-center gap-4 border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <p className="font-bold text-sm">{status.message}</p>
        </div>
      )}

      <div className="bg-surface border border-border-custom rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 bg-background/50 border-b border-border-custom flex items-center justify-between">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-3">
               <Copy className="w-4 h-4 text-primary" /> Planilha de Inclusão
            </h2>
            <button 
              onClick={handleCheckDuplicates}
              disabled={checkingDuplicates}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2 disabled:opacity-50"
            >
              {checkingDuplicates ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Verificar Duplicatas no Acervo
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/80 backdrop-blur-md border-b border-border-custom">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted w-16 text-center">#</th>
                <th className="p-6 text-[10px) font-black uppercase tracking-[0.2em] text-text-muted">Título da Aula *</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Link do Vídeo</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted w-44">Duração (hh:mm:ss)</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted w-20 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {rows.map((row, index) => (
                <tr key={row.id} className={`group transition-colors ${row.isDuplicate ? 'bg-amber-500/5' : 'hover:bg-black/5'}`}>
                  <td className="p-5 text-xs font-mono text-text-muted text-center italic">
                    {index + 1}
                  </td>
                  <td className="p-5">
                    <div className="relative">
                       <input 
                        type="text" 
                        value={row.titulo}
                        onChange={(e) => updateRow(index, 'titulo', e.target.value)}
                        placeholder="Ex: 01. Introdução ao Conceito"
                        className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/30 ${row.isDuplicate ? 'border-amber-500/50' : 'border-border-custom'}`}
                      />
                      {row.isDuplicate && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-md">
                           <AlertCircle className="w-3 h-3" /> Já existe!
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <input 
                      type="text" 
                      value={row.video_url}
                      onChange={(e) => updateRow(index, 'video_url', e.target.value)}
                      placeholder="YouTube ou Vimeo URL"
                      className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/30 font-mono ${row.isDuplicate ? 'border-amber-500/50' : 'border-border-custom'}`}
                    />
                  </td>
                  <td className="p-5">
                    <input 
                      type="text" 
                      value={row.duracao}
                      onChange={(e) => updateRow(index, 'duracao', e.target.value)}
                      placeholder="00:00:00"
                      className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/30 font-mono text-center"
                    />
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => removeRow(index)}
                      className="p-2.5 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Excluir linha"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-background/50 border-t border-border-custom flex items-center justify-between">
          <button 
             onClick={addRow}
             className="text-primary hover:text-primary-dark font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors py-2 px-4 rounded-xl hover:bg-primary/5"
          >
             <Plus className="w-4 h-4" /> Adicionar mais aulas
          </button>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total de Linhas</span>
               <span className="text-xl font-black text-text-primary leading-none">{rows.length}</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tempo Total</span>
               <span className="text-xl font-black text-indigo-500 leading-none">{totalTimeFormatted}</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Salvar (Ignorando Duplicadas)</span>
               <span className="text-xl font-black text-emerald-500 leading-none">{countToSave}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
