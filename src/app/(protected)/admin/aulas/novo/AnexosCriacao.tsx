'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Link as LinkIcon, UploadCloud, File as FileIcon } from 'lucide-react'

export function AnexosCriacao() {
  const [links, setLinks] = useState<{ titulo: string, url: string }[]>([])
  const [arquivos, setArquivos] = useState<File[]>([])
  const [novoLink, setNovoLink] = useState({ titulo: '', url: '' })

  const handleAddLink = () => {
    if (!novoLink.titulo || !novoLink.url) return alert('Preencha título e URL.')
    setLinks([...links, { ...novoLink }])
    setNovoLink({ titulo: '', url: '' })
  }

  const inputRef = React.useRef<HTMLInputElement>(null)

  const syncFilesToInput = (newFiles: File[]) => {
    if (inputRef.current) {
      const dt = new DataTransfer()
      newFiles.forEach(f => dt.items.add(f))
      inputRef.current.files = dt.files
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files
    if (!filesList) return
    const newFiles = [...arquivos, ...Array.from(filesList)]
    setArquivos(newFiles)
    syncFilesToInput(newFiles)
    
    // Clear visible input
    e.target.value = ''
  }

  const removeArquivo = (index: number) => {
    const list = [...arquivos]
    list.splice(index, 1)
    setArquivos(list)
    syncFilesToInput(list)
  }

  const removeLink = (index: number) => {
    const list = [...links]
    list.splice(index, 1)
    setLinks(list)
  }



  return (
    <div className="bg-background border border-border-custom p-6 rounded-xl mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-text-primary">Materiais Complementares</h3>
        <p className="text-sm text-text-secondary mt-1">Adicione arquivos e links que serão salvos junto com a aula.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Links */}
        <div className="space-y-3 bg-surface p-4 rounded-xl border border-border-custom">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-emerald-500" /> Inserir URL Externa
          </h4>
          <input 
            type="text" placeholder="Título (Ex: Planilha do Drive)" 
            value={novoLink.titulo} onChange={e => setNovoLink({...novoLink, titulo: e.target.value})}
            className="w-full bg-background border border-border-custom px-3 py-2 rounded-lg text-sm focus:border-primary"
          />
          <input 
            type="url" placeholder="https://..." 
            value={novoLink.url} onChange={e => setNovoLink({...novoLink, url: e.target.value})}
            className="w-full bg-background border border-border-custom px-3 py-2 rounded-lg text-sm focus:border-primary"
          />
          <button 
            type="button" onClick={handleAddLink}
            className="w-full bg-emerald-500/10 text-emerald-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-emerald-500/20 transition-colors"
          >
            Adicionar Link
          </button>

          {links.map((link, index) => (
            <div key={index} className="flex items-center justify-between mt-2 p-2 bg-background border border-border-custom rounded-lg">
              <div className="text-xs truncate max-w-[150px]"><span className="font-bold">{link.titulo}</span> - {link.url}</div>
              <button type="button" onClick={() => removeLink(index)} className="text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
              <input type="hidden" name="link_json" value={JSON.stringify(link)} />
            </div>
          ))}
        </div>

        {/* Uploads */}
        <div className="space-y-3 bg-surface p-4 rounded-xl border border-border-custom">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-primary" /> Anexar Arquivos
          </h4>
          <div className="min-h-[100px] border-2 border-dashed border-border-custom rounded-lg flex flex-col items-center justify-center p-4 relative hover:bg-primary/5 transition-colors cursor-pointer">
            <UploadCloud className="w-6 h-6 text-text-muted mb-2" />
            <div className="text-xs text-text-secondary text-center">Clique ou arraste<br/>para selecionar anexos</div>
            <input 
              type="file" multiple
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title="Adicionar Arquivos"
            />
          </div>
          
          {/* Hidden input to hold the actual files for the form submission */}
          <input type="file" multiple name="arquivos" ref={inputRef} style={{ display: 'none' }} />

          {arquivos.map((arq, index) => (
            <div key={index} className="flex items-center justify-between mt-2 p-2 bg-background border border-border-custom rounded-lg">
              <div className="text-xs truncate max-w-[150px] flex items-center gap-1">
                <FileIcon className="w-3 h-3" />
                {arq.name} ({(arq.size / 1024).toFixed(0)}KB)
              </div>
              <button type="button" onClick={() => removeArquivo(index)} className="text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          {/* Note that standard file inputs don't let you set FileList natively when removing one item, 
              but since we hold them in state, we actually CANNOT inject File objects back into a hidden input easily 
              for a `<form action={...}>`. A workaround in Next.js Server actions is mapping them or using a custom DataTransfer. */}
        </div>
      </div>
    </div>
  )
}
