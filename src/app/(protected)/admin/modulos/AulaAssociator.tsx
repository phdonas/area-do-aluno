'use client'

import { useState, useRef } from 'react'
import { associarMultiplasAulasModulo, desassociarAulaModulo, desassociarAulaDireta, reordenarAulaModuloPivot } from './actions'
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Video, GripVertical, Search, X, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'

type Aula = {
  id: string
  titulo: string
  modulo_id: string | null
}

type ModuloAula = {
  aula_id: string
  ordem: number
  isDirect: boolean
  aula: Aula
}

export function AulaAssociator({
  moduloId,
  todasAulasGlobais,
  aulasDoModulo,
}: {
  moduloId: string
  todasAulasGlobais: Aula[]
  aulasDoModulo: ModuloAula[]
}) {
  const [loading, setLoading] = useState(false);
  const [newOrdem, setNewOrdem] = useState(aulasDoModulo.length + 1);
  const [filterText, setFilterText] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFilter, setModalFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Refs for Drag & Drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const aulasDisponiveis = todasAulasGlobais.filter(
    a => !aulasDoModulo.some(am => am.aula_id === a.id)
  );

  const aulasDoModuloFiltradas = aulasDoModulo.filter(
    am => am.aula.titulo.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleOpenModal = () => {
    setSelectedIds([]);
    setModalFilter('');
    setIsModalOpen(true);
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  const handleAddMultiple = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await associarMultiplasAulasModulo(moduloId, selectedIds, newOrdem);
      setIsModalOpen(false);
      setNewOrdem(aulasDoModulo.length + selectedIds.length + 1);
    } catch (err) {
      console.error(err);
      alert('Erro ao agregar aulas.');
    } finally {
      setLoading(false);
    }
  }

  const handleRemove = async (aulaId: string, isDirect: boolean) => {
    if (!confirm('Tirar aula deste módulo? (A aula não será apagada do sistema, vai pro Acervo Solto)')) return;
    setLoading(true);
    try {
      if (isDirect) {
        await desassociarAulaDireta(moduloId, aulaId);
      } else {
        await desassociarAulaModulo(moduloId, aulaId);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao remover aula.');
    } finally {
      setLoading(false);
    }
  }

  const handleReorder = async (aulaId: string, currentOrdem: number, direction: 'up' | 'down') => {
    const newO = direction === 'up' ? currentOrdem - 1 : currentOrdem + 1;
    setLoading(true);
    try {
      await reordenarAulaModuloPivot(moduloId, aulaId, newO);
    } catch (err) {
      console.error(err);
      alert('Erro ao reordenar aula.');
    } finally {
      setLoading(false);
    }
  }

  const handleDragSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    
    const itemBeingDragged = aulasDoModulo[dragItem.current];
    const targetItem = aulasDoModulo[dragOverItem.current];
    
    setLoading(true);
    try {
      await reordenarAulaModuloPivot(moduloId, itemBeingDragged.aula_id, targetItem.ordem);
    } catch(err) {
      console.error(err);
    } finally {
      dragItem.current = null;
      dragOverItem.current = null;
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm mb-8 relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Aulas do Módulo</h2>
          <p className="text-sm text-text-secondary mt-1">
            Reaproveite aulas da biblioteca ou crie novas exclusivas.
          </p>
        </div>
        <Link 
          href={`/admin/aulas/novo?modulo_id=${moduloId}`}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors w-fit"
        >
          <Plus className="w-4 h-4" /> Criar Nova Aula
        </Link>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-background border border-border-custom rounded-xl items-center">
          <div className="flex-1 text-sm text-text-primary">
            Puxe múltiplas aulas da biblioteca rapidamente.
          </div>
          <button 
            type="button" 
            onClick={handleOpenModal}
            disabled={loading}
            className="w-full sm:w-auto bg-background border border-border-custom hover:border-primary text-text-primary hover:text-primary px-6 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Video className="w-4 h-4" /> Importar do Acervo
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center bg-background border border-border-custom px-4 py-2 rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
        <Search className="w-4 h-4 text-text-muted mr-3" />
        <input 
          type="text" 
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filtrar aulas neste módulo..."
          className="bg-transparent border-none outline-none text-sm text-text-primary w-full"
        />
      </div>

      {aulasDoModulo.length === 0 ? (
        <div className="p-8 bg-background border border-border-custom rounded-xl text-center text-sm text-text-muted border-dashed flex flex-col items-center justify-center">
          <Video className="w-8 h-8 text-border-custom mb-3" />
          <p>Este módulo ainda não possui aulas.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {aulasDoModuloFiltradas.map((am, index) => {
            return (
              <li 
                key={am.aula_id} 
                className="bg-background border border-border-custom rounded-xl overflow-hidden shadow-sm"
                draggable
                onDragStart={() => dragItem.current = index}
                onDragEnter={() => dragOverItem.current = index}
                onDragEnd={handleDragSort}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 bg-background z-10 relative">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-text-muted cursor-grab active:cursor-grabbing hover:text-primary transition-colors pr-2" title="Arrastar para reordenar">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="font-mono text-xs bg-black/10 text-text-muted px-2 py-1 rounded">Ord: {am.ordem}</div>
                    <div className="flex flex-col">
                      <div className="font-bold text-text-primary text-sm flex items-center gap-2">
                        {am.aula.titulo}
                        {!am.isDirect && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100/10 text-blue-500 border border-blue-500/20" title="Aula associada via Pivot (N:N)">Reuso</span>
                        )}
                        {am.isDirect && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100/10 text-orange-500 border border-orange-500/20" title="Aula Estritamente Vinculada">Direta</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Link 
                      href={`/admin/aulas/${am.aula_id}`}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors border-l border-border-custom pl-2"
                      title="Editar metadados da aula"
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleReorder(am.aula_id, am.ordem, 'up')}
                      disabled={loading}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                      title="Subir na listagem"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleReorder(am.aula_id, am.ordem, 'down')}
                      disabled={loading}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                      title="Descer na listagem"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleRemove(am.aula_id, am.isDirect)}
                      disabled={loading}
                      className="p-1.5 text-text-muted hover:text-red-500 transition-colors disabled:opacity-50 border-l border-border-custom pl-2"
                      title="Desconectar do Módulo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal Multi-Select */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border-custom rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-border-custom flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text-primary">Selecionar Aulas do Acervo</h3>
                <p className="text-sm text-text-secondary mt-1">Selecione múltiplas aulas que ainda não estão neste módulo.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="p-4 border-b border-border-custom bg-background">
              <div className="flex items-center bg-surface border border-border-custom px-4 py-2 rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <Search className="w-4 h-4 text-text-muted mr-3" />
                <input 
                  type="text" 
                  value={modalFilter}
                  onChange={(e) => setModalFilter(e.target.value)}
                  placeholder="Buscar aulas pelo título..."
                  className="bg-transparent border-none outline-none text-sm text-text-primary w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {aulasDisponiveis.filter(a => a.titulo.toLowerCase().includes(modalFilter.toLowerCase())).length === 0 ? (
                 <div className="text-center p-8 text-sm text-text-muted">Nenhuma aula disponível para vinculo.</div>
              ) : (
                aulasDisponiveis
                  .filter(a => a.titulo.toLowerCase().includes(modalFilter.toLowerCase()))
                  .sort((a, b) => a.titulo.localeCompare(b.titulo))
                  .map(a => {
                    const isSelected = selectedIds.includes(a.id);
                    return (
                      <div 
                        key={a.id}
                        onClick={() => toggleSelection(a.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-primary text-primary' : 'bg-background border-border-custom text-text-primary hover:border-primary/50'}`}
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-text-muted" />}
                        <span className="font-medium text-sm flex-1">{a.titulo}</span>
                        {a.modulo_id === null ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100/10 text-blue-500 border border-blue-500/20 whitespace-nowrap">Acervo Solto</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100/10 text-zinc-500 border border-zinc-500/20 whitespace-nowrap">Vinculada Outro Módulo</span>
                        )}
                      </div>
                    )
                  })
              )}
            </div>

            <div className="p-4 border-t border-border-custom bg-background flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="text-sm text-text-muted">
                 <span className="font-bold text-text-primary">{selectedIds.length}</span> aula(s) selecionada(s)
               </div>
               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2 border border-border-custom text-text-primary hover:bg-background rounded-xl font-bold text-sm transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                  onClick={handleAddMultiple}
                  disabled={loading || selectedIds.length === 0}
                  className="flex-1 sm:flex-none px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-colors shadow-sm"
                 >
                   Adicionar Selecionadas
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
