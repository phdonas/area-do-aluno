import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Video } from 'lucide-react'
import { formatDuration, cleanTitle } from '@/lib/formatter'
import { VideoPlayer } from '@/components/video-player'
import { InteractiveCTA } from '@/components/player/InteractiveCTA'
import { getPrefixosLimpeza } from '@/lib/prefixes'
import { FileCode } from 'lucide-react'

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

  // Buscar recurso e materiais para o preview
  const [{ data: recurso }, { data: materiais }] = await Promise.all([
    aula.recurso_id 
      ? supabaseAdmin.from('recursos').select('*').eq('id', aula.recurso_id).single()
      : Promise.resolve({ data: null }),
    supabaseAdmin.from('materiais_anexos').select('*').eq('aula_id', aulaId)
  ])

  const hasVideo = !!aula.video_url && aula.video_url.trim() !== '';

  const primaryCTA = aula.tipo_conteudo === 'questionario' && aula.questionario_id
    ? { url: `/questionarios/${aula.questionario_id}`, titulo: 'Avaliação da Aula', tipo: 'questionario' as const }
    : recurso 
      ? { url: recurso.arquivo_url || '', titulo: aula.titulo, tipo: 'ferramenta' as const }
      : (materiais && materiais.length > 0 && materiais.find((m: any) => m.tipo === 'link'))
        ? { url: materiais.find((m: any) => m.tipo === 'link').arquivo_url, titulo: aula.titulo, tipo: 'ferramenta' as const }
        : null;

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
        {hasVideo ? (
          <VideoPlayer url={aula.video_url} />
        ) : (
          <div className="aspect-video bg-[#0A0F1E] rounded-[48px] flex flex-col items-center justify-center text-center p-12 border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
              <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/10 mb-8 relative z-10">
                <FileCode className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter mb-4 relative z-10 italic uppercase">
                {primaryCTA ? "Pronto para Executar" : "Não há vídeo disponível para esta aula"}
              </h3>
              <p className="text-base text-white/60 font-medium max-w-md relative z-10 leading-relaxed px-4">
                {primaryCTA 
                  ? (primaryCTA.tipo === 'questionario' ? "Esta aula contém uma avaliação de conhecimento." : "Esta aula é um recurso interativo. Utilize o botão abaixo para abrir o simulador em uma nova aba.")
                  : "Consulte os materiais anexos ou o fluxo do curso para mais informações sobre este conteúdo."}
              </p>
          </div>
        )}

        {primaryCTA && (
          <InteractiveCTA 
            url={primaryCTA.url} 
            titulo={primaryCTA.titulo} 
            tipo={primaryCTA.tipo} 
          />
        )}

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
