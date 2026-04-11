import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Save, LayoutTemplate } from 'lucide-react'
import { updateModulo } from '../actions'
import { AulaAssociator } from '../AulaAssociator'

export default async function EditarModuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: modulo } = await supabase
    .from('modulos')
    .select('*')
    .eq('id', id)
    .single()

  if (!modulo) {
    notFound()
  }

  // Bind the id to the server action
  const updateModuloWithId = updateModulo.bind(null, modulo.id)

  // 1. Fetch Todas as Aulas (Globais e das outras pastas) para o Modal
  const { data: todasAulasGlobais } = await supabase
    .from('aulas')
    .select('id, titulo, modulo_id')
    .order('titulo', { ascending: true })

  // 2. Fetch Aulas atreladas a este módulo (Diretas)
  const { data: aulasDiretas } = await supabase
    .from('aulas')
    .select('id, titulo, modulo_id, ordem')
    .eq('modulo_id', id)
  
  // 3. Fetch Aulas atreladas a este módulo (Pivot)
  const { data: pivotAulas } = await supabase
    .from('modulos_aulas')
    .select('ordem, aula_id, aulas(id, titulo, modulo_id)')
    .eq('modulo_id', id)

  // 4. Montar Array unificado de Aulas Do Módulo
  const aulasDoModuloMap = new Map();
  
  if (aulasDiretas) {
    aulasDiretas.forEach(a => {
      aulasDoModuloMap.set(a.id, {
        aula_id: a.id,
        ordem: a.ordem,
        isDirect: true,
        aula: {
          id: a.id,
          titulo: a.titulo,
          modulo_id: a.modulo_id
        }
      });
    });
  }

  if (pivotAulas) {
    pivotAulas.forEach((p: any) => {
      // Evita duplicatas se por acaso existir nas duas (raro, mas possivel)
      if (!aulasDoModuloMap.has(p.aula_id)) {
        aulasDoModuloMap.set(p.aula_id, {
          aula_id: p.aula_id,
          ordem: p.ordem,
          isDirect: false,
          aula: {
            id: p.aulas.id,
            titulo: p.aulas.titulo,
            modulo_id: p.aulas.modulo_id
          }
        });
      }
    });
  }

  const aulasDoModulo = Array.from(aulasDoModuloMap.values()).sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/modulos" 
          className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-4 w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Módulos
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Gestão de Módulo</h1>
        <p className="text-text-secondary text-sm mt-1">Alterando configurações da pasta de aulas e agregando conteúdo.</p>
      </div>

      <div className="space-y-8">
        {/* Topo: Detalhes */}
        <div className="bg-surface border border-border-custom p-6 md:p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-xl font-bold text-text-primary">
             <LayoutTemplate className="w-5 h-5 text-indigo-500" /> Detalhes do Módulo
          </div>
          
          <form action={updateModuloWithId} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="titulo" className="block text-sm font-bold text-text-primary">Título do Módulo *</label>
              <input 
                type="text" 
                id="titulo" 
                name="titulo" 
                required
                defaultValue={modulo.titulo}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="descricao" className="block text-sm font-bold text-text-primary">Descrição Resumida</label>
              <textarea 
                id="descricao" 
                name="descricao" 
                rows={3}
                defaultValue={modulo.descricao || ''}
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="ordem" className="block text-sm font-bold text-text-primary">Ordem Padrão</label>
                <input 
                  type="number" 
                  id="ordem" 
                  name="ordem" 
                  defaultValue={modulo.ordem || 0}
                  className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="curso_id" className="block text-sm font-bold text-text-primary">Vínculo Direto</label>
                <select 
                  id="curso_id" 
                  name="curso_id" 
                  defaultValue={modulo.curso_id === null ? "null" : modulo.curso_id}
                  className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
                >
                  <option value="null">✅ Global / Biblioteca</option>
                  {modulo.curso_id && (
                     <option value={modulo.curso_id}>🛑 Vinculado Exclusivamente a um Curso Específico</option>
                  )}
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-border-custom flex justify-end gap-3">
              <Link 
                href="/admin/modulos"
                className="px-6 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-black/5 font-medium transition-colors"
              >
                Cancelar
              </Link>
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {/* Builder N:N */}
        <div className="grid grid-cols-1 gap-8">
            <AulaAssociator 
               moduloId={modulo.id}
               todasAulasGlobais={todasAulasGlobais || []}
               aulasDoModulo={aulasDoModulo as any}
            />
        </div>
      </div>
    </div>
  )
}
