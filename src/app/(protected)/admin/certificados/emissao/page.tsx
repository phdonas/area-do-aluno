import { createAdminClient } from '@/lib/supabase/admin'
import { Award, Search, Calendar, Filter } from 'lucide-react'
import Link from 'next/link'
import EmissaoModulo from './EmissaoModulo'

export default async function EmisssaoCertificadoPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const supabase = createAdminClient()

  // 1. Buscar Cursos que possuem configuração de certificado
  const { data: configs } = await supabase
    .from('certificados_config')
    .select('id, curso_id, cursos(titulo)')

  // 2. Buscar Alunos
  const { data: alunos } = await supabase
    .from('usuarios')
    .select('id, full_name, email')
    .order('full_name')

  // 3. Buscar TODAS as emissões para construir o mapa de "quem já tem"
  const { data: todasEmissoes } = await supabase
    .from('certificados_emitidos')
    .select('usuario_id, curso_id')

  // 4. Buscar Histórico Recente (com filtro de busca opcional)
  let queryHist = supabase
    .from('certificados_emitidos')
    .select('*, usuarios(full_name), cursos(titulo)')
    .order('data_emissao', { ascending: false })

  if (q) {
    // Busca no histórico por nome do aluno
    queryHist = queryHist.ilike('usuarios.full_name', `%${q}%`)
  }

  const { data: emitidos } = await queryHist.limit(20)

  // Organizar mapa de emissões: curso_id -> [usuario_ids]
  const idsComCertificadoPorCurso: Record<string, string[]> = {}
  todasEmissoes?.forEach(em => {
    if (!idsComCertificadoPorCurso[em.curso_id]) {
      idsComCertificadoPorCurso[em.curso_id] = []
    }
    idsComCertificadoPorCurso[em.curso_id].push(em.usuario_id)
  })

  return (
    <div className="max-w-7xl mx-auto space-y-12 p-6 md:p-10">
      <header className="border-l-4 border-emerald-500 pl-6 animate-in slide-in-from-left duration-700">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2 block">Pilar Transacional / Secretaria</span>
        <h1 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase">Gestão de Emissão Manual</h1>
        <p className="text-text-secondary mt-2 font-medium max-w-2xl">
          Utilize esta ferramenta para atribuir certificados a alunos que concluíram requisitos presenciais ou fora do ecossistema digital.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* FORMULÁRIO DE EMISSÃO (CLIENT COMPONENT) */}
        <div className="lg:col-span-1">
          <EmissaoModulo 
            alunos={alunos || []} 
            configs={(configs as any) || []} 
            idsComCertificadoPorCurso={idsComCertificadoPorCurso}
          />
        </div>

        {/* HISTÓRICO RECENTE */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in duration-1000 delay-300">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted italic flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-500" /> Histórico de Emissões
              </h3>
              
              <form action="" className="relative">
                 <input 
                   type="text" 
                   name="q"
                   defaultValue={q}
                   placeholder="Filtrar histórico..." 
                   className="bg-surface border border-border-custom rounded-full px-10 py-2.5 text-[10px] font-bold focus:border-emerald-500 transition-all pr-4 outline-none w-full md:w-64" 
                 />
                 <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                 <button type="submit" className="hidden">Buscar</button>
              </form>
           </div>

           <div className="bg-surface border border-border-custom rounded-[3rem] overflow-hidden shadow-sm relative">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-custom bg-black/[0.02]">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Aluno Reconhecido</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Treinamento / Curso</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Autenticação</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom">
                    {(!emitidos || emitidos.length === 0) ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                           <div className="opacity-20 flex flex-col items-center">
                              <Award className="w-12 h-12 mb-4" />
                              <p className="text-xs font-black uppercase tracking-widest">Nenhuma emissão encontrada no histórico</p>
                           </div>
                        </td>
                      </tr>
                    ) : (
                      emitidos.map((emi) => (
                        <tr key={emi.id} className="hover:bg-black/[0.01] transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-sm group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                    {emi.usuarios?.full_name?.charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="text-xs font-black text-text-primary uppercase italic leading-none">{emi.usuarios?.full_name}</span>
                                   <span className="text-[9px] font-bold text-text-muted mt-1 opacity-50">{emi.usuarios?.email}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">{emi.cursos?.titulo}</span>
                                <span className="text-[8px] font-bold text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded-full w-fit mt-1 uppercase tracking-widest">Status: Emitido</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <code className="bg-background border border-border-custom px-3 py-1.5 rounded-lg text-[10px] font-black text-primary group-hover:border-primary transition-colors">{emi.codigo_verificacao}</code>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <span className="text-[10px] font-bold text-text-muted">
                                {new Date(emi.data_emissao).toLocaleDateString('pt-BR')}
                              </span>
                           </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {q && (
                <div className="p-4 bg-emerald-500/5 border-t border-border-custom flex justify-center">
                   <Link href="/admin/certificados/emissao" className="text-[10px] font-black uppercase text-emerald-600 hover:underline">Ver Histórico Completo</Link>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
