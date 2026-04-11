'use client'

import React, { useState } from 'react'
import { Save, LayoutTemplate, Plus, Trash2, Video, ShieldCheck, HelpCircle, ListChecks, Target, CreditCard } from 'lucide-react'
import { PrecoInternacional } from './PrecoInternacional'

interface CursoBasicsFormProps {
  curso: any
  professores: any[]
  action: (formData: FormData) => Promise<void>
}

export function CursoBasicsForm({ curso, professores, action }: CursoBasicsFormProps) {
  const [precoEur, setPrecoEur] = useState(curso.preco_eur || '')
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

      {/* Dicas de Formatação */}
      <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-4 mb-8">
        <div className="flex items-center gap-2 text-primary">
          <HelpCircle className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Guia de Formatação Rápida</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-text-secondary leading-relaxed font-medium">
          <div className="space-y-1">
            <p><strong>Negrito:</strong> Use <code className="bg-white px-1.5 py-0.5 rounded border border-border-custom">**texto**</code></p>
            <p><strong>Títulos:</strong> Use <code className="bg-white px-1.5 py-0.5 rounded border border-border-custom"># </code>, <code className="bg-white px-1.5 py-0.5 rounded border border-border-custom">## </code> ou <code className="bg-white px-1.5 py-0.5 rounded border border-border-custom">### </code></p>
          </div>
          <div className="space-y-1">
            <p><strong>Listas:</strong> Comece a linha com <code className="bg-white px-1.5 py-0.5 rounded border border-border-custom"> - </code></p>
            <p><strong>Quebras:</strong> O sistema respeita os seus "Enters".</p>
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

        <div className="space-y-2">
          <label htmlFor="pre_requisitos" className="block text-xs font-black text-text-primary uppercase tracking-widest">O que você precisa saber antes? (Pré-requisitos)</label>
          <textarea 
            id="pre_requisitos" name="pre_requisitos" rows={3} defaultValue={curso.pre_requisitos || ''}
            placeholder="Algum conhecimento que você já deve ter?"
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm resize-y"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="ementa_resumida" className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <ListChecks className="w-3 h-3 text-primary" /> Ementa Resumida (O que você vai aprender?)
          </label>
          <textarea 
            id="ementa_resumida" name="ementa_resumida" rows={4} defaultValue={curso.ementa_resumida || ''}
            placeholder="Ex: - Gatilhos Mentais\n- Fechamento de Vendas\n- Prospecção Ativa"
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm resize-y font-mono"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="resultados_esperados" className="block text-xs font-black text-text-primary uppercase tracking-widest">O que você vai conquistar ao final (Transformação)</label>
          <textarea 
            id="resultados_esperados" name="resultados_esperados" rows={4} defaultValue={curso.resultados_esperados || ''}
            placeholder="Qual a grande transformação na sua vida?"
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

        <div className="space-y-2">
          <label htmlFor="formas_pagamento" className="block text-xs font-black text-text-primary uppercase tracking-widest italic flex items-center gap-2">
            <CreditCard className="w-3 h-3 text-primary" /> Formas de Pagamento
          </label>
          <input 
            type="text" id="formas_pagamento" name="formas_pagamento" defaultValue={curso.formas_pagamento || ''} placeholder="Ex: 12x no Cartão, Pix, Multibanco"
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
              key={`prof-${curso.professor_id}`}
              id="professor_id" name="professor_id" defaultValue={curso.professor_id || ''}
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm appearance-none"
            >
              <option value="">Selecione quem vai ensinar</option>
              {professores.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="block text-xs font-black text-text-primary uppercase tracking-widest italic">Visibilidade</label>
            <select 
              key={`status-${curso.status}`}
              id="status" name="status" defaultValue={curso.status}
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm appearance-none"
            >
              <option value="rascunho">⚠️ Salvar como Rascunho</option>
              <option value="publicado">✅ Publicar para você vender</option>
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
          {faqs.length === 0 && (
            <div className="text-center py-4 text-[10px] uppercase font-bold text-text-muted tracking-widest border border-dashed border-border-custom rounded-xl">
              Nenhuma pergunta cadastrada.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit"
          className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
        >
          Salvar Alterações Globais <Save className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
