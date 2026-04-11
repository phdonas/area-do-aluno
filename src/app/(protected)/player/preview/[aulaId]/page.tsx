import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Video } from 'lucide-react'
import { formatDuration, cleanTitle } from '@/lib/formatter'
import { VideoPlayer } from '@/components/video-player'
import { getPrefixosLimpeza } from '@/lib/prefixes'

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ aulaId: string }>
}) {
  const { aulaId } = await params
  
  // Usamos o Admin Client apenas para buscar a aula, ignorando RLS
  const supabaseAdmin = createAdminClient()
  const supabaseAuth = await createClient()
  
  const prefixes = await getPrefixosLimpeza()

  // Verificamos se há um usuário logado
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login')

  // Buscamos a aula com o Admin Client para evitar 404 por conta de RLS
  const { data: aula, error: aulaError } = await supabaseAdmin
    .from('aulas')
    .select('*')
    .eq('id', aulaId)
    .single()

  if (aulaError || !aula) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="p-5 bg-surface/50 border-b border-border-custom flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <Link href="/admin/aulas" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> VOLTAR AO PAINEL
        </Link>
        
        <h2 className="hidden md:block text-xs font-black uppercase tracking-widest text-text-primary truncate max-w-sm">
          {cleanTitle(aula.titulo, prefixes)}
        </h2>

        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-500/20">
            MODO PREVIEW
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-10 space-y-10">
        <VideoPlayer url={aula.video_url} />

        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none">{cleanTitle(aula.titulo, prefixes)}</h1>
            <p className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" /> {formatDuration(aula.duracao_segundos)} • Preview Administrativo
            </p>
          </div>

          {aula.descricao && (
            <div className="bg-surface border border-border-custom p-10 rounded-[40px] text-text-secondary font-medium leading-relaxed shadow-sm prose prose-zinc dark:prose-invert max-w-none">
              {aula.descricao}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
