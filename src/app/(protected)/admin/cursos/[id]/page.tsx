import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { CourseEditorTabs } from '../CourseEditorTabs'
import { CursoBasicsForm } from '../CursoBasicsForm'
import { PilarAssociator } from '../PilarAssociator'
import { ModuloAssociator } from '../ModuloAssociator'
import { updateCursoBasics } from '../actions'
import { Eye } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  // 1. Buscar dados do Curso
  const { data: curso, error: cursoErr } = await supabase
    .from('cursos')
    .select('*')
    .eq('id', id)
    .single()

  if (cursoErr || !curso) {
    console.error('Erro ao buscar curso:', cursoErr)
    return notFound()
  }

  // 2. Buscar Professores para o select
  const { data: professores } = await supabase.from('professores').select('id, nome')

  // 3. Buscar Todos os Pilares e Pilares do Curso
  const [{ data: todosPilares }, { data: cursoPilares }] = await Promise.all([
    supabase.from('pilares').select('id, nome, cor_badge').order('nome'),
    supabase.from('cursos_pilares').select('pilar_id').eq('curso_id', id)
  ])

  // 4. Buscar Todos os Módulos e Módulos do Curso (Pivô N:N)
  const [{ data: todosModulos }, { data: cursoModulos }] = await Promise.all([
    supabase.from('modulos').select('id, titulo').order('titulo'),
    supabase.from('cursos_modulos')
      .select('*, modulo:modulos(id, titulo)')
      .eq('curso_id', id)
      .order('ordem', { ascending: true })
  ])

  // 5. Buscar Aulas de todas as fontes possíveis para os módulos deste curso
  const moduloIds = cursoModulos?.map(cm => cm.modulo_id) || []
  let aulasPorModulo: Record<string, any[]> = {}
  let totalAulas = 0

  if (moduloIds.length > 0) {
    // Buscar primeiro as aulas vinculadas à tabela pivot (Biblioteca Global / Sincronização)
    const { data: pivotAulas } = await supabase
      .from('modulos_aulas')
      .select('modulo_id, aula:aulas(*)')
      .in('modulo_id', moduloIds)

    // Buscar depois as aulas vinculadas diretamente (Módulos Exclusivos / Legado)
    const { data: directAulas } = await supabase
      .from('aulas')
      .select('*')
      .in('modulo_id', moduloIds)

    // Agrupar e Consolidar
    if (pivotAulas) {
      pivotAulas.forEach(item => {
        if (item.aula) {
          const modId = item.modulo_id
          const aulaObj = { ...item.aula, is_pivot: true }
          if (!aulasPorModulo[modId]) aulasPorModulo[modId] = []
          if (!aulasPorModulo[modId].some(a => a.id === aulaObj.id)) {
            aulasPorModulo[modId].push(aulaObj)
          }
        }
      })
    }

    if (directAulas) {
      directAulas.forEach(aula => {
        const modId = aula.modulo_id
        if (!aulasPorModulo[modId]) aulasPorModulo[modId] = []
        if (!aulasPorModulo[modId].some(a => a.id === aula.id)) {
          aulasPorModulo[modId].push(aula)
        }
      })
    }

    // Calcular total único
    const uniqueAulas = new Set()
    Object.values(aulasPorModulo).flat().forEach(a => uniqueAulas.add(a.id))
    totalAulas = uniqueAulas.size
  }

  // Ordenar aulas dentro dos módulos pela propriedade 'ordem'
  Object.keys(aulasPorModulo).forEach(modId => {
    aulasPorModulo[modId].sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
  })

  // Preparar ação de salvamento
  const updateAction = updateCursoBasics.bind(null, id)

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho Integrado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="space-y-1">
          <Link 
            href="/admin/cursos" 
            className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors flex items-center gap-2 mb-2"
          >
            ← Voltar para Listagem
          </Link>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic leading-none">
            Configurar: <span className="text-primary">{curso.titulo}</span>
          </h1>
          <p className="text-text-secondary text-sm font-medium">Gestão de vitrine, pilares e estrutura de conteúdo.</p>
        </div>
        
        <Link 
          href={`/loja/curso/${id}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border-custom hover:border-primary/50 text-text-primary hover:text-primary rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-sm group"
        >
          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Visão do Aluno
        </Link>
      </div>

      <CourseEditorTabs 
        key={`tabs-${id}`}
        vendasContent={
          <div key="vendas-view" className="animate-in fade-in duration-500">
            <CursoBasicsForm 
              key={`form-${id}-${curso.updated_at}`}
              curso={curso} 
              professores={professores || []} 
              action={updateAction} 
            />
          </div>
        }
        conteudoContent={
          <div key="grade-view" className="space-y-8 animate-in fade-in duration-500">
            <PilarAssociator 
              cursoId={id}
              todosPilares={todosPilares || []}
              pilaresAtivos={cursoPilares?.map(cp => cp.pilar_id) || []}
            />
            <ModuloAssociator 
              cursoId={id}
              todosModulos={todosModulos || []}
              modulosDoCurso={cursoModulos || []}
              aulasPorModulo={aulasPorModulo}
            />
          </div>
        }
        stats={{
          modulos: cursoModulos?.length || 0,
          aulas: totalAulas,
          recursos: 0, 
          testes: 0
        }}
      />
    </div>
  )
}
