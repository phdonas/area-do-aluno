'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Save, User, Link as LinkIcon, Video } from 'lucide-react'
import { upsertProfessor } from './actions'

interface ProfessorFormProps {
  professor: {
    id?: string
    nome: string
    biografia?: string
    avatar_url?: string
    video_url?: string
    site_url?: string
    links?: { label: string; url: string }[]
  }
}

export function ProfessorForm({ professor }: ProfessorFormProps) {
  const [links, setLinks] = useState<{ label: string; url: string }[]>(
    Array.isArray(professor.links) ? professor.links : []
  )

  const addLink = () => {
    if (links.length >= 8) return alert('Você só pode cadastrar até 8 links.')
    setLinks([...links, { label: '', url: '' }])
  }

  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index))

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...links]
    newLinks[index][field] = value
    setLinks(newLinks)
  }

  return (
    <form action={upsertProfessor} className="space-y-8 animate-in fade-in duration-500">
      <input type="hidden" name="id" value={professor.id || ''} />
      <input type="hidden" name="links" value={JSON.stringify(links)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-border-custom rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
               <User className="w-4 h-4" /> Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="nome" className="block text-xs font-black text-text-primary uppercase tracking-widest italic">Nome Profissional *</label>
                <input 
                  type="text" id="nome" name="nome" required defaultValue={professor.nome} 
                  placeholder="Ex: Prof. PH Donassolo"
                  className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="avatar_url" className="block text-xs font-black text-text-primary uppercase tracking-widest italic">URL da Foto</label>
                <input 
                  type="url" id="avatar_url" name="avatar_url" defaultValue={professor.avatar_url} 
                  placeholder="Link da sua melhor foto (600x600)"
                  className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label htmlFor="video_url" className="block text-xs font-black text-text-primary uppercase tracking-widest italic flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" /> Vídeo de Apresentação (Youtube/Vimeo)
                 </label>
                 <input 
                   type="url" id="video_url" name="video_url" defaultValue={professor.video_url} 
                   placeholder="Youtube ou Vimeo"
                   className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
                 />
               </div>

               <div className="space-y-2">
                 <label htmlFor="site_url" className="block text-xs font-black text-text-primary uppercase tracking-widest italic flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-primary" /> Site Oficial / Portfolio
                 </label>
                 <input 
                   type="url" id="site_url" name="site_url" defaultValue={professor.site_url} 
                   placeholder="https://seusite.com.br"
                   className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
                 />
               </div>
             </div>

            <div className="space-y-2">
              <label htmlFor="biografia" className="block text-xs font-black text-text-primary uppercase tracking-widest italic">Mini Curriculum / Biografia</label>
              <textarea 
                id="biografia" name="biografia" rows={8} defaultValue={professor.biografia}
                placeholder="Uma breve apresentação sobre sua jornada e autoridade..."
                className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm resize-y"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-border-custom rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                 <LinkIcon className="w-4 h-4 text-primary" /> Redes Sociais
              </label>
              <button 
                type="button" 
                onClick={addLink}
                disabled={links.length >= 8}
                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
               {links.map((link, index) => (
                 <div key={index} className="space-y-2 p-4 bg-background border border-border-custom rounded-2xl group relative">
                    <input 
                      type="text" 
                      value={link.label} 
                      onChange={(e) => updateLink(index, 'label', e.target.value)}
                      placeholder="Rede (Ex: Instagram, LinkedIn)"
                      className="w-full bg-transparent border-none p-0 text-[10px] font-black text-primary uppercase tracking-widest focus:ring-0 placeholder:opacity-30"
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="url" 
                        value={link.url} 
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-transparent border-none p-0 text-xs text-text-secondary focus:ring-0 placeholder:opacity-40"
                      />
                      <button 
                        type="button" 
                        onClick={() => removeLink(index)}
                        className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                 </div>
               ))}
               {links.length === 0 && (
                 <div className="text-center py-10 border border-dashed border-border-custom rounded-2xl text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
                    Nenhum link social.
                 </div>
               )}
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10">
             <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-2">💡 Dica de Especialista</p>
             <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
               Professores com vídeo de apresentação convertem até 40% mais alunos novos em seus cursos.
             </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t border-border-custom">
         <button 
           type="submit"
           className="px-12 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-2xl shadow-indigo-600/20 active:scale-95"
         >
            <Save className="w-5 h-5" /> Publicar Perfil do Professor
         </button>
      </div>
    </form>
  )
}

