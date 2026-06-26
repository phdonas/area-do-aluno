'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, Loader2, FolderArchive, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PastaUploaderProps {
  onUploadComplete: (url: string) => void
}

export function PastaUploader({ onUploadComplete }: PastaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setStatus('uploading')
    setProgress(0)
    setErrorMessage('')

    const supabase = createClient()
    const bucketName = 'aulas-arquivos'
    const folderId = `ferramentas-html/${Date.now()}` // Unique folder for this upload
    let indexHtmlUrl = ''
    let uploadedCount = 0

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // webkitRelativePath contains the full path like "my-folder/css/style.css"
        const relativePath = file.webkitRelativePath
        
        // Remove the top-level folder name to keep it clean (e.g., "my-folder/css/style.css" -> "css/style.css")
        const pathParts = relativePath.split('/')
        pathParts.shift() // remove the root folder name
        const cleanPath = pathParts.join('/')
        
        // Se for arquivo na raiz (sem pasta) ignoramos o shift se o pathParts ficar vazio
        const finalPath = cleanPath === '' ? relativePath : cleanPath

        const storagePath = `${folderId}/${finalPath}`

        const { error } = await supabase.storage
          .from(bucketName)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (error) {
          console.error(`Erro no arquivo ${finalPath}:`, error)
          throw new Error(`Falha ao subir ${finalPath}`)
        }

        // Se for o index.html principal, capturamos a URL
        if (finalPath.toLowerCase() === 'index.html') {
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(storagePath)
          indexHtmlUrl = publicUrl
        }

        uploadedCount++
        setProgress(Math.round((uploadedCount / files.length) * 100))
      }

      if (!indexHtmlUrl) {
        throw new Error("Não encontrei nenhum arquivo 'index.html' na pasta selecionada.")
      }

      setStatus('success')
      onUploadComplete(indexHtmlUrl)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setErrorMessage(err.message || 'Erro durante o upload.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="w-full bg-indigo-500/5 border-2 border-dashed border-indigo-500/30 rounded-2xl p-6 transition-all hover:bg-indigo-500/10 mb-6">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        
        {status === 'idle' && (
          <>
            <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-500">
              <FolderArchive className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Fazer Upload de Pasta (Simuladores HTML)</h4>
              <p className="text-[10px] text-text-muted font-bold mt-1 max-w-sm mx-auto uppercase">
                Selecione a pasta completa do seu simulador no PC. O sistema extrairá o <code className="bg-background px-1 rounded text-primary">index.html</code> automaticamente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              Escolher Pasta
            </button>
          </>
        )}

        {status === 'uploading' && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <h4 className="text-xs font-black uppercase tracking-widest text-text-primary mb-2">Enviando arquivos...</h4>
            <div className="w-full bg-background rounded-full h-2.5 overflow-hidden border border-border-custom">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[10px] text-text-muted mt-2 font-bold uppercase">{progress}% concluído</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">Upload Concluído!</h4>
            <p className="text-[10px] text-text-muted font-bold mt-1 uppercase">A URL do arquivo foi preenchida automaticamente abaixo.</p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-4 text-[10px] font-black uppercase text-indigo-500 hover:underline"
            >
              Enviar outra pasta
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-rose-500">Falha no Upload</h4>
            <p className="text-[10px] text-text-muted font-bold mt-1 uppercase max-w-sm">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-4 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          // @ts-ignore - webkitdirectory is non-standard but works in all modern browsers
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderSelect}
        />
      </div>
    </div>
  )
}
