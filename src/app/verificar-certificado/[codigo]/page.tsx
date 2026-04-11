import { createAdminClient } from '@/lib/supabase/admin'
import { Award, ShieldCheck, XCircle, Calendar, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default async function VerificarCertificadoPage({ 
  params 
}: { 
  params: Promise<{ codigo: string }> 
}) {
  const { codigo } = await params
  const supabase = createAdminClient()

  // Buscar emissão
  const { data: cert, error } = await supabase
    .from('certificados_emitidos')
    .select('*, usuarios(full_name), cursos(titulo)')
    .eq('codigo_verificacao', codigo.toUpperCase())
    .single()

  const isValid = !!cert && !error

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)]">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in zoom-in-95 duration-700">
         
         <div className="text-center space-y-2">
            <h1 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500">Portal de Autenticidade</h1>
            <p className="text-3xl font-black tracking-tighter italic uppercase">PH Academy Verifier</p>
         </div>

         <div className={`bg-white/5 border ${isValid ? 'border-emerald-500/30' : 'border-red-500/30'} backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden`}>
            
            {/* Efeito Visual de Fundo */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${isValid ? 'bg-emerald-500/10' : 'bg-red-500/10'} rounded-full blur-3xl`} />

            {isValid ? (
              <>
                <div className="flex flex-col items-center text-center space-y-4">
                   <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <ShieldCheck className="w-10 h-10 text-white" />
                   </div>
                   <div className="space-y-1">
                      <h2 className="text-2xl font-black text-emerald-500 uppercase italic tracking-tight">Certificado Válido</h2>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Documento ID: {codigo}</p>
                   </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-white/5">
                   <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <GraduationCap className="w-5 h-5 text-indigo-400" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-indigo-400">Aluno(a)</p>
                         <p className="text-sm font-bold">{cert.usuarios?.full_name}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <Award className="w-5 h-5 text-amber-400" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-amber-400">Certificado</p>
                         <p className="text-sm font-bold">{cert.cursos?.titulo}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-blue-400">Data de Emissão</p>
                         <p className="text-sm font-bold">{new Date(cert.data_emissao).toLocaleDateString('pt-BR')}</p>
                      </div>
                   </div>
                </div>

                <p className="text-[9px] text-center text-white/40 font-medium leading-relaxed">
                  Este documento foi processado eletronicamente e possui validade jurídica institucional como comprovante de conclusão de carga horária.
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center text-center space-y-6">
                 <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                    <XCircle className="w-10 h-10 text-white" />
                 </div>
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black text-red-500 uppercase italic tracking-tight">Código Inválido</h2>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Nenhum certificado encontrado para "{codigo}"</p>
                 </div>
                 <p className="text-xs text-white/40 font-medium">
                   Verifique se o código foi digitado corretamente ou entre em contato com o suporte acadêmico.
                 </p>
                 <Link href="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase transition-all">
                    Voltar ao Portal
                 </Link>
              </div>
            )}
         </div>

         <footer className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">© 2026 PH Academy Digital Trust Network</p>
         </footer>
      </div>
    </div>
  )
}
