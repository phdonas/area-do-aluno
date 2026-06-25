import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { BookOpen, Plus } from 'lucide-react'
import { SortableCursosList } from './SortableCursosList'

export default async function CursosListPage() {
  const supabase = createAdminClient()

  // Buscamos cursos e contamos quantos pilares e modulos eles possuem nas tabelas pivot
  const { data: cursos, error } = await supabase
    .from('cursos')
    .select(`
       *, 
       cursos_pilares(pilar_id), 
       cursos_modulos(
         modulo_id,
         modulos(
           id,
           modulos_aulas(
             aulas(duracao_segundos)
           ),
           aulas:aulas!aulas_modulo_id_fkey(duracao_segundos)
         )
       )
    `)
    // Ordenar primeiro pela coluna `ordem` (com fallback pra NULLS LAST) e depois por created_at
    .order('ordem', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erro ao buscar cursos:", error)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            Estruturas de Cursos
          </h1>
          <p className="text-text-secondary text-sm mt-1">Crie as vitrines (Cursos) e associe Pilares e Módulos para formar a grade curricular.</p>
        </div>
        <Link 
          href="/admin/cursos/novo" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Cadastrar Curso
        </Link>
      </div>

      <SortableCursosList initialCursos={cursos || []} />
    </div>
  )
}

