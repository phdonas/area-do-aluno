import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, Layers, MonitorPlay, Component, ShieldAlert, ArrowRight, 
  FileQuestion, Package, Wrench, Users, Eraser, Activity, TrendingUp, AlertTriangle, Clock, 
  BarChart3, Banknote, History, GraduationCap, ChevronRight, Eye, Play, Search, UserPlus,
  CalendarDays, Filter, ChevronDown, Target, Send, Tag, ShieldCheck, Zap, Award, Settings,
  Columns3, MailCheck, History as HistoryIcon, Ticket
} from 'lucide-react'

import AnalyticsVisual from './AnalyticsVisual'
import AdminFilters from './AdminFilters'

export default async function AdminDashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ periodo?: string; cursoId?: string; planoId?: string }> 
}) {
  const { periodo = 'total', cursoId, planoId } = await searchParams
  const supabaseAuth = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  const { data: isAdminRole } = await supabaseAuth.rpc('is_admin')
  const { data: userData } = await supabaseAuth.from('usuarios').select('is_staff').eq('id', user.id).single()
  
  const isAdmin = !!isAdminRole
  const isStaff = !!userData?.is_staff

  if (!isAdmin && !isStaff) redirect('/catalogo?acesso_negado=admin')

  // 1. Configuração do Filtro de Datas
  const now = new Date()
  let startDate: string | null = null
  
  if (periodo === 'hoje') {
    startDate = new Date(now.setHours(0,0,0,0)).toISOString()
  } else if (periodo === '7d') {
    startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString()
  } else if (periodo === '30d') {
    startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString()
  } else if (periodo === 'mes') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  } else if (periodo === 'ano') {
    startDate = new Date(now.getFullYear(), 0, 1).toISOString()
  }

  // 2. Consolidação de Dados (Paralelismo Máximo)
  const [
    { count: cursosCount },
    { count: modulosCount },
    { count: aulasCount },
    { count: questCount },
    { count: totalMatriculasAtivas },
    { data: activeStudentsData },
    { data: cursosLista }, 
    { data: aulasSemVideo },
    { data: matriculasRecentes },
    { data: assinaturasPeriodo },
    { data: progressoConcluido },
    { data: todasAulas }
  ] = await Promise.all([
    supabaseAdmin.from('cursos').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('modulos').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('aulas').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('questionarios').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('assinaturas').select('*', { count: 'exact', head: true }).in('status', ['ativa', 'ativo', 'Ativa', 'Ativo']),
    supabaseAdmin.from('assinaturas').select('usuario_id').in('status', ['ativa', 'ativo', 'Ativa', 'Ativo']),
    supabaseAdmin.from('cursos').select('id, titulo'),
    supabaseAdmin.from('aulas').select('id').is('video_url', null),
    supabaseAdmin.from('assinaturas')
      .select(`id, created_at, usuarios (full_name), cursos (titulo)`)
      .order('created_at', { ascending: false }).limit(6),
    
    (() => {
      let q = supabaseAdmin.from('assinaturas')
        .select('id, created_at, curso_id, plano_id, status, cursos(preco), planos(preco_mensal, preco_anual)')
        .in('status', ['ativa', 'ativo', 'Ativa', 'Ativo'])
      if (startDate) q = q.gte('created_at', startDate)
      if (cursoId) q = q.eq('curso_id', cursoId)
      if (planoId) q = q.eq('plano_id', planoId)
      return q
    })(),

    (() => {
      let q = supabaseAdmin.from('progresso_aulas')
        .select('usuario_id, aula_id, updated_at, aulas(duracao_segundos, modulo_id, modulos(curso_id))')
        .eq('concluida', true)
      if (startDate) q = q.gte('updated_at', startDate)
      return q
    })(),

    supabaseAdmin.from('aulas').select('id, titulo, modulo_id, modulos(curso_id)')
  ])

  const uniqueStudentsSet = new Set((activeStudentsData || []).map(a => a.usuario_id))
  const totalAlunosAtivos = uniqueStudentsSet.size || 0

  // 3. Processamento de Faturamento e Matrículas
  let fatCursos = 0
  let fatPlanos = 0
  let countCursos = 0
  let countPlanos = 0
  
  const assinaturasParaProcessar = assinaturasPeriodo || []
  
  assinaturasParaProcessar.forEach((ass: any) => {
     if (ass.curso_id) {
       const precoRaw = ass.cursos?.preco || '0'
       const valor = parseFloat(precoRaw.toString().replace(/[^\d.]/g, '') || '0')
       fatCursos += valor
       countCursos++
     }
     if (ass.plano_id) {
       const precoRaw = ass.planos?.preco_anual || ass.planos?.preco_mensal || '0'
       const valor = parseFloat(precoRaw.toString().replace(/[^\d.]/g, '') || '0')
       fatPlanos += valor
       countPlanos++
     }
  })
  const totalFaturamento = fatCursos + fatPlanos
  const totalMatrículasPeriodo = countCursos + countPlanos

  // 4. Engajamento
  const progressoFiltrado = cursoId 
    ? (progressoConcluido || [])?.filter((p: any) => p.aulas?.modulos?.curso_id === cursoId)
    : (progressoConcluido || [])

  let horasCursos = 0
  let horasPlanos = 0

  progressoFiltrado?.forEach((p: any) => {
    const duracao = p.aulas?.duracao_segundos || 0
    if (p.aulas?.modulos?.curso_id) {
        horasCursos += duracao
    } else {
        horasPlanos += duracao
    }
  })

  const totalSegundos = (progressoFiltrado || []).reduce((acc: number, prog: any) => acc + (prog.aulas?.duracao_segundos || 0), 0)
  const totalHoras = Math.floor(totalSegundos / 3600)

  // Retenção
  const todasAulasFiltradas = cursoId 
    ? todasAulas?.filter((a: any) => a.modulos?.curso_id === cursoId)
    : todasAulas
    
  const totalAulasCount = todasAulasFiltradas?.length || 1
  const progressoPorAluno: Record<string, Set<string>> = {}
  
  progressoFiltrado?.forEach((p: any) => {
    if (!progressoPorAluno[p.usuario_id]) progressoPorAluno[p.usuario_id] = new Set()
    progressoPorAluno[p.usuario_id].add(p.aula_id)
  })

  const alunosAcimaThreshold = Object.values(progressoPorAluno).filter(aulasConcluidas => {
    const totalAulasNecessarias = totalAulasCount > 0 ? totalAulasCount : 1
    const progresso = (aulasConcluidas.size / totalAulasNecessarias) * 100
    return progresso >= 0
  }).length

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20 animate-in fade-in duration-1000">
      
      {/* 🟢 SECRETARIA E CONFIGURAÇÕES */}
      <section className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-indigo-600 pl-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2 block">Pilar Operacional</span>
            <h1 className="text-4xl font-black text-text-primary tracking-tighter">Secretaria e Configurações</h1>
            <p className="text-text-secondary mt-2 font-medium">Gestão administrativa de alunos, cursos e ferramentas.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/admin/cursos/novo" className="px-6 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Novo Curso
             </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: 'Cursos', count: cursosCount, href: '/admin/cursos', icon: <BookOpen className="w-4 h-4 text-indigo-500" />, color: 'bg-indigo-500/10' },
             { label: 'Ementas & Módulos', count: modulosCount, href: '/admin/modulos', icon: <Columns3 className="w-4 h-4 text-blue-500" />, color: 'bg-blue-500/10' },
             { label: 'Aulas Globais', count: aulasCount, href: '/admin/aulas', icon: <MonitorPlay className="w-4 h-4 text-emerald-500" />, color: 'bg-emerald-500/10' },
             { label: 'Alunos / Matrículas', count: `${totalAlunosAtivos} / ${totalMatriculasAtivas}`, href: '/admin/alunos', icon: <Users className="w-4 h-4 text-amber-500" />, color: 'bg-amber-500/10' },
           ].map((item, idx) => (
             <Link key={idx} href={item.href} className="p-6 bg-surface border border-border-custom rounded-[2rem] hover:border-primary transition-all group flex flex-col justify-between h-32">
                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center`}>
                   {item.icon}
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-text-muted">{item.label}</p>
                   <p className="text-2xl font-black text-text-primary">{item.count}</p>
                </div>
             </Link>
           ))}
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted px-2 flex items-center gap-3">
             <Settings className="w-3.5 h-3.5" />
             Configuração da Plataforma
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* LINHA 1 */}
              <Link href="/admin/ferramentas" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <Zap className="w-5 h-5 text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Ferramentas SaaS</span>
              </Link>
              <Link href="/admin/questionarios" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <FileQuestion className="w-5 h-5 text-blue-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Questionários ({questCount})</span>
              </Link>
              <Link href="/admin/cupons" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <Ticket className="w-5 h-5 text-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Cupons & Promo</span>
              </Link>
              <Link href="/admin/pilares" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <Layers className="w-5 h-5 text-amber-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Pilares</span>
              </Link>

              {/* LINHA 2 */}
              <Link href="/admin/convites" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <MailCheck className="w-5 h-5 text-blue-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Gestão de Convites</span>
              </Link>
              <Link href="/admin/usuarios" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <ShieldCheck className="w-5 h-5 text-indigo-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Gestão de Equipe</span>
              </Link>
              <Link href="/admin/configuracoes/prefixos" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <Eraser className="w-5 h-5 text-slate-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Limpeza de Nomes</span>
              </Link>
              <Link href="/admin/auditoria" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <HistoryIcon className="w-5 h-5 text-cyan-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Auditoria & Logs</span>
              </Link>

              {/* LINHA 3 & 4 (Híbrida) */}
              <Link href="/admin/professores" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <UserPlus className="w-5 h-5 text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Cadastro de Professores</span>
              </Link>
              <Link href="/admin/certificados/config" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <Award className="w-5 h-5 text-indigo-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Configurar Certificados</span>
              </Link>
              <Link href="/admin/certificados/emissao" className="p-6 bg-surface border border-border-custom rounded-3xl hover:bg-black/[0.02] flex flex-col gap-3 group transition-all">
                 <Target className="w-5 h-5 text-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Emissão de Certificados</span>
              </Link>
           </div>
        </div>
      </section>

      {/* 🔵 BUSINESS INTELLIGENCE */}
      <section className="space-y-10 pt-10 border-t border-border-custom border-dashed">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
           <div className="border-l-4 border-indigo-600 pl-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2 block">Pilar Estratégico</span>
              <h2 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase underline decoration-indigo-500/20">Business Intelligence</h2>
           </div>

           <div className="flex flex-wrap items-center gap-4 bg-surface p-3 rounded-[2rem] border border-border-custom shadow-sm">
              <div className="flex bg-background p-1 rounded-xl border border-border-custom">
                 {[
                   { id: 'total', label: 'Tudo' },
                   { id: 'hoje', label: 'Hoje' },
                   { id: '7d', label: '7D' },
                   { id: '30d', label: '30D' },
                   { id: 'mes', label: 'Mês' }
                 ].map(p => (
                    <Link 
                      key={p.id} 
                      href={`/admin?periodo=${p.id}${cursoId ? `&cursoId=${cursoId}` : ''}${planoId ? `&planoId=${planoId}` : ''}`} 
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${periodo === p.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-text-muted hover:bg-black/5'}`}
                    >
                      {p.label}
                    </Link>
                 ))}
              </div>
              
               <AdminFilters 
                  periodo={periodo} 
                  cursoId={cursoId} 
                  cursosLista={cursosLista} 
               />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
                 <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-[80px]" />
                 <Banknote className="w-8 h-8 opacity-20 mb-10" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Receita no Período</p>
                 <h4 className="text-4xl font-black mt-2 tracking-tighter italic">R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                 <div className="mt-10 pt-10 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold opacity-60">Vendas</span>
                          <span className="text-2xl font-black underline decoration-indigo-400">{assinaturasPeriodo?.length || 0}</span>
                       </div>
                    </div>
                    <div className="flex flex-col text-right">
                       <span className="text-[10px] uppercase font-bold opacity-60">Ticket Médio</span>
                       <span className="text-2xl font-black">R$ {assinaturasPeriodo?.length ? Math.floor(totalFaturamento / assinaturasPeriodo.length).toLocaleString('pt-BR') : 0}</span>
                    </div>
                 </div>
              </div>

              <div className="bg-surface border border-border-custom rounded-[3rem] p-10 flex items-center gap-8 shadow-sm">
                 <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-600">
                    <Clock className="w-8 h-8" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Horas de Voo</p>
                    <p className="text-3xl font-black text-text-primary tracking-tighter">{totalHoras} <span className="text-sm font-black text-text-muted opacity-40 uppercase">Investidas</span></p>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface border border-border-custom rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-10">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest italic leading-none">Performance em Valor</h3>
                 </div>
                 <AnalyticsVisual 
                    data={[
                      { label: 'Individuais', value: fatCursos, color: 'bg-emerald-500 shadow-lg shadow-emerald-500/20' },
                      { label: 'VIP / Pacotes', value: fatPlanos, color: 'bg-indigo-600 shadow-lg shadow-indigo-600/20' }
                    ]} 
                    total={totalFaturamento}
                    format="currency"
                 />
              </div>

              <div className="bg-surface border border-border-custom rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-10">
                    <Users className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest italic leading-none">Volume de Matrículas</h3>
                 </div>
                 <AnalyticsVisual 
                    data={[
                      { label: 'Individuais', value: countCursos, color: 'bg-amber-500 shadow-lg shadow-amber-500/20' },
                      { label: 'Plano VIP', value: countPlanos, color: 'bg-indigo-400 shadow-lg shadow-indigo-400/20' }
                    ]} 
                    total={totalMatrículasPeriodo}
                    format="number"
                 />
              </div>

              <div className="bg-surface border border-border-custom rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-10">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest italic leading-none">Engajamento (Horas)</h3>
                 </div>
                 <AnalyticsVisual 
                    data={[
                      { label: 'Horas em Cursos', value: Math.floor(horasCursos/3600), color: 'bg-emerald-500 shadow-lg shadow-emerald-500/20' },
                      { label: 'Horas em Planos', value: Math.floor(horasPlanos/3600), color: 'bg-blue-600 shadow-lg shadow-blue-600/20' }
                    ]} 
                    total={totalHoras}
                    format="hours"
                 />
              </div>

              <div className="bg-surface border border-border-custom rounded-[3rem] p-10 shadow-sm relative overflow-hidden flex flex-col justify-between">
                 <div>
                    <div className="flex items-center gap-3 mb-10">
                       <Zap className="w-5 h-5 text-primary" />
                       <h3 className="text-sm font-black text-text-primary uppercase tracking-widest italic leading-none">Retenção de Alunos</h3>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Alunos c/ Progresso ≥ 0%</p>
                       <p className="text-5xl font-black text-text-primary tracking-tighter italic">{alunosAcimaThreshold}</p>
                       <p className="text-[10px] font-medium text-text-secondary">Estudantes ativos na plataforma no período selecionado.</p>
                    </div>
                 </div>
              </div>

               <div className="lg:col-span-2 bg-surface border border-border-custom rounded-[3rem] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-border-custom flex items-center justify-between bg-black/[0.01]">
                     <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <h2 className="font-ex-black text-text-primary uppercase tracking-widest text-[10px]">Fluxo de Matrículas em Tempo Real</h2>
                     </div>
                     <Link href="/admin/alunos" className="text-[10px] font-black text-primary hover:underline">Ver Todos</Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-border-custom">
                     {matriculasRecentes?.map((reg: any) => (
                       <div key={reg.id} className="p-6 flex items-center gap-4 hover:bg-black/[0.01] transition-all">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">{reg.usuarios?.full_name?.charAt(0)}</div>
                          <div>
                             <p className="text-xs font-bold text-text-primary leading-tight">{reg.usuarios?.full_name}</p>
                             <p className="text-[9px] text-text-muted font-bold mt-1 uppercase truncate max-w-[150px]">{reg.cursos?.titulo || 'Acesso VIP'}</p>
                             <p className="text-[8px] font-black text-primary mt-0.5">{new Date(reg.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
           </div>
        </div>
      </section>
    </div>
  )
}
