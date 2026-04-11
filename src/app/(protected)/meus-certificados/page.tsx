import { createClient } from '@/lib/supabase/server'
import { Award, ShieldCheck, Download, ExternalLink, Sparkles, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function MeusCertificadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Buscar emissões do aluno
  const { data: certificados, error } = await supabase
    .from('certificados_emitidos')
    .select(`
      id,
      data_emissao,
      codigo_verificacao,
      cursos (
        id,
        titulo,
        thumb_url
      )
    `)
    .eq('usuario_id', user.id)
    .order('data_emissao', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      
      {/* HEADER ESTRATÉGICO */}
      <header className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-12 text-white border border-white/5 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Reconhecimento Oficial</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Suas <span className="text-emerald-400">Conquistas</span>
            </h1>
            <p className="text-slate-400 mt-4 text-lg font-medium">
              Gerencie e compartilhe suas certificações emitidas pela PH Academy.
            </p>
          </div>
          <div className="hidden lg:block">
             <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl">
                <ShieldCheck className="w-16 h-16 text-white" />
             </div>
          </div>
        </div>
      </header>

      {/* GRID DE CERTIFICADOS */}
      {(!certificados || certificados.length === 0) ? (
        <div className="bg-surface border border-border-custom border-dashed rounded-[3rem] p-24 text-center space-y-6">
           <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-text-muted/20" />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-text-primary">Nenhum certificado ainda</h3>
              <p className="text-text-muted max-w-sm mx-auto font-medium">Conclua seus cursos para desbloquear suas certificações oficiais e acelerar sua jornada.</p>
           </div>
           <Link href="/catalogo" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
              Ir para o Catálogo <ExternalLink className="w-4 h-4" />
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {certificados.map((cert: any) => (
             <div key={cert.id} className="group bg-surface border border-border-custom rounded-[3rem] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:border-emerald-500/30">
                <div className="aspect-[1.414/1] relative overflow-hidden bg-black/5 p-4">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                   {cert.cursos?.thumb_url ? (
                     <img src={cert.cursos.thumb_url} className="w-full h-full object-cover rounded-2xl opacity-80 group-hover:scale-105 transition-transform duration-700" alt={cert.cursos?.titulo} />
                   ) : (
                     <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                        <Award className="w-12 h-12 text-white/10" />
                     </div>
                   )}
                   
                   <div className="absolute bottom-6 left-6 right-6 z-20">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Emitido em {format(new Date(cert.data_emissao), 'MMMM yyyy', { locale: ptBR })}
                      </p>
                      <h3 className="text-xl font-black text-white leading-tight line-clamp-2">{cert.cursos?.titulo}</h3>
                   </div>
                </div>

                <div className="p-8 space-y-6">
                   <div className="flex items-center justify-between py-4 border-b border-border-custom border-dashed">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Autenticação</span>
                      <span className="text-[10px] font-mono font-bold text-text-primary">{cert.codigo_verificacao}</span>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <Link 
                        href={`/meus-certificados/${cert.id}`}
                        className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all"
                      >
                         <Download className="w-3.5 h-3.5" /> Ver PDF
                      </Link>
                      <Link 
                        href={`/verificar-certificado/${cert.codigo_verificacao}`}
                        className="flex items-center justify-center gap-2 py-4 bg-surface border border-border-custom text-text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/5 transition-all"
                      >
                         <ShieldCheck className="w-3.5 h-3.5" /> Verificar
                      </Link>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* RODAPÉ INFORMATIVO */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
         <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck className="w-8 h-8 text-white" />
         </div>
         <div className="space-y-1">
            <h4 className="text-lg font-black text-text-primary tracking-tight">Certificação Vitalícia e Verificável</h4>
            <p className="text-sm text-text-muted font-medium">Todos os certificados emitidos pela PH Academy possuem um código QR e uma hash de verificação única, garantindo sua validade em qualquer processo seletivo ou auditoria.</p>
         </div>
      </div>

    </div>
  )
}
