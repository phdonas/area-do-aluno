'use client'

import React, { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BookOpen, Pencil, Blocks, Layers, Clock, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { formatDuration } from '@/lib/formatter'
import { DeleteButton } from './delete-button'
import { deleteCurso, updateCursosOrdem } from './actions'

// --- Item Ordernável (TR) ---
function SortableItem({ curso }: { curso: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: curso.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  const qtdPilares = (curso.cursos_pilares || []).length;
  const qtdModulos = (curso.cursos_modulos || []).length;

  let totalCursoSegundos = 0;
  (curso.cursos_modulos || []).forEach((cm: any) => {
    const m = cm.modulos;
    if (m) {
      const duracaoAulasVinculadas = (m.modulos_aulas || []).reduce((acc: number, ma: any) => acc + (ma.aulas?.duracao_segundos || 0), 0);
      const duracaoAulasDiretas = (m.aulas || []).reduce((acc: number, a: any) => acc + (a.duracao_segundos || 0), 0);
      totalCursoSegundos += (duracaoAulasVinculadas + duracaoAulasDiretas);
    }
  });

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-black/5 transition-colors ${isDragging ? 'bg-primary/5 shadow-lg border-2 border-primary border-dashed relative' : ''}`}
    >
      <td className="p-4 w-12 text-center text-text-muted cursor-grab active:cursor-grabbing hover:text-primary transition-colors" {...attributes} {...listeners}>
        <GripVertical className="w-5 h-5 inline-block" />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          {curso.thumb_url ? (
            <img src={curso.thumb_url} className="w-12 h-12 rounded object-cover border border-border-custom" alt="Thumb" />
          ) : (
            <div className="w-12 h-12 rounded bg-background border border-border-custom flex items-center justify-center text-text-muted">
              <BookOpen className="w-5 h-5 opacity-50" />
            </div>
          )}
          <div>
            <Link href={`/admin/cursos/${curso.id}`} className="hover:underline decoration-primary">
              <p className="font-bold text-text-primary text-sm">{curso.titulo}</p>
            </Link>
            <p className="text-xs text-text-secondary text-mono">/{curso.slug}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        {curso.status === 'publicado' ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100/10 text-green-500 border border-green-500/20 w-fit">Publicado</span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100/10 text-orange-500 border border-orange-500/20 w-fit">Rascunho</span>
        )}
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <span className="text-[10px] text-text-secondary flex items-center gap-1 bg-background border border-border-custom px-2 py-1 rounded">
            <Layers className="w-3 h-3"/> {qtdPilares} Pilares
          </span>
          <span className="text-[10px] text-text-secondary flex items-center gap-1 bg-background border border-border-custom px-2 py-1 rounded">
            <Blocks className="w-3 h-3"/> {qtdModulos} Módulos
          </span>
          <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 bg-indigo-500/5 border border-indigo-500/10 px-2 py-1 rounded">
            <Clock className="w-3 h-3" /> {formatDuration(totalCursoSegundos)}
          </span>
        </div>
      </td>
      <td className="p-4 flex items-center justify-end gap-2 relative z-20">
        <Link 
          href={`/admin/cursos/${curso.id}`}
          className="p-2 text-text-secondary hover:text-primary bg-background border border-border-custom hover:border-primary/30 rounded-lg transition-colors"
          title="Vitrines e Pivot"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <DeleteButton id={curso.id} action={deleteCurso.bind(null, curso.id)} />
      </td>
    </tr>
  )
}

// --- Componente Principal ---
export function SortableCursosList({ initialCursos }: { initialCursos: any[] }) {
  const [cursos, setCursos] = useState(initialCursos)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, // Ajuda a evitar clicks acidentais sendo lidos como drag
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCursos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)

        const novoArray = arrayMove(items, oldIndex, newIndex)
        
        // Chama Server Action silenciosamente (em background)
        startTransition(() => {
          updateCursosOrdem(novoArray.map(c => c.id))
        })

        return novoArray
      })
    }
  }

  return (
    <div className="bg-surface border border-border-custom rounded-2xl overflow-hidden shadow-sm relative">
      {(!cursos || cursos.length === 0) ? (
        <div className="p-8 text-center text-text-secondary">
          Nenhum curso montado ainda.
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-background/50 border-b border-border-custom text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold w-12"></th>
                <th className="p-4 font-bold">Curso</th>
                <th className="p-4 font-bold w-32">Status</th>
                <th className="p-4 font-bold w-80">Grade Curricular</th>
                <th className="p-4 font-bold text-right w-32">Ações</th>
              </tr>
            </thead>
            <SortableContext 
              items={cursos.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody className="divide-y divide-border-custom relative">
                {cursos.map(curso => (
                  <SortableItem key={curso.id} curso={curso} />
                ))}
              </tbody>
            </SortableContext>
          </table>
          {isPending && (
             <div className="absolute top-2 right-2 flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-primary animate-pulse bg-surface px-3 py-1 rounded-full border border-primary/20">
                Salvando ordem...
             </div>
          )}
        </DndContext>
      )}
    </div>
  )
}
