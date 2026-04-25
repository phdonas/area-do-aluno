'use client'

import React, { useRef, useState } from 'react'
import { 
  Users, Upload, Loader2, FileSpreadsheet, X, 
  Mail, CheckCircle, AlertCircle, Copy 
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { criarLoteConvites } from '@/app/(protected)/admin/convites/actions'

interface BulkInviteModalProps {
  cursos: { id: string; titulo: string }[]
}

export default function BulkInviteModal({ cursos }: BulkInviteModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailsText, setEmailsText] = useState('')
  const [cursoId, setCursoId] = useState('')
  const [result, setResult] = useState<{ success?: number; errors?: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractEmails = (text: string) => {
    // Regex para encontrar e-mails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    return Array.from(new Set(text.match(emailRegex) || []))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]
        
        // Pega a primeira coluna de cada linha que pareça um e-mail
        const foundEmails: string[] = []
        data.forEach(row => {
          if (row[0] && typeof row[0] === 'string' && row[0].includes('@')) {
            foundEmails.push(row[0].trim().toLowerCase())
          }
        })

        if (foundEmails.length > 0) {
          setEmailsText(prev => prev + (prev ? '\n' : '') + foundEmails.join('\n'))
        }
      } catch (err) {
        alert('Erro ao ler arquivo. Verifique se o formato está correto.')
      }
    }
    reader.readAsBinaryString(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleProcess = async () => {
    const emails = extractEmails(emailsText)
    if (emails.length === 0) {
      alert('Nenhum e-mail válido encontrado.')
      return
    }

    setLoading(true)
    const res = await criarLoteConvites({
      emails,
      curso_id: cursoId || undefined,
      origem: 'importacao_massa'
    })

    if (!res.success) {
      alert('Erro inesperado ao processar convites.')
    } else {
      setResult({
        success: res.successCount,
        errors: res.errors
      })
    }
    setLoading(false)
  }

  const reset = () => {
    setIsOpen(false)
    setEmailsText('')
    setCursoId('')
    setResult(null)
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" /> Convite em Massa
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-custom w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-border-custom flex items-center justify-between bg-black/10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h2 className="text-xl font-black text-text-primary tracking-tighter">Convite em Massa</h2>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Importar lista de alunos</p>
             </div>
          </div>
          <button onClick={reset} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <X className="w-6 h-6 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {!result ? (
            <>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">E-mails dos Alunos</label>
                <div className="relative group">
                  <textarea 
                    value={emailsText}
                    onChange={(e) => setEmailsText(e.target.value)}
                    placeholder="Cole os e-mails aqui (um por linha, separados por vírgula ou espaço)..."
                    className="w-full h-48 p-6 bg-background border-2 border-border-custom focus:border-primary rounded-3xl outline-none transition-all font-medium text-sm text-text-primary resize-none"
                  />
                  <div className="absolute right-4 bottom-4 flex gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-surface border border-border-custom rounded-xl hover:bg-white/5 transition-all text-text-muted hover:text-primary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Upload className="w-4 h-4" /> Arquivo (.csv, .xlsx)
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept=".csv, .xlsx, .xls"
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                   <AlertCircle className="w-3.5 h-3.5 text-primary" />
                   <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">
                     {extractEmails(emailsText).length} e-mails detectados
                   </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Vincular ao Curso (Opcional)</label>
                <select 
                  value={cursoId}
                  onChange={(e) => setCursoId(e.target.value)}
                  className="w-full h-14 px-6 bg-background border-2 border-border-custom focus:border-primary rounded-2xl outline-none appearance-none font-bold text-sm text-text-primary"
                >
                  <option value="">Acesso Global (Todos os Cursos)</option>
                  {cursos.map(c => (
                    <option key={c.id} value={c.id}>{c.titulo}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleProcess}
                disabled={loading || extractEmails(emailsText).length === 0}
                className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <><Mail className="w-5 h-5" /> Enviar Convites Agora</>
                )}
              </button>
            </>
          ) : (
            <div className="py-8 text-center space-y-6">
               <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-text-primary tracking-tighter">Processamento Concluído!</h3>
                  <p className="text-sm font-medium text-text-muted">
                    {result.success} convites foram enviados com sucesso.
                  </p>
               </div>

               {result.errors && result.errors.length > 0 && (
                 <div className="max-h-40 overflow-y-auto p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-left">
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Erros de Processamento:</p>
                    <ul className="space-y-1">
                      {result.errors.map((err, i) => (
                        <li key={i} className="text-[10px] text-red-400 font-medium">• {err}</li>
                      ))}
                    </ul>
                 </div>
               )}

               <button 
                 onClick={reset}
                 className="px-8 py-4 bg-surface border border-border-custom text-text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/5 transition-all"
               >
                 Fechar e Voltar
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
