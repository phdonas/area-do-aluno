'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface LessonCommentsProps {
  aulaId: string
  usuario: any
}

export function LessonComments({ aulaId, usuario }: LessonCommentsProps) {
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function carregarComentarios() {
      const { data } = await supabase
        .from('aula_comentarios')
        .select('*')
        .eq('aula_id', aulaId)
        .order('created_at', { ascending: false })
      
      if (data) setComentarios(data)
      setCarregando(false)
    }

    carregarComentarios()
  }, [aulaId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comentario.trim()) return

    setEnviando(true)
    try {
      const { error } = await supabase
        .from('aula_comentarios')
        .insert({
          aula_id: aulaId,
          usuario_id: usuario.id,
          texto: comentario,
          status: 'pendente'
        })

      if (error) throw error

      setComentario('')
      // Recarregar
      const { data } = await supabase
        .from('aula_comentarios')
        .select('*')
        .eq('aula_id', aulaId)
        .order('created_at', { ascending: false })
      
      if (data) setComentarios(data)
    } catch (err) {
      console.error('Erro ao enviar comentário:', err)
      alert('Erro ao enviar comentário. Verifique se a tabela aula_comentarios existe.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-12 mt-12">
      <div className="bg-surface/60 backdrop-blur-sm border border-border-custom rounded-[48px] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="w-16 h-16 shrink-0 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-inner border border-primary/20">
            {usuario.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h4 className="text-lg font-black text-text-primary tracking-tight">O que você achou dessa aula?</h4>
              <p className="text-sm text-text-muted md:max-w-xl">Suas dúvidas e feedbacks ajudam a enriquecer nossa jornada. Nossa equipe responde em até 24h.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea 
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escreva seu comentário ou dúvida..."
                className="w-full bg-background/50 border border-border-custom rounded-[24px] p-6 text-sm font-medium focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none min-h-[140px] transition-all resize-none shadow-inner"
              />
              <button 
                type="submit"
                disabled={enviando || !comentario.trim()}
                className="flex items-center gap-3 px-12 py-5 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar Comentário'} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lista de Comentários */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2 px-4">
          <MessageSquare className="w-3 h-3" /> Interações Anteriores ({comentarios.length})
        </h3>
        
        {carregando ? (
           <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-primary opacity-20" /></div>
        ) : comentarios.length > 0 ? (
          comentarios.map((c) => (
            <div key={c.id} className="bg-surface/40 border border-border-custom rounded-[32px] p-8 space-y-6">
               <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-text-primary leading-relaxed">{c.texto}</p>
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </span>
               </div>

               {c.resposta && (
                 <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                       <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                       <span className="text-[10px] font-black uppercase text-primary tracking-widest">Resposta da Equipe</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary italic opacity-90">{c.resposta}</p>
                 </div>
               )}
            </div>
          ))
        ) : (
          <div className="p-12 border-2 border-dashed border-border-custom rounded-[32px] text-center">
             <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Nenhuma dúvida enviada para esta aula.</p>
          </div>
        )}
      </div>
    </div>
  )
}
