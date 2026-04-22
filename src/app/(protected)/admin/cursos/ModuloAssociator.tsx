'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  associarMultiplosModulosCurso, 
  desassociarModuloCurso, 
  reordenarModuloCurso, 
  criarModuloExclusivo, 
  reordenarAulaModulo, 
  toggleAulaGratis,
  separarModuloCurso
} from './actions'
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Video, ChevronDown, ChevronRight, GripVertical, Search, X, CheckSquare, Square, Lock, Unlock, SortAsc, Split } from 'lucide-react'
import Link from 'next/link'

type Modulo = {
  id: string
  titulo: string
}

type CursoModulo = {
  modulo_id: string
  ordem: number
  modulo: Modulo
}

export function ModuloAssociator({
  cursoId,
  todosModulos,
  modulosDoCurso,
  aulasPorModulo = {}
}: {
  cursoId: string
  todosModulos: Modulo[]
  modulosDoCurso: CursoModulo[]
  aulasPorModulo?: Record<string, any[]>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [newOrdem, setNewOrdem] = useState(modulosDoCurso.length + 1);
  const [novoModuloExclusivo, setNovoModuloExclusivo] = useState('');
  const [filterText, setFilterText] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFilter, setModalFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Separate Modal State
  const [isSeparateModalOpen, setIsSeparateModalOpen] = useState(false);
  const [separateModuloId, setSeparateModuloId] = useState('');
  const [separateModuloName, setSeparateModuloName] = useState('');

  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});

  // Refs for Drag & Drop Modulos
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Refs for Drag & Drop Aulas
  const dragAulaItem = useRef<{ moduloId: string, index: number } | null>(null);
  const dragAulaOverItem = useRef<{ moduloId: string, index: number } | null>(null);
  const [dragOverAulaKey, setDragOverAulaKey] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedStats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const modulosDisponiveis = todosModulos.filter(
    m => !modulosDoCurso.some(cm => cm.modulo_id === m.id)
  );

  const modulosDoCursoFiltrados = modulosDoCurso.filter(
    cm => cm.modulo.titulo.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleOpenModal = () => {
    setSelectedIds([]);
    setModalFilter('');
    setIsModalOpen(true);
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  const handleOpenSeparate = (moduloId: string, currentName: string) => {
    setSeparateModuloId(moduloId);
    setSeparateModuloName(currentName);
    setIsSeparateModalOpen(true);
  }

  const handleConfirmSeparate = async () => {
    if (!separateModuloName.trim()) return;
    setLoading(true);
    try {
      await separarModuloCurso(cursoId, separateModuloId, separateModuloName);
      setIsSeparateModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao separar módulo: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  }

  const handleAddMultiple = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await associarMultiplosModulosCurso(cursoId, selectedIds, newOrdem);
      setIsModalOpen(false);
      setNewOrdem(modulosDoCurso.length + selectedIds.length + 1);
    } catch (err) {
      console.error(err);
      alert('Erro ao agregar módulos.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateExclusivo = async () => {
    if (!novoModuloExclusivo.trim()) return;
    setLoading(true);
    try {
      await criarModuloExclusivo(cursoId, novoModuloExclusivo, newOrdem);
      setNovoModuloExclusivo('');
      setNewOrdem(modulosDoCurso.length + 2);
    } catch (err) {
      console.error(err);
      alert('Erro ao criar módulo exclusivo.');
    } finally {
      setLoading(false);
    }
  }

  const handleRemove = async (moduloId: string) => {
    if (!confirm('Tirar módulo da grade? (O módulo global e suas aulas não serão apagados do sistema, apenas desconectados deste curso)')) return;
    setLoading(true);
    try {
      await desassociarModuloCurso(cursoId, moduloId);
    } catch (err) {
      console.error(err);
      alert('Erro ao remover módulo da grade.');
    } finally {
      setLoading(false);
    }
  }

  const handleReorderModulo = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= modulosDoCurso.length) return;

    const newList = [...modulosDoCurso];
    const [movedItem] = newList.splice(index, 1);
    newList.splice(newIdx, 0, movedItem);

    const orderedIds = newList.map(cm => cm.modulo_id);

    setLoading(true);
    try {
      await reordenarModuloCurso(cursoId, orderedIds);
    } catch (err) {
      console.error(err);
      alert('Erro ao reordenar módulo.');
    } finally {
      setLoading(false);
    }
  }

  const handleDragSortModulo = async () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    
    const newList = [...modulosDoCurso];
    const [draggedItem] = newList.splice(dragItem.current, 1);
    newList.splice(dragOverItem.current, 0, draggedItem);
    
    const orderedIds = newList.map(cm => cm.modulo_id);

    setLoading(true);
    try {
      await reordenarModuloCurso(cursoId, orderedIds);
    } catch(err) {
      console.error(err);
      alert('Erro ao reordenar módulo via arraste.');
    } finally {
      dragItem.current = null;
      dragOverItem.current = null;
      setLoading(false);
    }
  }

  const handleDragSortAula = async () => {
    if (!dragAulaItem.current || !dragAulaOverItem.current) return;
    
    const { moduloId: fromModulo, index: fromIdx } = dragAulaItem.current;
    const { moduloId: toModulo, index: toIdx } = dragAulaOverItem.current;

    // Only allow reordering within the same module
    if (fromModulo !== toModulo || fromIdx === toIdx) {
      dragAulaItem.current = null;
      dragAulaOverItem.current = null;
      return;
    }

    const aulasDoModulo = [...(aulasPorModulo[fromModulo] || [])];
    const [draggedAula] = aulasDoModulo.splice(fromIdx, 1);
    aulasDoModulo.splice(toIdx, 0, draggedAula);

    const orderedIds = aulasDoModulo.map(a => a.id);

    setLoading(true);
    try {
      await reordenarAulaModulo(cursoId, fromModulo, orderedIds);
      router.refresh();
    } catch(err: any) {
      console.error(err);
      alert('Erro ao reordenar aula: ' + (err?.message || String(err)));
    } finally {
      dragAulaItem.current = null;
      dragAulaOverItem.current = null;
      setLoading(false);
    }
  }

  const handleSortByName = async () => {
    if (modulosDoCurso.length <= 1) return;
    if (!confirm('Reordenar todos os módulos deste curso em ordem alfabética?')) return;
    
    setLoading(true);
    try {
      const sortedList = [...modulosDoCurso].sort((a, b) => 
        a.modulo.titulo.localeCompare(b.modulo.titulo, 'pt', { sensitivity: 'base', numeric: true })
      );
      const orderedIds = sortedList.map(cm => cm.modulo_id);
      await reordenarModuloCurso(cursoId, orderedIds);
    } catch (err) {
      console.error(err);
      alert('Erro ao ordenar módulos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm mb-8 relative">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Ementa / Grade de Módulos</h2>
        <p className="text-sm text-text-secondary mt-1">
          Busque os módulos na biblioteca ou crie anexos exclusivos. Aulas são automaticamente herdadas nestes módulos.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-background border border-border-custom rounded-xl items-center">
          <div className="flex-1 text-sm text-text-primary">
            Puxe múltiplos módulos da biblioteca rapidamente.
          </div>
          <button 
            type="button" 
            onClick={handleOpenModal}
            disabled={loading}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Selecionar Módulos
          </button>
        </div>

        {/* Criar Exclusivo Opcional */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
          <input 
            type="text" 
            placeholder="Ou digite o título para CRIAR um NOVO Módulo Exclusivo..."
            value={novoModuloExclusivo}
            onChange={(e) => setNovoModuloExclusivo(e.target.value)}
            className="flex-1 bg-background border border-orange-500/30 px-4 py-2 rounded-xl text-text-primary text-sm focus:ring-1 focus:ring-orange-500 focus:outline-none"
            disabled={loading}
          />
          <button 
            type="button" 
            onClick={handleCreateExclusivo}
            disabled={loading || !novoModuloExclusivo.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Criar Exclusivo
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 flex items-center bg-background border border-border-custom px-4 py-2 rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-text-muted mr-3" />
          <input 
            type="text" 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filtrar módulos na grade..."
            className="bg-transparent border-none outline-none text-sm text-text-primary w-full"
          />
        </div>
        <button
          type="button"
          onClick={handleSortByName}
          disabled={loading || modulosDoCurso.length <= 1}
          className="p-2 bg-background border border-border-custom rounded-xl text-text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center gap-2 text-xs font-bold whitespace-nowrap disabled:opacity-50"
          title="Ordenar Módulos A-Z"
        >
          <SortAsc className="w-4 h-4" />
          <span className="hidden sm:inline">A-Z</span>
        </button>
      </div>

      {modulosDoCurso.length === 0 ? (
        <div className="p-4 bg-background border border-border-custom rounded-xl text-center text-sm text-text-muted border-dashed">
          Este curso ainda está vazio. Puxe ou crie os módulos acima.
        </div>
      ) : (
        <ul className="space-y-4">
          {modulosDoCursoFiltrados.map((cm, index) => {
            const isExpanded = !!expandedStats[cm.modulo_id];
            const aulas = aulasPorModulo[cm.modulo_id] || [];

            return (
              <li 
                key={cm.modulo_id} 
                className="bg-background border border-border-custom rounded-xl overflow-hidden shadow-sm"
                draggable
                onDragStart={(e) => { e.stopPropagation(); dragItem.current = index; }}
                onDragEnter={() => dragOverItem.current = index}
                onDragEnd={handleDragSortModulo}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 bg-background z-10 relative">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleExpand(cm.modulo_id)}>
                    <div className="text-text-muted cursor-grab active:cursor-grabbing hover:text-primary transition-colors pr-2" title="Arrastar para reordenar">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <button type="button" className="text-text-muted hover:text-text-primary">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="font-mono text-xs bg-black/10 text-text-muted px-2 py-1 rounded">Ord: {cm.ordem}</div>
                    <div className="flex flex-col">
                      <div className="font-bold text-text-primary text-sm">{cm.modulo.titulo}</div>
                      <div className="text-xs text-text-muted">{aulas.length} aula(s)</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Link 
                      href={`/admin/aulas/novo?modulo_id=${cm.modulo_id}&curso_return=${cursoId}`}
                      className="px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-bold border border-primary/20 flex items-center gap-1 transition-colors"
                      title="Criar Aula Opcional Dentro Deste Módulo"
                    >
                      <Video className="w-3 h-3"/> Add Aula
                    </Link>
                    <Link 
                      href={`/admin/modulos/${cm.modulo_id}`}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors border-l border-border-custom pl-2"
                      title="Editar metadados do módulo"
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleReorderModulo(index, 'up')}
                      disabled={loading || index === 0}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                      title="Subir na listagem"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleReorderModulo(index, 'down'); }}
                      disabled={loading || index === modulosDoCursoFiltrados.length - 1}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                      title="Descer na listagem"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenSeparate(cm.modulo_id, cm.modulo.titulo); }}
                      disabled={loading}
                      className="p-1.5 text-text-muted hover:text-indigo-500 transition-colors disabled:opacity-50 border-l border-border-custom pl-2"
                      title="Tornar Independente (Separar do Original)"
                    >
                      <Split className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemove(cm.modulo_id); }}
                      disabled={loading}
                      className="p-1.5 text-text-muted hover:text-red-500 transition-colors disabled:opacity-50 border-l border-border-custom pl-2"
                      title="Desconectar do Curso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Área Expansível do Drill-Down */}
                {isExpanded && (
                  <div className="bg-surface border-t border-border-custom p-4 inset-x-0">
                    {aulas.length === 0 ? (
                      <div className="text-xs text-text-muted text-center py-2 border border-dashed border-border-custom rounded-lg">
                        Nenhuma aula encontrada neste módulo.
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {aulas.map((aula, idx) => (
                          <li 
                            key={aula.id} 
                            className={`flex items-center justify-between p-3 bg-background border rounded-lg pl-3 relative pr-2 transition-all ${
                              dragOverAulaKey === `${cm.modulo_id}-${idx}`
                                ? 'border-indigo-500 bg-indigo-500/5 shadow-sm shadow-indigo-500/20'
                                : 'border-border-custom'
                            }`}
                            draggable
                            onDragStart={(e) => { e.stopPropagation(); dragAulaItem.current = { moduloId: cm.modulo_id, index: idx }; setDragOverAulaKey(null); }}
                            onDragEnter={(e) => { e.stopPropagation(); dragAulaOverItem.current = { moduloId: cm.modulo_id, index: idx }; setDragOverAulaKey(`${cm.modulo_id}-${idx}`); }}
                            onDragEnd={(e) => { e.stopPropagation(); setDragOverAulaKey(null); handleDragSortAula(); }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDragLeave={(e) => { e.stopPropagation(); }}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-text-muted/40 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                              <button
                                onClick={() => toggleAulaGratis(aula.id, !aula.is_gratis, cursoId)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${aula.is_gratis ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-background border-border-custom text-text-muted hover:text-indigo-500 hover:border-indigo-500/30'}`}
                                title={aula.is_gratis ? 'Remover Degustação' : 'Tornar Aula de Degustação (Grátis)'}
                              >
                                {aula.is_gratis ? <ExternalLink className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                {aula.is_gratis ? 'Degustação ON' : 'Tornar Grátis'}
                              </button>
                              <Link 
                                href={`/admin/aulas/${aula.id}`}
                                className="text-xs font-bold text-text-muted hover:text-primary transition-colors truncate"
                                target="_blank"
                              >
                                {aula.titulo}
                              </Link>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm('Remover esta aula deste módulo? A aula NÃO será excluída do sistema.')) return;
                                setLoading(true);
                                try {
                                  const { desassociarAulaModulo } = await import('@/app/(protected)/admin/modulos/actions');
                                  await desassociarAulaModulo(cm.modulo_id, aula.id);
                                } catch(err: any) {
                                  alert('Erro ao remover: ' + err?.message);
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              disabled={loading}
                              className="flex-shrink-0 ml-2 p-1.5 text-text-muted hover:text-red-500 transition-colors disabled:opacity-50 rounded-lg hover:bg-red-500/10"
                              title="Remover aula deste módulo (não exclui a aula do sistema)"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
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
                <h3 className="text-xl font-bold text-text-primary">Selecionar Módulos</h3>
                <p className="text-sm text-text-secondary mt-1">Busque e selecione os módulos da biblioteca global.</p>
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
                  placeholder="Buscar módulos pelo nome..."
                  className="bg-transparent border-none outline-none text-sm text-text-primary w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {modulosDisponiveis.filter(m => m.titulo.toLowerCase().includes(modalFilter.toLowerCase())).length === 0 ? (
                 <div className="text-center p-8 text-sm text-text-muted">Nenhum módulo encontrado na biblioteca.</div>
              ) : (
                modulosDisponiveis
                  .filter(m => m.titulo.toLowerCase().includes(modalFilter.toLowerCase()))
                  .map(m => {
                    const isSelected = selectedIds.includes(m.id);
                    return (
                      <div 
                        key={m.id}
                        onClick={() => toggleSelection(m.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-primary text-primary' : 'bg-background border-border-custom text-text-primary hover:border-primary/50'}`}
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-text-muted" />}
                        <span className="font-medium text-sm">{m.titulo}</span>
                      </div>
                    )
                  })
              )}
            </div>

            <div className="p-4 border-t border-border-custom bg-background flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="text-sm text-text-muted">
                 <span className="font-bold text-text-primary">{selectedIds.length}</span> módulo(s) selecionado(s)
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
                   Adicionar Selecionados
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Separar/Clonar Módulo */}
      {isSeparateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border-custom rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-custom flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text-primary">Separar Módulo de Origem</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Isto criará uma cópia nova deste módulo apenas para este curso. Todas as aulas atuais serão vinculadas automaticamente.
                </p>
              </div>
              <button onClick={() => setIsSeparateModalOpen(false)} className="p-2 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="p-6 space-y-4 bg-background">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1">
                  Qual será o nome deste NOVO módulo?
                </label>
                <input
                  type="text"
                  value={separateModuloName}
                  onChange={(e) => setSeparateModuloName(e.target.value)}
                  placeholder="Nome do módulo independente..."
                  className="w-full bg-surface border border-border-custom px-4 py-3 rounded-xl text-text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 border-t border-border-custom bg-background flex items-center justify-end gap-3">
               <button 
                onClick={() => setIsSeparateModalOpen(false)}
                className="px-4 py-2 border border-border-custom text-text-primary hover:bg-surface rounded-xl font-bold text-sm transition-colors"
               >
                 Cancelar
               </button>
               <button 
                onClick={handleConfirmSeparate}
                disabled={loading || !separateModuloName.trim()}
                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
               >
                 {loading ? 'Separando...' : 'Confirmar Separação'}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
