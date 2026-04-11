'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Award, 
  Plus, 
  Trash2, 
  Type, 
  Image as ImageIcon, 
  Save, 
  Move, 
  Type as FontIcon,
  ChevronLeft,
  Settings2,
  Maximize2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Element {
  id: string
  type: 'text' | 'image'
  content: string
  x: number // Porcentagem (0-100)
  y: number // Porcentagem (0-100)
  fontSize: number
  color: string
  fontWeight: string
  textAlign: 'left' | 'center' | 'right'
}

interface CertificateDesignerProps {
  initialData?: any
  cursos: { id: string, titulo: string }[]
  saveAction: (data: any) => Promise<void>
}

export function CertificateDesigner({ initialData, cursos, saveAction }: CertificateDesignerProps) {
  const router = useRouter()
  const [elements, setElements] = useState<Element[]>(initialData?.elements || [])
  const [backgroundUrl, setBackgroundUrl] = useState(initialData?.template_url || '')
  const [cursoId, setCursoId] = useState(initialData?.curso_id || '')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const addText = () => {
    const newElement: Element = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: 'Novo Texto',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#000000',
      fontWeight: 'bold',
      textAlign: 'center'
    }
    setElements([...elements, newElement])
    setSelectedId(newElement.id)
  }

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const handleSave = async () => {
    if (!cursoId) {
      alert('Selecione um curso para este certificado.')
      return
    }
    setIsSaving(true)
    try {
      await saveAction({
          id: initialData?.id,
          curso_id: cursoId,
          template_url: backgroundUrl,
          elements
      })
      router.push('/admin/certificados/config')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar certificado.')
    } finally {
      setIsSaving(false)
    }
  }

  // --- LÓGICA DE DRAG AND DROP ---
  const [isDragging, setIsDragging] = useState(false)
  const dragTarget = useRef<string | null>(null)

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedId(id)
    setIsDragging(true)
    dragTarget.current = id
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragTarget.current || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Limitar entre 0 e 100
      const boundedX = Math.max(0, Math.min(100, x))
      const boundedY = Math.max(0, Math.min(100, y))

      setElements(prev => prev.map(el => 
        el.id === dragTarget.current ? { ...el, x: boundedX, y: boundedY } : el
      ))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragTarget.current = null
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])
  // -------------------------------

  const selectedElement = elements.find(el => el.id === selectedId)

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)] gap-6 animate-in fade-in zoom-in-95 duration-700">
      
      {/* Sidebar de Ferramentas */}
      <aside className="w-full lg:w-96 bg-surface border border-border-custom rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-border-custom bg-black/[0.02]">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                 <Settings2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-sm font-black text-text-primary uppercase tracking-widest italic">Configurações</h2>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted px-2">Curso Vinculado</label>
                <select 
                  value={cursoId} 
                  onChange={(e) => setCursoId(e.target.value)}
                  className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:border-indigo-500 transition-all appearance-none"
                >
                  <option value="">Selecione o Curso</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted px-2">URL do Fundo (JPG/PNG)</label>
                <div className="relative">
                  <input 
                    type="url" 
                    value={backgroundUrl} 
                    onChange={(e) => setBackgroundUrl(e.target.value)}
                    placeholder="https://sua-imagem.com/fundo.jpg"
                    className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-xs font-medium text-text-primary focus:border-indigo-500 transition-all pr-10"
                  />
                  <ImageIcon className="absolute right-3 top-3 w-4 h-4 text-text-muted" />
                </div>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
           {selectedElement ? (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Editando Elemento</h3>
                   <button onClick={() => setSelectedId(null)} className="text-[9px] font-black uppercase text-text-muted hover:text-text-primary">Limpar</button>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-text-muted">Conteúdo do Texto</label>
                      <textarea 
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-xs font-bold focus:border-indigo-500 transition-all resize-none"
                        rows={3}
                      />
                      <p className="text-[8px] text-text-muted font-medium">Use tags: <code className="bg-black/5 px-1 rounded">{"{nome}"}</code>, <code className="bg-black/5 px-1 rounded">{"{data}"}</code>, <code className="bg-black/5 px-1 rounded">{"{curso}"}</code></p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-text-muted">Tamanho</label>
                         <input 
                           type="number" 
                           value={selectedElement.fontSize}
                           onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                           className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-xs font-bold"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-text-muted">Cor</label>
                         <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={selectedElement.color}
                              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                              className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                            />
                            <input 
                              type="text" 
                              value={selectedElement.color}
                              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                              className="flex-1 bg-background border border-border-custom rounded-xl px-2 text-[10px] font-mono"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-text-muted">Posicionamento (X / Y %)</label>
                      <div className="grid grid-cols-2 gap-2">
                         <div className="flex items-center gap-2 bg-background border border-border-custom rounded-xl px-3 py-2">
                            <span className="text-[9px] font-bold text-text-muted">X</span>
                            <input type="number" value={Math.round(selectedElement.x)} onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) })} className="w-full bg-transparent border-none p-0 text-xs font-bold focus:ring-0" />
                         </div>
                         <div className="flex items-center gap-2 bg-background border border-border-custom rounded-xl px-3 py-2">
                            <span className="text-[9px] font-bold text-text-muted">Y</span>
                            <input type="number" value={Math.round(selectedElement.y)} onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) })} className="w-full bg-transparent border-none p-0 text-xs font-bold focus:ring-0" />
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={() => removeElement(selectedId!)}
                     className="w-full py-3 bg-red-500/10 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                     <Trash2 className="w-4 h-4" /> Deletar Camada
                   </button>
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase text-text-muted tracking-widest">Camadas do Projeto</h3>
                   <span className="text-[9px] font-black text-text-muted">{elements.length} Elementos</span>
                </div>
                
                <div className="space-y-3">
                   {elements.map(el => (
                     <button 
                       key={el.id}
                       onClick={() => setSelectedId(el.id)}
                       className={`w-full p-4 flex items-center gap-4 rounded-2xl border transition-all text-left ${selectedId === el.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-background border-border-custom text-text-primary hover:border-indigo-500/50'}`}
                     >
                        <div className={`p-2 rounded-lg ${selectedId === el.id ? 'bg-white/20' : 'bg-indigo-600/10 text-indigo-600'}`}>
                           <Type className="w-4 h-4" />
                        </div>
                        <div className="flex-1 truncate">
                           <p className="text-[10px] font-black uppercase tracking-tighter truncate opacity-90">{el.content || 'Sem Texto'}</p>
                           <p className={`text-[8px] font-bold ${selectedId === el.id ? 'text-white/60' : 'text-text-muted'}`}>Pos: {Math.round(el.x)}%, {Math.round(el.y)}%</p>
                        </div>
                     </button>
                   ))}
                   <button 
                     onClick={addText}
                     className="w-full p-4 flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-custom text-text-muted hover:border-primary hover:text-primary transition-all group"
                   >
                      <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Nova Camada de Texto</span>
                   </button>
                </div>
             </div>
           )}
        </div>

        <div className="p-8 bg-background border-t border-border-custom">
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {isSaving ? 'Salvando...' : <><Save className="w-5 h-5" /> Publicar Template</>}
           </button>
        </div>
      </aside>

      {/* Área do Canvas (Preview Live) */}
      <main className="flex-1 bg-surface border border-border-custom rounded-[2.5rem] relative overflow-hidden flex items-center justify-center group shadow-inner">
         <div className="absolute top-8 left-8 flex items-center gap-4">
            <div className="px-4 py-2 bg-background/80 apple-blur border border-border-custom rounded-full text-[9px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
               <Maximize2 className="w-3 h-3" /> Visualização A4
            </div>
         </div>

         <div className="w-[90%] aspect-[1.41] bg-white shadow-[0_32px_128px_-32px_rgba(0,0,0,0.3)] rounded-sm relative overflow-hidden" ref={canvasRef}>
           {backgroundUrl ? (
             <img src={backgroundUrl} className="absolute inset-0 w-full h-full object-cover select-none" draggable={false} />
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center border-4 border-dashed border-indigo-600/10 m-12 rounded-[2rem]">
                <ImageIcon className="w-16 h-16 text-indigo-600/10 mb-4" />
                <p className="text-xs font-black text-indigo-600/20 uppercase tracking-widest">Insira a URL do template para começar</p>
             </div>
           )}

           {/* Renderização Dinâmica dos Elementos */}
            {elements.map((el) => (
              <div 
                key={el.id}
                onMouseDown={(e) => handleMouseDown(el.id, e)}
                style={{
                  position: 'absolute',
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${el.fontSize}px`,
                  color: el.color,
                 fontWeight: el.fontWeight,
                 textAlign: el.textAlign,
                 cursor: 'move',
                 userSelect: 'none',
                 whiteSpace: 'pre-wrap',
                 width: 'max-content',
                 lineHeight: 1.2,
                 padding: '4px',
                 borderRadius: '4px',
                 border: selectedId === el.id ? '2px dashed #4f46e5' : 'none',
                 zIndex: selectedId === el.id ? 50 : 10
               }}
               className="group/el"
             >
                {el.content}
                {selectedId === el.id && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-xl whitespace-nowrap">
                    Arraste para ajustar (X: {Math.round(el.x)}% Y: {Math.round(el.y)}%)
                  </div>
                )}
             </div>
           ))}
         </div>

         {/* Overlay de ajuda quando não há nada selecionado */}
         {!selectedId && elements.length > 0 && (
           <div className="absolute bottom-8 text-[9px] font-black uppercase text-text-muted tracking-[0.2em] italic bg-background/50 px-6 py-3 rounded-full border border-border-custom opacity-0 group-hover:opacity-100 transition-opacity">
             Clique em um elemento no canvas para editar propriedades
           </div>
         )}
      </main>
    </div>
  )
}
