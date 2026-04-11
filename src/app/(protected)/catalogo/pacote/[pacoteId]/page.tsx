import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PlayCircle, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default async function PacoteDetailsPage({
  params,
}: {
  params: Promise<{ pacoteId: string }>
}) {
  const { pacoteId } = await params
  const supabase = await createClient()

  // 1. Buscar o pacote (plano)
  const { data: pacote } = await supabase
    .from('planos')
    .select('*')
    .eq('id', pacoteId)
    .single()

  if (!pacote) {
    notFound()
  }

  // 2. Verificar acesso
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
     redirect('/login')
  }

  const { data: assinatura } = await supabase
    .from('assinaturas')
    .select('*')
    .eq('usuario_id', user.id)
    .eq('plano_id', pacoteId)
    .eq('status', 'ativa')
    .single()

  const hasAccess = !!assinatura

  // 3. Buscar cursos atrelados
  let cursos: any[] = []
  if (pacote.is_global) {
     const { data } = await supabase.from('cursos').select('*').eq('status', 'publicado')
     cursos = data || []
  } else {
     const { data } = await supabase
       .from('planos_cursos')
       .select('cursos(*)')
       .eq('plano_id', pacoteId)
     
     cursos = (data?.map(d => d.cursos) as any[]).filter((c: any) => c && c.status === 'publicado') || []
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Banner / Header */}
      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden group border border-border-custom bg-surface">
         <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 to-primary mix-blend-multiply z-10" />
         <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
               <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">
                  PACOTE DE CURSOS
               </span>
               {pacote.is_global && (
                  <span className="bg-emerald-500/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                     Acesso Global
                  </span>
               )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
               {pacote.nome}
            </h1>
            <p className="text-white/80 max-w-2xl text-sm md:text-base line-clamp-2">
               {pacote.descricao}
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold text-text-primary">Cursos Inclusos</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {cursos.map(curso => (
                  <Link href={`/catalogo/${curso.id}`} key={curso.id} className="group bg-surface border border-border-custom rounded-2xl overflow-hidden hover:shadow-md hover:border-primary transition-all flex flex-col">
                     <div className="aspect-video bg-gradient-to-br from-background to-surface border-b border-border-custom p-6 flex items-center justify-center relative">
                        {curso.thumb_url ? (
                           <img src={curso.thumb_url} alt={curso.titulo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                        ) : (
                           <PlayCircle className="w-10 h-10 text-text-muted/50" />
                        )}
                        <div className="absolute inset-0 z-10 bg-black/10 group-hover:bg-black/0 transition-colors" />
                     </div>
                     <div className="p-4 flex-1 flex gap-4">
                        <div className="flex-1">
                           <h3 className="font-bold text-text-primary text-sm line-clamp-2">{curso.titulo}</h3>
                        </div>
                     </div>
                  </Link>
               ))}
               {cursos.length === 0 && (
                  <p className="text-text-muted text-sm col-span-2 text-center py-10 bg-surface border border-border-custom rounded-2xl">
                     Nenhum curso atrelado a este pacote no momento.
                  </p>
               )}
            </div>
         </div>

         <div>
            <div className="bg-surface border border-border-custom rounded-3xl p-6 sticky top-24 shadow-sm">
               <h3 className="font-bold text-lg text-text-primary mb-2">Seu Acesso</h3>
               
               {hasAccess ? (
                  <div className="space-y-4 pt-2">
                     <div className="flex flex-col items-center justify-center text-center p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <ShieldCheck className="w-10 h-10 text-emerald-500 mb-2" />
                        <span className="text-sm font-bold text-emerald-700">Pacote Ativo</span>
                        <span className="text-xs text-emerald-600 mt-1">Você tem acesso total a todos os cursos deste pacote.</span>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-4 pt-2">
                     <p className="text-sm text-text-secondary">Você não possui acesso ativo a este pacote atualmente.</p>
                     <Link href="/dashboard" className="w-full py-3 px-4 bg-text-primary text-white font-medium rounded-xl hover:bg-black transition-all flex justify-center text-sm">
                        Voltar ao Menu
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}
