import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ChevronLeft, GraduationCap, Package, Tag, PlusCircle, 
  User, Mail, Phone, Hash, ShieldCheck, ShieldAlert, Trash2, AlertTriangle, MapPin,
  Globe, Fingerprint, MessageSquare, Info, Filter
} from 'lucide-react'
import { createMatricula, deleteMatricula, adminUpdateUsuario, adminToggleStatus, adminDeleteUsuario } from '../actions'
import { DeleteMatriculaButton } from './DeleteMatriculaButton'
import { formatDate } from '@/lib/formatter'

export default async function EditarAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabaseAdmin = createAdminClient()

  const { data: aluno } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()

  if (!aluno) notFound()

  // Buscar matrículas
  const { data: assinaturas } = await supabaseAdmin
    .from('assinaturas')
    .select('*, planos(*), cursos(*)')
    .eq('usuario_id', id)
    .order('data_inicio', { ascending: false })

  const { data: pacotes_abertos } = await supabaseAdmin.from('planos').select('*').eq('ativo', true)
  const { data: cursos_abertos } = await supabaseAdmin.from('cursos').select('*').eq('status', 'publicado')

  const pacotes_adquiridos_ids = assinaturas?.map(a => a.plano_id).filter(Boolean) || []
  const cursos_adquiridos_ids = assinaturas?.map(a => a.curso_id).filter(Boolean) || []
  
  const pacotes_disponiveis = pacotes_abertos?.filter(p => !pacotes_adquiridos_ids.includes(p.id)) || []
  const cursos_disponiveis = cursos_abertos?.filter(c => !cursos_adquiridos_ids.includes(c.id)) || []
  const temOpcoesDisponiveis = pacotes_disponiveis.length > 0 || cursos_disponiveis.length > 0
  
  const isAtivo = aluno.status === 'ativo'
  const isPortugal = aluno.pais === 'Portugal' || aluno.pais === 'PT' || aluno.pais?.includes('Por')

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* 1. TOP NAVIGATION & GLOBAL STATUS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
           <Link 
            href="/admin/alunos" 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-all underline underline-offset-4 decoration-primary/20"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Gestão de Alunos
          </Link>
          <div className="flex items-center gap-4">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${isAtivo ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                <GraduationCap className="w-7 h-7" />
             </div>
             <div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase">{aluno.nome || aluno.full_name}</h1>
                <div className="flex items-center gap-3 mt-1">
                   {aluno.senha_temporaria && (
                     <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 text-[8px] font-black rounded-full border border-amber-500/20 shadow-sm animate-pulse">
                        <ShieldAlert className="w-2.5 h-2.5" /> ATIVAÇÃO PENDENTE
                     </span>
                   )}
                   <span className={`px-2.5 py-1 text-[8px] font-black rounded-full border ${isAtivo ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                      {isAtivo ? 'USUÁRIO ATIVO' : 'CADASTRO INATIVO'}
                   </span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <form action={adminToggleStatus.bind(null, aluno.id, aluno.status || 'ativo')}>
              <button 
                type="submit"
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isAtivo ? 'bg-surface text-rose-500 border border-border-custom hover:bg-rose-50 shadow-sm' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'}`}
              >
                 {isAtivo ? <><ShieldAlert className="w-4 h-4" /> Inativar Aluno</> : <><ShieldCheck className="w-4 h-4" /> Ativar Aluno</>}
              </button>
           </form>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* 2. COLUNA PERFIL MASTER */}
        <div className="xl:col-span-8 space-y-10">
           <form action={async (formData) => {
             'use server'
             await adminUpdateUsuario(aluno.id, formData)
           }}>
             <div className="bg-surface border border-border-custom rounded-[48px] overflow-hidden shadow-2xl shadow-black/5">
                {/* Header do Card */}
                <div className="p-10 border-b border-border-custom bg-background/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                         <User className="w-6 h-6" />
                      </div>
                      <div>
                         <h2 className="text-xl font-black text-text-primary italic tracking-tight uppercase">Dossiê do Aluno</h2>
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Última atualização: {new Date().toLocaleDateString()}</p>
                      </div>
                   </div>
                   <button type="submit" className="px-10 py-5 bg-text-primary text-background rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-95">
                      Salvar Alterações
                   </button>
                </div>

                {/* Grid Interno do Card */}
                <div className="p-10 space-y-12">
                   {/* Seção 1: Identidade */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div className="space-y-2 group">
                         <label className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity pl-1">
                            <Hash className="w-3 h-3" /> Nome Completo
                         </label>
                         <input name="nome" defaultValue={aluno.nome || aluno.full_name} className="w-full bg-background/50 border-2 border-border-custom rounded-2xl px-6 py-4 text-text-primary font-bold focus:border-primary transition-all" />
                      </div>
                      <div className="space-y-2 group">
                         <label className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity pl-1">
                            <Mail className="w-3 h-3" /> E-mail Principal (Acesso)
                         </label>
                         <input name="email" defaultValue={aluno.email} className="w-full bg-background/50 border-2 border-border-custom rounded-2xl px-6 py-4 text-text-primary font-bold focus:border-primary transition-all italic text-primary" />
                      </div>
                      <div className="space-y-2 group">
                         <label className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity pl-1">
                            <MessageSquare className="w-3 h-3" /> WhatsApp / Telegram
                         </label>
                         <input name="whatsapp" defaultValue={aluno.whatsapp || aluno.telefone} className="w-full bg-background/50 border-2 border-border-custom rounded-2xl px-6 py-4 text-text-primary font-bold focus:border-primary transition-all" />
                      </div>
                      <div className="space-y-2 group">
                         <label className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity pl-1">
                            <Fingerprint className="w-3 h-3" /> Documento (CPF / NIF)
                         </label>
                         <input name="nif" defaultValue={aluno.nif || aluno.cpf} className="w-full bg-background/50 border-2 border-border-custom rounded-2xl px-6 py-4 text-text-primary font-bold focus:border-primary transition-all" />
                      </div>
                   </div>

                   {/* Seção 2: Localização (Onde os Dados Estavam Diferentes) */}
                   <div className="pt-8 border-t border-border-custom space-y-8">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-5 bg-primary rounded-full" />
                         <p className="text-[10px] font-black text-text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" /> Regional e Endereço
                         </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-background/10 rounded-3xl border border-dashed border-border-custom">
                         <div className="space-y-2">
                            <label className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">País Sede</label>
                            <select name="pais" defaultValue={aluno.pais || 'Brasil'} className="w-full bg-surface border-2 border-border-custom rounded-xl px-4 py-3 text-xs font-black text-indigo-600 outline-none">
                               <option value="Brasil">Brasil 🇧🇷</option>
                               <option value="Portugal">Portugal 🇵🇹</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">C.E.P. / Cód. Postal</label>
                            <input name="cep" defaultValue={aluno.cep} className="w-full bg-surface border-2 border-border-custom rounded-xl px-4 py-3 text-xs font-bold text-text-primary outline-none" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">Bairro / Freguesia</label>
                            <input name="bairro" defaultValue={aluno.bairro} className="w-full bg-surface border-2 border-border-custom rounded-xl px-4 py-3 text-xs font-bold text-text-primary outline-none" />
                         </div>
                         <div className="md:col-span-2 space-y-2">
                            <label className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">Endereço (Rua e Número)</label>
                            <div className="flex gap-2">
                               <input name="rua" defaultValue={aluno.rua} className="flex-1 bg-surface border-2 border-border-custom rounded-xl px-4 py-3 text-xs font-bold text-text-primary outline-none" />
                               <input name="numero" defaultValue={aluno.numero} placeholder="Nº" className="w-20 bg-surface border-2 border-border-custom rounded-xl px-4 py-3 text-xs font-bold text-text-primary outline-none" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">Cidade / Distrito</label>
                            <input name="cidade" defaultValue={aluno.cidade} className="w-full bg-surface border-2 border-border-custom rounded-xl px-4 py-3 text-xs font-bold text-text-primary outline-none" />
                         </div>
                      </div>
                   </div>

                   {/* Seção 3: Metadados */}
                   <div className="pt-8 border-t border-border-custom grid grid-cols-1 md:grid-cols-3 gap-12">
                      <div className="space-y-2">
                         <label className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">
                            <Filter className="w-3 h-3" /> Origem / Funil
                         </label>
                         <input name="origem" defaultValue={aluno.origem} className="w-full bg-background/50 border border-border-custom rounded-xl px-5 py-3 text-sm font-black text-primary uppercase" />
                      </div>
                      <div className="space-y-2">
                         <label className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">
                            <Info className="w-3 h-3" /> Contato Preferencial
                         </label>
                         <input name="contato_preferencial" defaultValue={aluno.contato_preferencial} className="w-full bg-background/50 border border-border-custom rounded-xl px-5 py-3 text-sm font-black text-text-primary uppercase" />
                      </div>
                      <div className="flex items-end">
                         <div className="w-full p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-3">
                            <Globe className="w-4 h-4 text-indigo-600" />
                            <p className="text-[8px] font-bold text-indigo-900 leading-tight uppercase tracking-widest">Moeda sugerida: {isPortugal ? 'EURO (€)' : 'REAL (R$)'}</p>
                         </div>
                      </div>
                   </div>
                </div>
                
                <input type="hidden" name="status" value={aluno.status || 'ativo'} />
             </div>
           </form>

           {/* LISTA DE MATRÍCULAS - UPGRADED VISUAL */}
           <div className="bg-surface border border-border-custom rounded-[48px] overflow-hidden shadow-2xl shadow-black/5">
              <div className="p-10 border-b border-border-custom bg-background/20 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                       <Package className="w-6 h-6" />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-text-primary italic tracking-tight uppercase">Acessos à Plataforma</h2>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Cursos e Combos Ativos</p>
                    </div>
                 </div>
              </div>

              {(!assinaturas || assinaturas.length === 0) ? (
                <div className="p-24 text-center">
                   <p className="text-xs font-black text-text-muted uppercase tracking-widest opacity-20">Nenhum treinamento vinculado a este aluno.</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assinaturas.map((ass: any) => (
                      <div key={ass.id} className="p-8 bg-background border border-border-custom rounded-[32px] group hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between mb-6">
                           <span className={`px-2.5 py-1 text-[7px] font-black rounded-full border ${ass.planos ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                              {ass.planos ? 'BUNDLE' : 'CURSO'}
                           </span>
                           <form action={deleteMatricula.bind(null, ass.id, aluno.id)}>
                              <DeleteMatriculaButton />
                           </form>
                        </div>
                        <h4 className="text-2xl font-black text-text-primary tracking-tighter italic mb-4 group-hover:text-primary transition-colors">
                           {ass.planos?.nome || ass.cursos?.titulo}
                        </h4>
                        <div className="flex items-center justify-between pt-6 border-t border-border-custom border-dashed">
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Expira em</p>
                              <p className="text-xs font-bold text-text-primary">{formatDate(ass.data_vencimento)}</p>
                           </div>
                           <span className="px-3 py-1 bg-white border border-border-custom text-[8px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                              {ass.status}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* 3. COLUNA AÇÕES RÁPIDAS */}
        <div className="xl:col-span-4 space-y-10">
           {/* MATRÍCULA DIRETA */}
           <div className="bg-primary text-white p-10 rounded-[48px] shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                 <PlusCircle className="w-56 h-56" />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter mb-4">Matrícula Direta</h3>
              <p className="text-white/60 text-xs font-bold mb-10 leading-relaxed uppercase tracking-widest">Libere acesso a novos treinamentos instantaneamente.</p>
              
              <form action={createMatricula} className="space-y-6 relative z-10">
                 <input type="hidden" name="usuario_id" value={aluno.id} />
                 <select 
                   name="target_id" 
                   required
                   className="w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-2xl px-6 py-5 text-white font-black text-sm outline-none transition-all appearance-none cursor-pointer"
                 >
                    <option value="" className="text-black">Selecionar Treinamento...</option>
                    {pacotes_disponiveis.map(p => (
                      <option key={`plano_${p.id}`} value={`plano_${p.id}`} className="text-black">📦 {p.nome}</option>
                    ))}
                    {cursos_disponiveis.map(c => (
                      <option key={`curso_${c.id}`} value={`curso_${c.id}`} className="text-black">🎓 {c.titulo}</option>
                    ))}
                 </select>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="date" name="data_inicio" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-4 py-4 text-white font-bold text-[10px] outline-none" />
                    <select name="duracao" defaultValue="anual" className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-4 py-4 text-white font-bold text-[10px] outline-none">
                       <option value="anual" className="text-black">1 Ano</option>
                       <option value="semestral" className="text-black">6 Meses</option>
                       <option value="vitalicio" className="text-black">Vitalício</option>
                    </select>
                 </div>
                 <button type="submit" disabled={!temOpcoesDisponiveis} className="w-full py-6 bg-white text-primary rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30">
                    <PlusCircle className="w-5 h-5" /> Ativar Acesso
                 </button>
              </form>
           </div>

           {/* ZONA DE RISCO */}
           <div className="bg-surface border border-red-500/10 rounded-[40px] p-10 relative overflow-hidden">
              <div className="flex items-center gap-3 text-red-600 mb-6">
                 <AlertTriangle className="w-5 h-5" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic">Risk Zone</h3>
              </div>
              <p className="text-[10px] font-bold text-red-900/60 leading-relaxed mb-8 uppercase tracking-widest">A exclusão de dados é permanente e removerá todos os acessos do aluno.</p>
              <form action={adminDeleteUsuario.bind(null, aluno.id)}>
                 <button type="submit" disabled={!!(assinaturas && assinaturas.length > 0)} className="w-full py-5 border-2 border-red-500/20 text-red-600 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-3">
                    <Trash2 className="w-4 h-4" /> Deletar Definitivamente
                 </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  )
}
