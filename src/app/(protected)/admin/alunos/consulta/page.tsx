import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Download, 
  GraduationCap, 
  Calendar, 
  Clock, 
  ChevronRight,
  TrendingUp,
  User,
  Search
} from 'lucide-react'
import { StudentQueryFilters } from './StudentQueryFilters'

interface PageProps {
  searchParams: Promise<{
    cursoId?: string
    sort?: 'name' | 'date_asc' | 'date_desc' | 'end_date' | 'progress'
    q?: string
  }>
}

export default async function StudentQueryPage({ searchParams }: PageProps) {
  const supabaseAdmin = createAdminClient()
  const { cursoId, sort = 'date_desc', q } = await searchParams

  // 1. Buscar Cursos para o Filtro
  const { data: cursos } = await supabaseAdmin
    .from('cursos')
    .select('id, titulo')
    .order('titulo')

  // 2. Buscar Dados de Alunos/Assinaturas
  let query = supabaseAdmin
    .from('assinaturas')
    .select(`
      id,
      created_at,
      data_vencimento,
      status,
      usuario_id,
      curso_id,
      usuarios (
        id,
        full_name,
        nome,
        email
      ),
      cursos (
        id,
        titulo
      )
    `)
    .in('status', ['ativa', 'Ativa', 'ativo', 'Ativo'])

  if (cursoId) {
    query = query.eq('curso_id', cursoId)
  }

  const { data: rawEnrollments, error } = await query

  if (error) {
    console.error('Erro detalhado:', JSON.stringify(error, null, 2))
    // Em vez de travar, podemos mostrar uma mensagem amigável ou prosseguir com lista vazia
  }

  // 3. Processar Progresso e Detalhes
  const userIds = Array.from(new Set(rawEnrollments?.map(e => e.usuario_id) || []))
  
  // Otimização: progresso_aulas já tem curso_id, não precisamos do join complexo se o banco estiver consistente
  // Mas para garantir o progresso REAL por curso:
  const { data: allProgress } = await supabaseAdmin
    .from('progresso_aulas')
    .select('usuario_id, curso_id, concluida')
    .in('usuario_id', userIds)
    .eq('concluida', true)

  // Para o total de aulas, precisamos somar todas as aulas de todos os módulos do curso
  // Usamos left join (sem !inner) para não excluir aulas sem módulo se houver
  const { data: allLessons } = await supabaseAdmin
    .from('aulas')
    .select('id, modulo_id, modulos(curso_id)')

  // 4. Mapear e Calcular
  let enrollments = (rawEnrollments || []).map((enroll: any) => {
    // Filtrar progressos deste usuário para este curso específico
    const userProgress = allProgress?.filter(p => 
      p.usuario_id === enroll.usuario_id && 
      p.curso_id === enroll.curso_id
    ) || []
    
    // Identificar todas as aulas que pertencem a este curso (via módulos)
    const courseLessons = allLessons?.filter(l => 
      l.modulos && l.modulos.curso_id === enroll.curso_id
    ) || []

    const progressPercent = courseLessons.length > 0 
      ? Math.round((userProgress.length / courseLessons.length) * 100) 
      : 0

    return {
      ...enroll,
      displayName: enroll.usuarios?.full_name || enroll.usuarios?.nome || 'Usuário S/ Nome',
      progress: progressPercent,
      completedCount: userProgress.length,
      totalCount: courseLessons.length
    }
  })

  // 5. Filtragem por busca textual (Search)
  if (q) {
    const searchLower = q.toLowerCase()
    enrollments = enrollments.filter(e => 
      e.displayName.toLowerCase().includes(searchLower) ||
      e.usuarios?.email?.toLowerCase().includes(searchLower)
    )
  }

  // 6. Ordenação
  enrollments.sort((a, b) => {
    switch (sort) {
      case 'name':
        return a.displayName.localeCompare(b.displayName)
      case 'date_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'date_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'end_date':
        return new Date(a.data_vencimento || 0).getTime() - new Date(b.data_vencimento || 0).getTime()
      case 'progress':
        return b.progress - a.progress
      default:
        return 0
    }
  })

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER & VOLTAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="w-10 h-10 rounded-full bg-surface border border-border-custom flex items-center justify-center hover:bg-black/5 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase italic flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Consulta por Curso
            </h1>
            <p className="text-text-muted text-[12px] font-bold uppercase tracking-widest mt-1">Auditando progresso e matrículas ativas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border-custom rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-black/5 transition-all text-text-primary">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* FILTROS E BUSCA (Componente Cliente) */}
      <StudentQueryFilters 
        cursos={cursos} 
        cursoId={cursoId} 
        sort={sort} 
        q={q} 
      />

      {/* RESULTADOS */}
      <div className="bg-surface border border-border-custom rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="p-8 border-b border-border-custom bg-black/[0.01] flex items-center justify-between">
           <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] italic">Estudantes Identificados ({enrollments.length})</h2>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black/5">
                <th className="px-8 py-5 text-left text-[12px] font-black uppercase tracking-widest text-text-muted border-b border-border-custom">Estudante</th>
                <th className="px-8 py-5 text-left text-[12px] font-black uppercase tracking-widest text-text-muted border-b border-border-custom">Curso</th>
                <th className="px-8 py-5 text-left text-[12px] font-black uppercase tracking-widest text-text-muted border-b border-border-custom">Datas</th>
                <th className="px-8 py-5 text-left text-[12px] font-black uppercase tracking-widest text-text-muted border-b border-border-custom">Progresso</th>
                <th className="px-8 py-5 text-right text-[12px] font-black uppercase tracking-widest text-text-muted border-b border-border-custom">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {enrollments.length > 0 ? enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-black/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                        {/* Como não há image_url no banco para usuários, usamos sempre o ícone ou um placeholder baseado no nome */}
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-black text-xs uppercase">
                          {e.displayName.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <p className="text-base font-black text-text-primary uppercase tracking-tight">{e.displayName}</p>
                        <p className="text-[15px] font-bold text-text-muted lowercase">{e.usuarios?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="text-[15px] font-black text-text-primary uppercase italic">{e.cursos?.titulo || 'Curso Global'}</span>
                       <span className="text-[14px] text-text-muted font-bold uppercase mt-1">Status: {e.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[14px] font-black uppercase tracking-widest">Início: {new Date(e.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[14px] font-black uppercase tracking-widest">Fim: {e.data_vencimento ? new Date(e.data_vencimento).toLocaleDateString('pt-BR') : 'Vitalício'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-48 space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black uppercase text-text-muted">{e.progress}% Concluído</span>
                          <span className="text-[9px] font-black text-text-primary">{e.completedCount}/{e.totalCount} Aulas</span>
                       </div>
                       <div className="h-2 w-full rounded-full bg-border-custom overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                            style={{ width: `${e.progress}%` }}
                          />
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link 
                      href={`/admin/alunos/${e.usuario_id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border-custom bg-surface hover:bg-primary hover:text-white hover:border-primary transition-all group/btn"
                    >
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-12 h-12 text-text-muted opacity-20" />
                      <p className="text-sm font-black text-text-muted uppercase tracking-widest">Nenhum aluno encontrado com estes filtros</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
