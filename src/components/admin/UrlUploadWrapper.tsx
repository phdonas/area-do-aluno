'use client'

import React, { useState } from 'react'
import { PastaUploader } from './PastaUploader'

export function UrlUploadWrapper({ defaultValue = '' }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue)

  const handleUploadComplete = (newUrl: string) => {
    setUrl(newUrl)
  }

  return (
    <div className="space-y-4">
      {/* Componente de Upload de Pasta para Simuladores */}
      <PastaUploader onUploadComplete={handleUploadComplete} />

      {/* Input de URL original / modificado */}
      <div className="space-y-2">
        <label htmlFor="arquivo_url" className="block text-xs font-black uppercase tracking-widest text-text-primary">
          URL / Endereço do Arquivo
        </label>
        <input 
          type="text" 
          id="arquivo_url" 
          name="arquivo_url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="A URL será preenchida automaticamente após o upload, ou cole um link externo (Typeform, Sheets)"
          className="w-full bg-background border border-border-custom rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-mono text-xs mb-2"
        />
        
        {/* Mantendo o uploader de arquivo único para retrocompatibilidade (PDF, XLSX) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-background/50 border border-dashed border-border-custom p-4 rounded-xl mt-2">
          <span className="text-[10px] font-bold uppercase text-text-muted whitespace-nowrap">OU FAÇA O UPLOAD SIMPLES (PDF, XLSX):</span>
          <input 
            type="file" id="arquivo_upload" name="arquivo_upload"
            className="w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />
        </div>
        <p className="text-[10px] text-text-muted font-bold uppercase">
          O upload de pasta (acima) preenche o campo de texto. O upload simples (abaixo) envia o arquivo ao salvar.
        </p>
      </div>
    </div>
  )
}
