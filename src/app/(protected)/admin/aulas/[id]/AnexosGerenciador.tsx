'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Paperclip, UploadCloud, Link as LinkIcon, File } from 'lucide-react'

type Anexo = {
  id: string
  titulo: string
  arquivo_url: string
  tipo: string
}

export function AnexosGerenciador({ aulaId }: { aulaId: string }) {
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [novoLink, setNovoLink] = useState({ titulo: '', url: '' })
  
  const supabase = createClient()

  useEffect(() => {
    fetchAnexos()
  }, [])

  const fetchAnexos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('materiais_anexos')
      .select('*')
      .eq('aula_id', aulaId)
      .order('titulo', { ascending: true })
    if (data) setAnexos(data)
    setLoading(false)
  }

  const handleAddLink = async () => {
    if (!novoLink.titulo || !novoLink.url) return alert('Preencha título e URL.')
    const { data, error } = await supabase.from('materiais_anexos').insert({
      aula_id: aulaId,
      titulo: novoLink.titulo,
      arquivo_url: novoLink.url,
      tipo: 'link'
    }).select().single()

    if (error) {
      alert(`Erro ao adicionar link: ${error.message}`)
    } else if (data) {
      setAnexos([...anexos, data])
      setNovoLink({ titulo: '', url: '' })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${aulaId}/${Math.random()}.${fileExt}`

    // Faz o Upload pro Supabase Storage no bucket "aulas-arquivos"
    const { error: uploadError } = await supabase.storage
      .from('aulas-arquivos')
      .upload(fileName, file)

    if (uploadError) {
      alert('Erro ao subir arquivo. Verifique se o Bucket "aulas-arquivos" foi criado como Público.')
      setIsUploading(false)
      return
    }

    // Pega a URL Publica
    const { data: { publicUrl } } = supabase.storage
      .from('aulas-arquivos')
      .getPublicUrl(fileName)

    // Salva no banco
    const { data, error: dbError } = await supabase.from('materiais_anexos').insert({
      aula_id: aulaId,
      titulo: file.name,
      arquivo_url: publicUrl,
      tipo: 'arquivo'
    }).select().single()

    if (dbError) {
      alert(`Erro ao salvar no banco: ${dbError.message}`)
    } else if (data) {
      setAnexos([...anexos, data])
    }
    
    setIsUploading(false)
  }

  const deleteAnexo = async (id: string, url: string, tipo: string) => {
    if (!confirm('Deseja excluir este anexo?')) return

    await supabase.from('materiais_anexos').delete().eq('id', id)
    
    // Se era um arquivo hospedado, apaga do bucket também
    if (tipo === 'arquivo' && url.includes('aulas-arquivos')) {
       try {
         const urlPath = url.split('/aulas-arquivos/')[1]
         if (urlPath) {
            await supabase.storage.from('aulas-arquivos').remove([urlPath])
         }
       } catch (err) {
         console.error('Falha ao apagar arquivo fiso do bucket', err)
       }
    }
    
    setAnexos(anexos.filter(a => a.id !== id))
  }

  return (
    <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm mt-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
             <Paperclip className="w-5 h-5" /> Materiais e Anexos
           </h2>
           <p className="text-sm text-text-secondary mt-1">Links externos ou arquivos PDF/DOCX para os alunos baixarem.</p>
        </div>
      </div>

      {/* Forms de Adição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background border border-border-custom p-4 rounded-xl mb-6">
         
         {/* Adicionar Link */}
         <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-emerald-500"/> Adicionar Link Externo
            </h3>
            <div className="flex flex-col gap-2">
              <input 
                type="text" placeholder="Ex: Planilha do Drive" 
                value={novoLink.titulo} onChange={e => setNovoLink({...novoLink, titulo: e.target.value})}
                className="w-full bg-surface border border-border-custom px-3 py-2 rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              />
              <input 
                type="url" placeholder="https://..." 
                value={novoLink.url} onChange={e => setNovoLink({...novoLink, url: e.target.value})}
                className="w-full bg-surface border border-border-custom px-3 py-2 rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              />
              <button 
                type="button" onClick={handleAddLink}
                className="bg-background border border-border-custom hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 font-bold px-4 py-2 rounded-lg text-sm transition-colors text-center mt-1"
              >
                Salvar Link
              </button>
            </div>
         </div>

         {/* Upload de Arquivo */}
         <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-primary"/> Fazer Upload (Hospedagem)
            </h3>
            <div className="h-full min-h-[100px] bg-surface border-2 border-dashed border-border-custom rounded-lg flex flex-col items-center justify-center relative hover:bg-primary/5 transition-colors group cursor-pointer overflow-hidden p-4">
              {isUploading ? (
                 <div className="text-sm font-bold text-primary animate-pulse">Enviando Arquivo...</div>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors mb-2" />
                  <div className="text-xs text-text-secondary text-center">
                    Clique ou arraste <br/>(Max 50MB por arquivo)
                  </div>
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
         </div>

      </div>

      {/* Lista de Anexos */}
      {loading ? (
        <div className="text-sm text-text-muted text-center py-4">Carregando anexos...</div>
      ) : anexos.length === 0 ? (
        <div className="text-sm text-text-muted text-center py-4 border border-dashed border-border-custom rounded-lg">
          Nenhum material adicionado a esta aula ainda.
        </div>
      ) : (
        <ul className="space-y-2">
          {anexos.map(anexo => (
            <li key={anexo.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-background border border-border-custom p-3 rounded-xl gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0">
                   {anexo.tipo === 'link' ? <LinkIcon className="w-5 h-5 text-text-muted" /> : <File className="w-5 h-5 text-primary" />}
                 </div>
                 <div className="min-w-0">
                   <div className="font-bold text-sm text-text-primary truncate">{anexo.titulo}</div>
                   <a href={anexo.arquivo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate inline-block max-w-full">
                     {anexo.arquivo_url}
                   </a>
                 </div>
              </div>
              <button 
                onClick={() => deleteAnexo(anexo.id, anexo.arquivo_url, anexo.tipo || '')}
                className="p-2 text-text-muted hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20 hover:bg-red-500/10 rounded-lg self-start sm:self-auto"
                title="Apagar anexo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
