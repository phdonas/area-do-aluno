'use client'

import React, { useState } from 'react'
import { Save, LayoutTemplate, Plus, Trash2, Video, ShieldCheck, HelpCircle, ListChecks, Target, CreditCard, Sparkles } from 'lucide-react'
import { PrecoInternacional } from './PrecoInternacional'

interface CursoBasicsFormProps {
  curso: any
  professores: any[]
  action: (formData: FormData) => Promise<void>
}

export function CursoBasicsForm({ curso, professores, action }: CursoBasicsFormProps) {
  const [precoEur, setPrecoEur] = useState(curso.preco_eur || '')
  const [destaque, setDestaque] = useState(curso.destaque_vitrine || false)
  const [faqs, setFaqs] = useState<{pergunta: string, resposta: string}[]>(
    Array.isArray(curso.faq) ? curso.faq : []
  )

  const addFaq = () => setFaqs([...faqs, { pergunta: '', resposta: '' }])
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index))
  const updateFaq = (index: number, field: 'pergunta' | 'resposta', value: string) => {
    const newFaqs = [...faqs]
    newFaqs[index][field] = value
    setFaqs(newFaqs)
  }

  return (
    <form action={action} className="space-y-8">
      {/* FAQ Hidden Input to send JSON via FormData */}
      <input type="hidden" name="faq" value={JSON.stringify(faqs)} />

      {/* Seção Superior: Destaque e Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div 
          onClick={() => setDestaque(!destaque)}
          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
            destaque 
              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
              : 'border-border-custom bg-background opacity-60 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${destaque ? 'bg-primary text-white scale-110' : 'bg-surface text-text-muted'}`}>
                <Sparkles className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs font-black uppercase tracking-widest italic text-text-primary">Destaque na Vitrine</p>
                <p className="text-[10px] text-text-secondary font-medium">Exibir este curso no topo da Landing Page principal.</p>
             </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${destaque ? 'border-primary bg-primary' : 'border-border-custom'}`}>
             {destaque && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
          <input type="checkbox" name="destaque_vitrine" checked={destaque} onChange={() => {}} className="hidden" />
        </div>

        <div className="p-6 bg-surface border border-border-custom rounded-3xl flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-background border border-border-custom flex items-center justify-center text-text-muted">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-black uppercase tracking-widest italic text-text-primary">Status de Lançamento</p>
                 <select 
                    id="status" name="status" defaultValue={curso.status}
                    className="bg-transparent text-sm font-bold text-primary focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="rascunho">⚠️ Rascunho / Interno</option>
                    <option value="publicado">✅ Publicado / Venda Ativa</option>
                  </select>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="titulo" className="block text-xs font-black text-text-primary uppercase tracking-widest italic">Título Público</label>
          <input 
            type="text" id="titulo" name="titulo" required defaultValue={curso.titulo}
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="block text-xs font-black text-text-primary uppercase tracking-widest italic">Slug / URL Amigável</label>
          <input 
            type="text" id="slug" name="slug" defaultValue={curso.slug}
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border-custom">
        <div className="space-y-2">
          <label htmlFor="descricao" className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <LayoutTemplate className="w-3 h-3 text-primary" /> Descrição Principal (Seu Pitch de Vendas)
          </label>
          <textarea 
            id="descricao" name="descricao" rows={6} defaultValue={curso.descricao || ''}
            placeholder="Qual a proposta de valor do curso?"
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-y"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="objetivos" className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <Target className="w-3 h-3 text-primary" /> O que você vai ensinar (Objetivo Principal)
          </label>
          <textarea 
            id="objetivos" name="objetivos" rows={4} defaultValue={curso.objetivos || ''}
            placeholder="Ex: Você vai aprender estratégias práticas para..."
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm resize-y"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="publico_alvo" className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-3 h-3 text-primary" /> Para quem você criou este curso (Público-Alvo)
          </label>
          <textarea 
            id="publico_alvo" name="publico_alvo" rows={3} defaultValue={curso.publico_alvo || ''}
            placeholder="Ex: Para você que é empresário e deseja..."
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm resize-y"
          ></textarea>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border-custom">
        <div className="space-y-2">
          <label htmlFor="thumb_url" className="block text-xs font-black text-text-primary uppercase tracking-widest italic">
            Imagem da Capa do Curso <span className="text-primary-light">(Ideal: 1280x720px)</span>
          </label>
          <input 
            type="url" id="thumb_url" name="thumb_url" defaultValue={curso.thumb_url || ''}
            placeholder="URL da imagem (Ex: https://...)"
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="video_vendas_url" className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2 italic">
            <Video className="w-3 h-3 text-primary" /> Vídeo de Vendas (Trailer URL)
          </label>
          <input 
            type="url" id="video_vendas_url" name="video_vendas_url" defaultValue={curso.video_vendas_url || ''}
            placeholder="Ex: Youtube ou Vimeo"
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
          />
        </div>

        {/* COMPONENTE INTERNACIONAL DE PREÇOS */}
        <div className="pt-4">
          <PrecoInternacional 
            valorReal={curso.preco || ''}
            valorEur={precoEur}
            onChangeEur={setPrecoEur}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="garantia_dias" className="block text-xs font-black text-text-primary uppercase tracking-widest italic flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-primary" /> Dias de Garantia
            </label>
            <input 
              type="number" id="garantia_dias" name="garantia_dias" defaultValue={curso.garantia_dias || 7}
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="professor_id" className="block text-xs font-black text-text-primary uppercase tracking-widest italic">Instrutor / Professor</label>
            <select 
              id="professor_id" name="professor_id" defaultValue={curso.professor_id || ''}
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm appearance-none"
            >
              <option value="">Selecione quem vai ensinar</option>
              {professores.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-border-custom">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <HelpCircle className="w-3 h-3 text-primary" /> Perguntas Frequentes (FAQ do Aluno)
          </label>
          <button 
            type="button" 
            onClick={addFaq}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Adicionar Pergunta
          </button>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="flex gap-4 items-start p-4 bg-background border border-border-custom rounded-xl relative group">
              <div className="flex-1 space-y-3">
                <input 
                  type="text" 
                  value={faq.pergunta} 
                  onChange={(e) => updateFaq(index, 'pergunta', e.target.value)}
                  placeholder="Pergunta..."
                  className="w-full bg-transparent border-none p-0 text-sm font-bold text-text-primary focus:ring-0 placeholder:opacity-50"
                />
                <textarea 
                  value={faq.resposta} 
                  onChange={(e) => updateFaq(index, 'resposta', e.target.value)}
                  placeholder="Resposta..."
                  rows={2}
                  className="w-full bg-transparent border-none p-0 text-xs text-text-secondary focus:ring-0 placeholder:opacity-50 resize-none"
                ></textarea>
              </div>
              <button 
                type="button" 
                onClick={() => removeFaq(index)}
                className="p-2 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-10 sticky bottom-0 bg-surface/80 backdrop-blur-md p-4 -mx-4 border-t border-primary/10 z-20">
        <button 
          type="submit"
          className="px-12 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20"
        >
          Salvar Alterações Globais <Save className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
