'use client'

import 'plyr/dist/plyr.css'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Video } from 'lucide-react'

interface VideoPlayerProps {
  url: string;
}

function VideoPlayerInternal({ url, provider, videoId, isPlaylist }: { url: string; provider: string; videoId: string; isPlaylist?: boolean }) {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerInstance = useRef<any>(null)

  useEffect(() => {
    if (!videoRef.current) return
    if (isPlaylist && provider === 'youtube') return // Playlists vão usar o iframe direto

    const initPlayer = async () => {
      try {
        const PlyrModule = await import('plyr')
        const Plyr = (PlyrModule as any).default || PlyrModule

        const options: any = {
          autoplay: false,
          muted: false,
          controls: [
            'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'
          ],
          settings: ['quality', 'speed'],
          youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 },
          vimeo: { byline: false, portrait: false, title: false, speed: true, transparent: false },
        }

        if (!playerInstance.current) {
          playerInstance.current = new Plyr(videoRef.current, options)
          
          // Ao final do vídeo, reseta para o início e pausa
          playerInstance.current.on('ended', () => {
            playerInstance.current.stop();
          });
        }
      } catch (error) {
        console.error('Plyr Init Error:', error)
      }
    }

    const timer = setTimeout(initPlayer, 150) // Aumentando um pouco o delay para estabilidade

    return () => {
      clearTimeout(timer)
      if (playerInstance.current) {
        playerInstance.current.destroy()
        playerInstance.current = null
      }
    }
  }, [provider, videoId, url, isPlaylist])

  return (
    <div className="w-full h-full aspect-video bg-black group relative overflow-hidden">
      {provider === 'youtube' && isPlaylist ? (
        <iframe
          className="w-full h-full border-0"
          src={`https://www.youtube.com/embed/videoseries?list=${videoId}&rel=0&showinfo=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : provider === 'html5' ? (
        <video ref={videoRef as any} className="w-full h-full" playsInline controls>
           <source src={videoId} type="video/mp4" />
        </video>
      ) : (
        <div 
          ref={videoRef}
          className="w-full h-full" 
          data-plyr-provider={provider} 
          data-plyr-embed-id={videoId}
        />
      )}
    </div>
  )
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mediaInfo = useMemo(() => {
    if (!url) return null

    // YouTube regex robusto (pega videos padrão, shorts e outros)
    const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#\&\?]*).*/
    const match = url.match(ytRegex)
    const ytId = (match && match[2].length === 11) ? match[2] : null

    if (ytId) {
      return { provider: 'youtube', id: ytId, isPlaylist: false }
    }

    // YouTube Playlist fallback
    if (url.includes('list=')) {
      const listId = url.split('list=')[1]?.split('&')[0]
      if (listId) return { provider: 'youtube', id: listId, isPlaylist: true }
    }

    // Vimeo regex fixo para IDs numéricos
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/
    const vimeoMatch = url.match(vimeoRegex)
    if (vimeoMatch) {
      return { provider: 'vimeo', id: vimeoMatch[1], isPlaylist: false }
    }

    // HTML5 / Direct link
    return { provider: 'html5', id: url, isPlaylist: false }
  }, [url])

  if (!url || url.trim() === '') {
    return (
      <div className="w-full aspect-video bg-surface/50 border-2 border-dashed border-border-custom flex flex-col items-center justify-center gap-4 text-text-muted">
        <Video className="w-12 h-12 opacity-20" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Aguardando Vídeo</span>
      </div>
    )
  }

  if (!mounted || !mediaInfo) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center overflow-hidden border border-white/5">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <VideoPlayerInternal 
      key={url} 
      url={url} 
      provider={mediaInfo.provider} 
      videoId={mediaInfo.id} 
      isPlaylist={mediaInfo.isPlaylist}
    />
  )
}
