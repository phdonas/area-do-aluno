'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Image as ImageIcon, Upload, X, Trash2, Check, Loader2, AlertTriangle, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MediaGalleryProps {
  value?: string
  onChange?: (url: string) => void
  name?: string
}

interface MediaFile {
  name: string
  url: string
  created_at: string
}

export function MediaGallery({ value = '', onChange, name = 'thumb_url' }: MediaGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery')
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch files from bucket
  const loadFiles = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.storage.from('media-library').list()
      if (error) throw error

      if (data) {
        // Sort by created_at desc and filter out empty hidden files (.emptyFolderPlaceholder)
        const validFiles = data
          .filter((f: any) => f.name !== '.emptyFolderPlaceholder')
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        const filesWithUrl = validFiles.map((f: any) => {
          const { data: { publicUrl } } = supabase.storage.from('media-library').getPublicUrl(f.name)
          return {
            name: f.name,
            url: publicUrl,
            created_at: f.created_at
          }
        })
        setFiles(filesWithUrl)
      }
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar a galeria de imagens.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && activeTab === 'gallery') {
      loadFiles()
    }
  }, [isOpen, activeTab])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit check: 1MB = 1048576 bytes
    if (file.size > 1048576) {
      const proceed = window.confirm(
        'Atenção! Esta imagem tem mais de 1MB e pode deixar o site mais lento. Recomendamos usar o Squoosh para comprimi-la antes.\n\nDeseja fazer o upload mesmo assim?'
      )
      if (!proceed) {
        e.target.value = ''
        return
      }
    }

    setUploading(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('media-library')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('media-library').getPublicUrl(fileName)
      
      // Select the newly uploaded file and close
      handleSelect(publicUrl)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao fazer upload da imagem.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const proceed = window.confirm('Tem certeza que deseja excluir esta imagem permanentemente da galeria?')
    if (!proceed) return

    try {
      const { error } = await supabase.storage.from('media-library').remove([fileName])
      if (error) throw error
      loadFiles()
      
      // se for a imagem atual, remove a seleção
      const { data: { publicUrl } } = supabase.storage.from('media-library').getPublicUrl(fileName)
      if (value === publicUrl) {
        onChange?.('')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir a imagem.')
    }
  }

  const handleSelect = (url: string) => {
    onChange?.(url)
    setIsOpen(false)
  }

  const removeCurrentSelection = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange?.('')
  }

  return (
    <div className="w-full">
      {/* Hidden input for forms */}
      <input type="hidden" name={name} value={value} />

      {/* Trigger Area */}
      <div 
        onClick={() => setIsOpen(true)}
        className="relative w-full aspect-video bg-background border-2 border-dashed border-border-custom rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden"
      >
        {value ? (
          <>
            <img src={value} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg">Alterar Imagem</span>
            </div>
            <button 
              onClick={removeCurrentSelection}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Remover Imagem"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <ImageIcon className="w-10 h-10 text-text-muted mb-2 group-hover:text-primary transition-colors" />
            <span className="text-sm font-bold text-text-secondary group-hover:text-primary transition-colors">
              Clique para selecionar uma capa
            </span>
            <span className="text-xs text-text-muted mt-1">(Biblioteca de Imagens)</span>
          </>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border-custom w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-custom bg-background">
              <h2 className="text-lg font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" /> Galeria de Mídia
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-surface hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 pt-4 gap-4 bg-background border-b border-border-custom">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`pb-4 px-2 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                Biblioteca do Supabase
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`pb-4 px-2 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <Upload className="w-4 h-4" /> Fazer Upload
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-surface min-h-[400px] relative">
              
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              {activeTab === 'gallery' && (
                <>
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-sm font-medium">Carregando imagens...</p>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                      <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm font-medium mb-4">Nenhuma imagem encontrada na biblioteca.</p>
                      <button 
                        onClick={() => setActiveTab('upload')}
                        className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
                      >
                        Fazer Primeiro Upload
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {files.map((file) => (
                        <div 
                          key={file.name} 
                          onClick={() => handleSelect(file.url)}
                          className={`group relative aspect-video rounded-xl border-2 overflow-hidden cursor-pointer bg-background transition-all hover:border-primary/50 ${
                            value === file.url ? 'border-primary shadow-lg shadow-primary/20' : 'border-border-custom'
                          }`}
                        >
                          <img 
                            src={file.url} 
                            alt={file.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          {value === file.url && (
                            <div className="absolute top-2 left-2 bg-primary text-white p-1 rounded-md">
                              <Check className="w-4 h-4" />
                            </div>
                          )}

                          <button 
                            onClick={(e) => handleDelete(file.name, e)}
                            className="absolute bottom-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Excluir imagem permanentemente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="absolute bottom-2 left-2 right-12 truncate text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'upload' && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border-custom rounded-2xl bg-background p-10 text-center relative overflow-hidden">
                  
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 relative">
                         <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-2xl animate-spin" />
                         <ImageIcon className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <h3 className="text-lg font-black text-text-primary uppercase tracking-widest mb-2">Enviando para o Supabase...</h3>
                      <p className="text-sm text-text-secondary">Isso pode levar alguns segundos dependendo do tamanho da imagem.</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                         <Upload className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-black text-text-primary uppercase tracking-widest mb-2">Fazer Upload de Imagem</h3>
                      <p className="text-sm text-text-secondary max-w-md mb-8">
                        Selecione uma imagem do seu computador. Ela será salva na sua galeria do Supabase e ficará disponível para uso futuro.
                      </p>
                      
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-8 flex items-start gap-3 text-left max-w-md">
                        <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-orange-500 uppercase">Lembrete de Performance</p>
                          <p className="text-xs text-text-secondary mt-1">
                            Você será alertado se tentar enviar uma imagem maior que 1MB. Recomendamos usar o <a href="https://squoosh.app" target="_blank" rel="noreferrer" className="text-primary hover:underline">Squoosh</a> para comprimir antes.
                          </p>
                        </div>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/jpeg, image/png, image/webp" 
                        className="hidden" 
                      />
                      <button 
                        onClick={handleUploadClick}
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" /> Selecionar Arquivo
                      </button>
                    </>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
