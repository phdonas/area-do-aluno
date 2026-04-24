import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, Layers, MonitorPlay, Component, ShieldAlert, ArrowRight, 
  FileQuestion, Package, Wrench, Users, Eraser, Activity, TrendingUp, AlertTriangle, Clock, 
  BarChart3, Banknote, History, GraduationCap, ChevronRight, Eye, Play, Search, UserPlus,
  CalendarDays, Filter, ChevronDown, Target, Send, Tag, ShieldCheck, Zap, Award, Settings,
  Columns3, MailCheck, History as HistoryIcon, Ticket, DollarSign
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
    { count: matriculasPendentesCount },
    { data: activeStudentsData },
    { data: cursosLista }, 
    { data: aulasSemVideo },
    { data: matriculasRecentes },
    { data: assinaturasPeriodo },
    { data: progressoConcluido },
    { data: todasAulas },
    { count: pilaresCount },
    { count: recursosCount }
  ] = await Promise.all([
    supabaseAdmin.from('cursos').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('modulos').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('aulas').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('questionarios').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('assinaturas').select('*', { count: 'exact', head: true }).in('status', ['ativa', 'ativo', 'Ativa', 'Ativo']),
    supabaseAdmin.from('assinaturas').select('*', { count: 'exact', head: true }).in('status', ['pendente', 'Pendente']),
    supabaseAdmin.from('assinaturas').select('usuario_id').in('status', ['ativa', 'ativo', 'Ativa', 'Ativo']),
    supabaseAdmin.from('cursos').select('id, titulo'),
    supabaseAdmin.from('aulas').select('id').is('video_url', null),
    supabaseAdmin.from('assinaturas')
      .select(`id, created_at, usuarios (full_name), cursos (titulo)`)
      .order('created_at', { ascending: false }).limit(6),
    
    (() => {
      let q = supabaseAdmin.from('assinaturas')
        .select('id, created_at, curso_id, plano_id, status, valor_pago, moeda, cursos(preco), planos(preco_mensal, preco_anual)')
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

    supabaseAdmin.from('aulas').select('id, titulo, modulo_id, modulos(curso_id)'),
    supabaseAdmin.from('pilares').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('recursos').select('*', { count: 'exact', head: true })
  ])

  const uniqueStudentsSet = new Set((activeStudentsData || []).map(a => a.usuario_id))
  const totalAlunosAtivos = uniqueStudentsSet.size || 0

  // 3. Processamento de Faturamento Global (Híbrido)
  let fatBRL = 0
  let fatEUR = 0
  let fatCursos = 0
  let fatPlanos = 0
  let countCursos = 0
  let countPlanos = 0
  
  const assinaturasParaProcessar = assinaturasPeriodo || []
  
  assinaturasParaProcessar.forEach((ass: any) => {
     const valor = Number(ass.valor_pago || 0)
     
     // Separação por Moeda
     if (ass.moeda === 'EUR') {
       fatEUR += valor
     } else {
       fatBRL += valor
     }

     // Separação por Categoria (Cursos vs Planos)
     if (ass.curso_id) {
       fatCursos += valor
       countCursos++
     } else if (ass.plano_id) {
       fatPlanos += valor
       countPlanos++
     }
  })
  
  // Taxa de conversão fictícia apenas para o card de resumo principal
  const totalFaturamento = fatBRL + (fatEUR * 6) 
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

  const sections = [
    {
      title: 'Aulas e Cursos',
      description: 'Gestão de conteúdo e estrutura acadêmica',
      color: 'border-indigo-500/20',
      items: [
        { label: 'Aulas Globais', count: aulasCount, href: '/admin/aulas', icon: MonitorPlay, color: 'bg-indigo-600/50' },
        { label: 'Ementas & Módulos', count: modulosCount, href: '/admin/modulos', icon: Columns3, color: 'bg-blue-600/50' },
        { label: 'Cursos', count: cursosCount, href: '/admin/cursos', icon: BookOpen, color: 'bg-sky-600/50' },
        { label: 'Pilares', count: pilaresCount, href: '/admin/pilares', icon: Layers, color: 'bg-cyan-600/50' },
      ]
    },
    {
      title: 'Materiais e Ferramentas',
      description: 'Recursos interativos e organização',
      color: 'border-emerald-500/20',
      items: [
        { label: 'Recursos & Ferramentas', count: recursosCount, href: '/admin/recursos', icon: Wrench, color: 'bg-emerald-600/50' },
        { label: 'Questionários', count: questCount, href: '/admin/questionarios', icon: FileQuestion, color: 'bg-teal-600/50' },
        { label: 'Limpeza de Nomes', href: '/admin/configuracoes/prefixos', icon: Eraser, color: 'bg-slate-600/50' },
      ]
    },
    {
      title: 'Gestão de Alunos',
      description: 'Controle de acesso e consulta de progresso',
      color: 'border-amber-500/20',
      items: [
        { label: 'Alunos / Matrículas', count: totalAlunosAtivos, href: '/admin/alunos', icon: Users, color: 'bg-amber-600/50' },
        { label: 'Matrículas Pendentes', count: matriculasPendentesCount, href: '/admin/matriculas', icon: Clock, color: 'bg-orange-600/50' },
        { label: 'Gestão de Convites', href: '/admin/convites', icon: MailCheck, color: 'bg-yellow-600/50' },
        { label: 'Consulta por Curso', href: '/admin/alunos/consulta', icon: Search, color: 'bg-yellow-500/40', description: 'Novo: Filtros Avançados' },
      ]
    },
    {
      title: 'Promoções',
      description: 'Estratégias de vendas e precificação',
      color: 'border-rose-500/20',
      items: [
        { label: 'Cupons & Promo', href: '/admin/cupons', icon: Ticket, color: 'bg-rose-600/50' },
        { label: 'Gestão de Planos & Preços', href: '/admin/planos', icon: DollarSign, color: 'bg-pink-600/50' },
        { label: 'Configuração de Checkout', href: '/admin/configuracoes/checkout', icon: MonitorPlay, color: 'bg-red-600/50' },
      ]
    },
    {
      title: 'Certificados',
      description: 'Emissão e personalização de diplomas',
      color: 'border-purple-500/20',
      items: [
        { label: 'Configurar Certificados', href: '/admin/certificados/config', icon: Award, color: 'bg-purple-600/50' },
        { label: 'Emissão de Certificados', href: '/admin/certificados/emissao', icon: Target, color: 'bg-violet-600/50' },
      ]
    },
    {
      title: 'Gestão de Pessoas',
      description: 'Administração de equipe e professores',
      color: 'border-blue-500/20',
      items: [
        { label: 'Cadastro de Professores', href: '/admin/professores', icon: UserPlus, color: 'bg-blue-600/50' },
        { label: 'Gestão de Equipe', href: '/admin/usuarios', icon: ShieldCheck, color: 'bg-indigo-600/50' },
        { label: 'Auditoria & Logs', href: '/admin/auditoria', icon: HistoryIcon, color: 'bg-slate-600/50' },
      ]
    },
    {
      title: 'Financeiro',
      description: 'Visibilidade de faturamento e moedas',
      color: 'border-teal-500/20',
      items: [
        { label: 'Dashboard Financeiro', href: '/admin/financeiro', icon: Banknote, color: 'bg-teal-600/55' },
      ]
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20 animate-in fade-in duration-1000">
      
      {/* 🔴 CABEÇALHO DO DASHBOARD */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div className="border-l-4 border-primary pl-6">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2 block">Painel Administrativo</span>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter italic uppercase">Gestão da Academia</h1>
          <p className="text-text-secondary mt-2 font-medium">Controle total sobre o ecossistema PHD.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/admin/cursos/novo" className="px-6 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95">
              <GraduationCap className="w-5 h-5" /> Novo Curso
           </Link>
        </div>
      </header>

      {/* 🟠 SEÇÕES DE GESTÃO */}
      <div className="space-y-20">
        {sections.map((section, sIdx) => (
          <section key={sIdx} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${sIdx * 100}ms` }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-custom pb-4 mx-4 md:mx-0">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">{section.title}</h3>
                <p className="text-[13px] text-text-muted font-bold uppercase tracking-widest">{section.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
              {section.items.map((item, iIdx) => (
                <Link 
                  key={iIdx} 
                  href={item.href} 
                  className={`p-6 ${item.color} rounded-[2.5rem] border border-white/10 hover:scale-[1.03] active:scale-95 transition-all group flex flex-col justify-between h-44 shadow-2xl backdrop-blur-xl relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl" />
                  
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform relative z-10 border border-white/10">
                     <item.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[16px] font-black uppercase tracking-[0.2em] text-white brightness-200 block">{item.label}</span>
                        {'description' in item && <p className="text-[14px] text-white font-bold uppercase leading-tight mt-1">{item.description}</p>}
                      </div>
                      {item.count !== undefined && (
                        <span className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 🔵 BUSINESS INTELLIGENCE */}
      <section className="space-y-10 pt-20 border-t-2 border-border-custom border-dashed">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-4 md:px-0">
           <div className="border-l-4 border-indigo-600 pl-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2 block">Pilar Estratégico</span>
              <h2 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase underline decoration-indigo-500/20">Business Intelligence</h2>
           </div>

           <div className="flex flex-wrap items-center gap-4 bg-surface p-3 rounded-[2rem] border border-border-custom shadow-sm">
              <div className="flex bg-background p-1 rounded-xl border border-border-custom overflow-x-auto">
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
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${periodo === p.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-text-muted hover:bg-black/5'}`}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
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
