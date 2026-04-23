import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { CourseEditorTabs } from '../CourseEditorTabs'
import { CursoBasicsForm } from '../CursoBasicsForm'
import { PilarAssociator } from '../PilarAssociator'
import { ModuloAssociator } from '../ModuloAssociator'
import { updateCursoBasics } from '../actions'
import { Eye, Video } from 'lucide-react'
import Link from 'next/link'
import { AdminTutorialCard } from '@/components/admin/AdminTutorialCard'

export const dynamic = 'force-dynamic'

export default async function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabaseAdmin = createAdminClient()
  const supabaseAuth = await createClient()

  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdminRole } = await supabaseAuth.rpc('is_admin')
  const { data: userData } = await supabaseAuth.from('usuarios').select('is_staff').eq('id', user.id).single()
  
  const isAdmin = !!isAdminRole
  const isStaff = !!userData?.is_staff
  const role = isAdmin ? 'admin' : (isStaff ? 'staff' : 'user')

  // 1. Buscar dados do Curso
  const { data: curso, error: cursoErr } = await supabaseAdmin
    .from('cursos')
    .select('*')
    .eq('id', id)
    .single()

  if (cursoErr || !curso) {
    console.error('Erro ao buscar curso:', cursoErr)
    return notFound()
  }

  // 2. Buscar Professores para o select
  const { data: professores } = await supabaseAdmin.from('professores').select('id, nome')

  // 3. Buscar Todos os Pilares e Pilares do Curso
  const [{ data: todosPilares }, { data: cursoPilares }] = await Promise.all([
    supabaseAdmin.from('pilares').select('id, nome, cor_badge').order('nome'),
    supabaseAdmin.from('cursos_pilares').select('pilar_id').eq('curso_id', id)
  ])

  // 4. Buscar Todos os Módulos e Módulos do Curso (Pivô N:N)
  const [{ data: todosModulos }, { data: cursoModulos }] = await Promise.all([
    supabaseAdmin.from('modulos').select('id, titulo').order('titulo'),
    supabaseAdmin.from('cursos_modulos')
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
    const { data: pivotAulas } = await supabaseAdmin
      .from('modulos_aulas')
      .select('modulo_id, ordem, aula:aulas(*)')
      .in('modulo_id', moduloIds)
      .order('ordem', { ascending: true })

    // Buscar depois as aulas vinculadas diretamente (Módulos Exclusivos / Legado)
    const { data: directAulas } = await supabaseAdmin
      .from('aulas')
      .select('*')
      .in('modulo_id', moduloIds)

    // Agrupar e Consolidar
    if (pivotAulas) {
      pivotAulas.forEach(item => {
        if (item.aula) {
          const modId = item.modulo_id
          const actualAula = Array.isArray(item.aula) ? item.aula[0] : item.aula
          if (!actualAula) return
          
          // Usa a ordem da pivot (local ao módulo), não a ordem global da aula
          const aulaObj = { ...actualAula, is_pivot: true, ordem: item.ordem }
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
    aulasPorModulo[modId].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999))
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <CursoBasicsForm 
                  key={`form-${id}-${curso.updated_at}`}
                  curso={curso} 
                  professores={professores || []} 
                  action={updateAction} 
                />
              </div>
              <div className="space-y-6">
                <AdminTutorialCard 
                  moduleTitle="Cursos"
                  color="emerald"
                  role={role}
                  steps={[
                    {
                      title: "Otimização de SEO",
                      description: "Manter o slug curto e focado em palavras-chave ajuda na indexação externa e organização do catálogo."
                    },
                    {
                      title: "Destaque de Vitrine",
                      description: "A imagem de capa é o primeiro contato do aluno. Utilize cores que contrastem com o fundo do site."
                    },
                    {
                      title: "Status de Produção",
                      description: "Se o curso estiver em 'Rascunho', matrículas existentes continuam funcionando, mas novos alunos não conseguem comprar."
                    }
                  ]}
                />
                <div className="bg-surface border border-border-custom rounded-[2rem] p-8 flex items-center gap-6 hover:border-emerald-500/30 transition-all cursor-default shadow-lg group">
                   <div className="w-16 h-16 bg-emerald-500/10 rounded-[1.25rem] flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                      <Video className="w-8 h-8" />
                   </div>
                   <div>
                      <p className="text-xs font-black text-text-primary uppercase tracking-[0.1em] italic">Vídeo: Melhores Práticas</p>
                      <p className="text-[10px] text-text-muted mt-1 uppercase font-bold leading-relaxed">Aprenda a cadastrar combos de produtos.</p>
                   </div>
                </div>
              </div>
            </div>
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
