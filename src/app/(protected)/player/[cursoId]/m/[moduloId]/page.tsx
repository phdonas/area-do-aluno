import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PlayerLayout } from '@/components/player-layout'
import { CourseFlowTemplate } from '@/components/courses/CourseFlowTemplate'
import { SidebarPlayer } from '@/components/sidebar-player'
import { getPrefixosLimpeza } from '@/lib/prefixes'
import '@/styles/course-flow.css'

export default async function ModuloPlayerPage({
  params,
}: {
  params: Promise<{ cursoId: string; moduloId: string }>
}) {
  const { cursoId, moduloId } = await params
  const supabaseAdmin = createAdminClient()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Buscar dados do módulo e valida se é tipo FLUXO
  const { data: modulo } = await supabaseAdmin
    .from('modulos')
    .select('*')
    .eq('id', moduloId)
    .single()

  if (!modulo || modulo.ui_layout !== 'fluxo') {
    notFound()
  }

  // 1.1 Identifica o curso real (Suporta UUID ou Slug)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursoId)
  const query = supabaseAdmin.from('cursos').select('*')
  if (isUUID) {
    query.or(`id.eq.${cursoId},slug.eq.${cursoId}`)
  } else {
    query.eq('slug', cursoId)
  }
  const { data: curso } = await query.single()

  if (!curso) {
    notFound()
  }

  const prefixes = await getPrefixosLimpeza()

  // 1.2 Buscar Módulos do Curso (para a Sidebar) usando curso.id (sempre UUID)
  const { data: modulosData } = await supabaseAdmin.rpc('get_modulos_curso', { p_curso_id: curso.id })
  const uniqueModulosData = Array.from(new Map((modulosData || []).map((m: any) => [m.id, m])).values())
  const modulosIds = uniqueModulosData.map((m: any) => m.id)
  
  const { data: aulasSide } = await supabaseAdmin.from('aulas').select('*').in('modulo_id', modulosIds)
  const { data: pivotAulasSide } = await supabaseAdmin.from('modulos_aulas').select('modulo_id, ordem, aulas(*)').in('modulo_id', modulosIds)

  const modulos = uniqueModulosData.map((m: any) => {
    const d = (aulasSide || []).filter((a: any) => a.modulo_id === m.id)
    const p = (pivotAulasSide || []).filter((pa: any) => pa.modulo_id === m.id).map((pa: any) => ({ ...pa.aulas, ordem: pa.ordem }))
    const combinedAulas = [...d, ...p]
    const uniqueAulas = Array.from(new Map(combinedAulas.map((a: any) => [a.id, a])).values())
    return { ...m, aulas: uniqueAulas.sort((a: any, b: any) => a.ordem - b.ordem) }
  })

  // 2. Buscar todas as aulas vinculadas a este módulo (via modulo_id DIRETO)
  const { data: aulasDiretasRaw } = await supabaseAdmin
    .from('aulas')
    .select(`
      *,
      recursos (*)
    `)
    .eq('modulo_id', moduloId)

  // 3. Buscar todas as aulas vinculadas a este módulo (via tabela PIVOT modulos_aulas)
  const { data: pivotAulasRaw } = await supabaseAdmin
    .from('modulos_aulas')
    .select(`
      ordem,
      aulas (
        *,
        recursos (*)
      )
    `)
    .eq('modulo_id', moduloId)

  // 4. Unificar as aulas removendo duplicatas e priorizando a ordem da tabela pivot
  const unifiedAulasMap = new Map()

  // Adiciona as diretas primeiro
  if (aulasDiretasRaw) {
    aulasDiretasRaw.forEach(a => {
      unifiedAulasMap.set(a.id, { 
        ...a, 
        displayOrdem: a.num_ordem || a.ordem || 0 
      })
    })
  }

  // Adiciona as da pivot (sobrescrevendo se necessário com a ordem correta da pivot)
  if (pivotAulasRaw) {
    pivotAulasRaw.forEach((p: any) => {
      if (p.aulas) {
        unifiedAulasMap.set(p.aulas.id, { 
          ...p.aulas, 
          displayOrdem: p.ordem || p.aulas.num_ordem || 0 
        })
      }
    })
  }

  const aulasRaw = Array.from(unifiedAulasMap.values()).sort((a, b) => a.displayOrdem - b.displayOrdem)

  // 5. Pegar progresso do aluno para marcar concluídos
  const { data: progressoTotal } = await supabase
    .from('progresso_aulas')
    .select('aula_id, concluida')
    .eq('usuario_id', user.id)
    .eq('curso_id', curso.id)

  const aulasConcluidasIds = new Set(progressoTotal?.filter((p: any) => p.concluida).map((p: any) => p.aula_id) || [])
  const todasAulas = modulos.flatMap((m: any) => m.aulas)
  const porcentagem = todasAulas.length > 0 ? Math.round((aulasConcluidasIds.size / todasAulas.length) * 100) : 0

  // 6. Mapear para o formato do CourseFlowTemplate
  const tools = aulasRaw?.map((aula: any) => {
    // Supabase pode retornar a relação como objeto ou array de 1 elemento
    const recurso = Array.isArray(aula.recursos) ? aula.recursos[0] : aula.recursos

    return {
      id: aula.id,
      num: aula.displayOrdem || 0,
      phase: ((aula.displayOrdem <= 3 ? aula.displayOrdem : 'x') || 'x') as any,
      tag: aula.tipo_conteudo === 'ferramenta' ? 'FERRAMENTA' : 'AULA',
      title: aula.titulo || 'Sem título',
      description: recurso?.objetivo || 'Sem descrição cadastrada.',
      result: recurso?.resultados_esperados || 'Sem resultado detalhado.',
      instructions: recurso?.como_usar,
      target: recurso?.quando_usar,
      status: 'ok' as const,
      actionUrl: recurso?.arquivo_url || undefined,
      downloadUrl: aula.tipo_conteudo === 'download' ? recurso?.arquivo_url : undefined
    }
  }) || []

  return (
    <PlayerLayout cursoId={curso.id} aulaTitulo={modulo.titulo} prefixes={prefixes} isFlowMode={true} sidebar={
      <SidebarPlayer 
        curso={curso}
        modulos={modulos}
        aulaId={null}
        activeModuloId={moduloId}
        cursoId={curso.id}
        aulasConcluidasIds={Array.from(aulasConcluidasIds)}
        porcentagem={porcentagem}
        prefixes={prefixes}
        isFlowMode={true}
      />
    }>
      <CourseFlowTemplate 
        titulo={modulo.titulo}
        subtitulo={curso?.titulo || ''}
        meta={{
          ferramentas: `${aulasRaw?.length || 0}`,
          fases: "Ciclo Completo",
          perfis: "Gestão e Liderança",
          versao: "1.0"
        }}
        introTitle="Bem-vindo ao Fluxo Inteligente"
        introText="Aqui estão as ferramentas e conteúdos organizados sequencialmente para sua evolução."
        tools={tools} 
        completedToolsIds={Array.from(aulasConcluidasIds)}
      />
    </PlayerLayout>
  )
}
