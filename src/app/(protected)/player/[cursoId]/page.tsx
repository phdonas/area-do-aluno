import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlayerLayout } from '@/components/player-layout'

export default async function PlayerIndexPage({
  params,
}: {
  params: Promise<{ cursoId: string }>
}) {
  const { cursoId } = await params
  const supabaseAdmin = createAdminClient()
  const supabaseAuth = await createClient()

  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  console.log(`[PlayerRedirect] Iniciando busca para curso: ${cursoId}`);

  // 1. Identifica o curso real (UUID ou Slug)
  let realCursoId = cursoId;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursoId)
  if (!isUUID) {
    const { data: cBySlug } = await supabaseAdmin.from('cursos').select('id').eq('slug', cursoId).maybeSingle()
    if (cBySlug) realCursoId = cBySlug.id;
  }

  // 2. Busca os módulos vinculados a este curso (usando RPC para consistência)
  const { data: todosModulosCurso } = await supabaseAdmin.rpc('get_modulos_curso', { p_curso_id: realCursoId })
  
  if (todosModulosCurso && todosModulosCurso.length > 0) {
    // 3. Verifica se existe ALGUM módulo do tipo FLUXO no curso
    // Priorizamos o layout 'fluxo' para a experiência do aluno
    const moduloFluxo = todosModulosCurso.find((m: any) => m.ui_layout === 'fluxo');

    if (moduloFluxo) {
        console.log(`[PlayerRedirect] Redirecionando para layout de FLUXO: ${moduloFluxo.id}`);
        return redirect(`/player/${cursoId}/m/${moduloFluxo.id}`)
    }

    // 4. Se não for fluxo, abre a primeira aula do primeiro módulo
    const firstModulo = todosModulosCurso[0]
    const { data: firstAula } = await supabaseAdmin
        .from('modulos_aulas')
        .select('aula_id')
        .eq('modulo_id', firstModulo.id)
        .order('ordem', { ascending: true })
        .limit(1)
        .maybeSingle()

    if (firstAula) {
      return redirect(`/player/${cursoId}/${firstAula.aula_id}`)
    }
  }

  // 5. Fallback Final: Tenta buscar qualquer aula vinculada a qualquer módulo deste curso
  const { data: fallbackModuloAula } = await supabaseAdmin
    .from('cursos_modulos')
    .select('modulo_id, modulos_aulas(aula_id)')
    .eq('curso_id', realCursoId)
    .order('ordem', { ascending: true })
    .limit(1)
    .maybeSingle()
  
  const anyAulaIdFromModulo = (fallbackModuloAula as any)?.modulos_aulas?.[0]?.aula_id;

  if (anyAulaIdFromModulo) {
    return redirect(`/player/${cursoId}/${anyAulaIdFromModulo}`)
  }

  return (
    <PlayerLayout sidebar={null} cursoId={cursoId} aulaTitulo="Início" prefixes={[]}>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">Nenhum conteúdo disponível</h2>
          <p className="text-text-muted">Este curso ainda não possui aulas cadastradas ou módulos ativos.</p>
        </div>
      </div>
    </PlayerLayout>
  )
}
