'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth-check'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { parseDurationToSeconds } from '@/lib/formatter'

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export async function createAula(formData: FormData) {
  await ensureAdmin()
  const supabase = await createClient()

  const titulo = formData.get('titulo') as string
  let slug = formData.get('slug') as string
  if (!slug || slug.trim() === '') {
    slug = slugify(titulo)
  }
  const descricao = formData.get('descricao') as string
  const video_url = formData.get('video_url') as string
  const duracao_raw = formData.get('duracao') as string || '00:00:00'
  const tipo_conteudo = (formData.get('tipo_conteudo') as string) || 'video'
  
  let duracao_segundos = parseDurationToSeconds(duracao_raw)
  
  // Se não for vídeo, preencher com o default 00:00:01 se estiver zerado
  if (tipo_conteudo !== 'video' && duracao_segundos === 0) {
    duracao_segundos = 1
  }

  const ordem = parseInt(formData.get('ordem') as string || '0')
  const modulo_id_raw = formData.get('modulo_id') as string
  const curso_return = formData.get('curso_return') as string

  // Módulo ID = null indica aula da biblioteca global
  const modulo_id = (modulo_id_raw && modulo_id_raw !== 'null' && modulo_id_raw !== '') ? modulo_id_raw : null
  let questionario_id = formData.get('questionario_id') as string | null
  if (questionario_id === 'null' || !questionario_id) questionario_id = null

  let recurso_id = formData.get('recurso_id') as string | null
  if (recurso_id === 'null' || !recurso_id) recurso_id = null

  const liberacao_dias = parseInt(formData.get('liberacao_dias') as string || '0')

  const { data: aula, error } = await supabase.from('aulas').insert({
    titulo,
    slug: slug || null,
    descricao,
    video_url,
    duracao_segundos,
    ordem,
    modulo_id,
    tipo_conteudo,
    questionario_id,
    recurso_id,
    liberacao_dias
  }).select('id').single()

  if (error || !aula) {
    console.error('Erro ao criar aula', error)
    throw new Error('Falha ao criar aula')
  }

  // Handle links
  const links = formData.getAll('link_json') as string[]
  for (const linkJson of links) {
    try {
      const { titulo, url } = JSON.parse(linkJson)
      await supabase.from('materiais_anexos').insert({
        aula_id: aula.id,
        titulo,
        arquivo_url: url,
        tipo: 'link'
      })
    } catch(e) {}
  }

  // Handle files
  const arquivos = formData.getAll('arquivos') as File[]
  for (const arquivo of arquivos) {
    if (arquivo && arquivo.name && arquivo.size > 0) {
      const fileExt = arquivo.name.split('.').pop()
      const fileName = `${aula.id}/${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('aulas-arquivos')
        .upload(fileName, arquivo)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('aulas-arquivos')
          .getPublicUrl(fileName)

        await supabase.from('materiais_anexos').insert({
          aula_id: aula.id,
          titulo: arquivo.name,
          arquivo_url: publicUrl,
          tipo: 'arquivo'
        })
      } else {
        console.error('Failed to upload file', uploadError)
      }
    }
  }

  if (curso_return) {
    revalidatePath(`/admin/cursos/${curso_return}`)
    redirect(`/admin/cursos/${curso_return}`)
  } else {
    revalidatePath('/admin/aulas')
    redirect('/admin/aulas')
  }
}

export async function updateAula(id: string, formData: FormData) {
  await ensureAdmin()
  const supabase = await createClient()

  const titulo = formData.get('titulo') as string
  let slug = formData.get('slug') as string
  if (!slug || slug.trim() === '') {
    slug = slugify(titulo)
  }
  const descricao = formData.get('descricao') as string
  const video_url = formData.get('video_url') as string
  const duracao_raw = formData.get('duracao') as string || '00:00:00'
  const tipo_conteudo = formData.get('tipo_conteudo') as string || 'video'
  
  let duracao_segundos = parseDurationToSeconds(duracao_raw)
  
  // Se não for vídeo, preencher com o default 00:00:01 se estiver zerado
  if (tipo_conteudo !== 'video' && duracao_segundos === 0) {
    duracao_segundos = 1
  }

  const ordem = parseInt(formData.get('ordem') as string || '0')
  const modulo_id_raw = formData.get('modulo_id') as string
  const questionario_id_raw = formData.get('questionario_id') as string
  const recurso_id_raw = formData.get('recurso_id') as string
  
  const modulo_id = (modulo_id_raw && modulo_id_raw !== 'null' && modulo_id_raw !== '') ? modulo_id_raw : null
  const questionario_id = (questionario_id_raw && questionario_id_raw !== 'null' && questionario_id_raw !== '') ? questionario_id_raw : null
  const recurso_id = (recurso_id_raw && recurso_id_raw !== 'null' && recurso_id_raw !== '') ? recurso_id_raw : null

  const liberacao_dias = parseInt(formData.get('liberacao_dias') as string || '0')

  const { error } = await supabase.from('aulas').update({
    titulo,
    slug,
    descricao,
    video_url,
    duracao_segundos,
    ordem,
    modulo_id,
    tipo_conteudo,
    questionario_id,
    recurso_id,
    liberacao_dias
  }).eq('id', id)

  if (error) {
    console.error('Erro ao atualizar aula', error)
    throw new Error('Falha ao atualizar aula')
  }

  revalidatePath('/admin/aulas')
  redirect('/admin/aulas')
}

export async function deleteAula(id: string) {
  await ensureAdmin()
  const supabase = await createClient()

  // 1. Verificação de Vínculo Direto
  const { data: aula } = await supabase.from('aulas').select('modulo_id').eq('id', id).single()
  if (aula?.modulo_id) {
    throw new Error('Não é possível excluir uma aula que está vinculada diretamente a um módulo.')
  }

  // 2. Verificação de Vínculo em Tabelas Pivot
  const { count: countPivot } = await supabase
    .from('modulos_aulas')
    .select('*', { count: 'exact', head: true })
    .eq('aula_id', id)

  if (countPivot && countPivot > 0) {
    throw new Error('Não é possível excluir uma aula que possui vínculos em módulos da ementa.')
  }

  // 3. Verificação de Assinaturas (Se houver progresso, talvez não seja bom deletar)
  const { count: countProgresso } = await supabase
    .from('progresso_aulas')
    .select('*', { count: 'exact', head: true })
    .eq('aula_id', id)
  
  if (countProgresso && countProgresso > 0) {
    throw new Error('Não é possível excluir uma aula que possui registros de progresso de alunos.')
  }

  const { error } = await supabase.from('aulas').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar aula', error)
    throw new Error('Falha ao deletar aula: ' + error.message)
  }

  revalidatePath('/admin/aulas')
}

export async function createAulasLote(aulas: { titulo: string, video_url: string, duracao: string }[]) {
  await ensureAdmin()
  const supabase = await createClient()

  const insertData = aulas.map((a, index) => ({
    titulo: a.titulo,
    slug: slugify(a.titulo),
    video_url: a.video_url,
    duracao_segundos: parseDurationToSeconds(a.duracao),
    tipo_conteudo: 'video',
    modulo_id: null,
    ordem: index + 1
  })).filter(a => a.titulo.trim() !== '')

  if (insertData.length === 0) return { success: false, message: 'Nenhuma aula para inserir' }

  const { error } = await supabase.from('aulas').insert(insertData)

  if (error) {
    console.error('Erro ao criar aulas em lote', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/aulas')
  return { success: true }
}

export async function checkExistingAulas(urls: string[]) {
  const supabase = await createClient()

  if (!urls || urls.length === 0) return []

  const { data, error } = await supabase
    .from('aulas')
    .select('video_url')
    .in('video_url', urls)

  if (error) {
    console.error('Erro ao verificar aulas existentes', error)
    return []
  }

  return data.map(d => d.video_url)
}

function parseISODuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '00:00:00'
  const h = parseInt(match[1] || '0', 10)
  const m = parseInt(match[2] || '0', 10)
  const s = parseInt(match[3] || '0', 10)
  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].join(':')
}

export async function fetchYoutubePlaylist(url: string) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return { success: false, error: 'Chave do YouTube não configurada.' }

  // Extrair ID da playlist
  let playlistId = ''
  if (url.includes('list=')) {
    playlistId = url.split('list=')[1].split('&')[0]
  } else if (url.includes('playlist/')) {
    playlistId = url.split('playlist/')[1].split('/')[0]
  }

  if (!playlistId) return { success: false, error: 'URL de playlist inválida.' }

  try {
    let allItems: any[] = []
    let nextPageToken = ''
    
    // Buscar todos os itens da playlist (até 500 para evitar loops infinitos)
    do {
      const pUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}&pageToken=${nextPageToken}`
      const pRes = await fetch(pUrl)
      const pData = await pRes.json()

      if (pData.error) throw new Error(pData.error.message)
      
      if (pData.items) {
        allItems = [...allItems, ...pData.items]
      }
      nextPageToken = pData.nextPageToken
    } while (nextPageToken && allItems.length < 500)

    if (allItems.length === 0) return { success: false, error: 'Nenhum vídeo encontrado nesta playlist.' }

    // Buscar durações dos vídeos (precisa de outra chamada à API)
    const videoIds = allItems.map(item => item.contentDetails.videoId)
    let videosData: any[] = []
    
    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50).join(',')
      const vUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${chunk}&key=${apiKey}`
      const vRes = await fetch(vUrl)
      const vData = await vRes.json()
      if (vData.items) videosData = [...videosData, ...vData.items]
    }

    const results = allItems.map(item => {
      const videoDetail = videosData.find(v => v.id === item.contentDetails.videoId)
      const duration = videoDetail ? parseISODuration(videoDetail.contentDetails.duration) : '00:00:00'
      const descricao = videoDetail?.snippet?.description || ''

      return {
        titulo: item.snippet.title,
        video_url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
        duracao: duration,
        descricao: descricao
      }
    })

    return { success: true, videos: results }
  } catch (err: any) {
    console.error('Erro no YouTube API:', err)
    return { success: false, error: err.message || 'Erro ao comunicar com YouTube.' }
  }
}
