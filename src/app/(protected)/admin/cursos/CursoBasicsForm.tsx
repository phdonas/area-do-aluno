'use client'

import React, { useState } from 'react'
import { Save, LayoutTemplate, Plus, Trash2, Video, ShieldCheck, HelpCircle, ListChecks, Target, CreditCard, Sparkles, Globe, Award, AlertCircle } from 'lucide-react'
import { PrecoInternacional } from './PrecoInternacional'
import { MediaGallery } from '@/components/ui/MediaGallery'

interface CursoBasicsFormProps {
  curso: any
  layoutConfig?: any
  professores: any[]
  action: (formData: FormData) => Promise<void>
}

export function CursoBasicsForm({ curso, layoutConfig, professores, action }: CursoBasicsFormProps) {
  const [precoEur, setPrecoEur] = useState(curso.preco_eur || '')
  const [destaque, setDestaque] = useState(curso.destaque_vitrine || false)
  const [visivelSite, setVisivelSite] = useState(curso.visivel_no_site || false)
  const [exibirDepoimentos, setExibirDepoimentos] = useState(layoutConfig?.exibir_depoimentos || false)
  const [exibirSecoesExtras, setExibirSecoesExtras] = useState(layoutConfig?.exibir_secoes_extras ?? true)
  const [thumbUrl, setThumbUrl] = useState(curso.thumb_url || '')
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

      {/* Configuração de Layout */}
      <div className="p-8 bg-surface border border-border-custom rounded-3xl space-y-6">
        <h3 className="text-xl font-black text-text-primary uppercase italic tracking-widest flex items-center gap-3">
          <LayoutTemplate className="w-5 h-5 text-primary" /> Configurações de Layout (Página de Vendas)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setExibirDepoimentos(!exibirDepoimentos)}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
              exibirDepoimentos 
                ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' 
                : 'border-border-custom bg-background opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${exibirDepoimentos ? 'bg-emerald-500 text-white scale-110' : 'bg-surface text-text-muted'}`}>
                  <Award className="w-6 h-6" />
               </div>
               <div>
                 <h4 className={`text-sm font-black uppercase tracking-widest italic ${exibirDepoimentos ? 'text-emerald-500' : 'text-text-primary'}`}>Depoimentos</h4>
                 <p className="text-[10px] text-text-muted font-bold tracking-wider mt-1 uppercase">Exibir na página</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs font-black uppercase tracking-widest ${exibirDepoimentos ? 'text-emerald-500' : 'text-text-muted'}`}>
                {exibirDepoimentos ? 'Sim' : 'Não'}
              </span>
              <input type="checkbox" name="exibir_depoimentos" checked={exibirDepoimentos} readOnly className="sr-only" />
            </div>
          </div>

          <div 
            onClick={() => setExibirSecoesExtras(!exibirSecoesExtras)}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
              exibirSecoesExtras 
                ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10' 
                : 'border-border-custom bg-background opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${exibirSecoesExtras ? 'bg-amber-500 text-white scale-110' : 'bg-surface text-text-muted'}`}>
                  <ListChecks className="w-6 h-6" />
               </div>
               <div>
                 <h4 className={`text-sm font-black uppercase tracking-widest italic ${exibirSecoesExtras ? 'text-amber-500' : 'text-text-primary'}`}>Seções Extras</h4>
                 <p className="text-[10px] text-text-muted font-bold tracking-wider mt-1 uppercase">Para quem é, FAQ, etc.</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs font-black uppercase tracking-widest ${exibirSecoesExtras ? 'text-amber-500' : 'text-text-muted'}`}>
                {exibirSecoesExtras ? 'Sim' : 'Não'}
              </span>
              <input type="checkbox" name="exibir_secoes_extras" checked={exibirSecoesExtras} readOnly className="sr-only" />
            </div>
          </div>
        </div>
      </div>

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

        <div className="space-y-2">
          <label htmlFor="resultados_esperados" className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Resultados Esperados (Ao final do curso)
          </label>
          <textarea 
            id="resultados_esperados" name="resultados_esperados" rows={4} defaultValue={curso.resultados_esperados || ''}
            placeholder="Ex: Ao final, você será capaz de aplicar técnicas financeiras..."
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-emerald-500 transition-all text-sm resize-y"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="ementa_resumida" className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <ListChecks className="w-3 h-3 text-indigo-500" /> Ementa Resumida (Módulos e Aulas)
          </label>
          <textarea 
            id="ementa_resumida" name="ementa_resumida" rows={5} defaultValue={curso.ementa_resumida || ''}
            placeholder="Ex: Módulo 1: Introdução... Módulo 2: Aprofundamento..."
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-indigo-500 transition-all text-sm resize-y"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="pre_requisitos" className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-amber-500" /> Pré-requisitos
          </label>
          <textarea 
            id="pre_requisitos" name="pre_requisitos" rows={3} defaultValue={curso.pre_requisitos || ''}
            placeholder="Ex: Conhecimento básico em Excel..."
            className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-amber-500 transition-all text-sm resize-y"
          ></textarea>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border-custom">
        <div className="space-y-2">
          <label className="block text-xs font-black text-text-primary uppercase tracking-widest italic mb-4">
            Imagem da Capa do Curso <span className="text-primary-light">(Ideal: 1280x720px)</span>
          </label>
          <MediaGallery value={thumbUrl} onChange={setThumbUrl} name="thumb_url" />
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

      {/* INTEGRAÇÃO COM SITE E STRIPE */}
      <div className="space-y-6 pt-6 border-t border-border-custom">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest text-text-primary italic">Integração com Site e Stripe</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setVisivelSite(!visivelSite)}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
              visivelSite 
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                : 'border-border-custom bg-background opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest italic text-text-primary">Visível no Site</p>
                <p className="text-[10px] text-text-secondary font-medium">Se ativo, aparece no catálogo público.</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${visivelSite ? 'border-primary bg-primary' : 'border-border-custom'}`}>
               {visivelSite && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <input type="checkbox" name="visivel_no_site" checked={visivelSite} onChange={() => {}} className="hidden" />
          </div>

          <div className="space-y-2">
            <label htmlFor="tipo" className="block text-[10px] font-black text-text-primary uppercase tracking-widest">Plataforma (Tipo)</label>
            <select 
              id="tipo" name="tipo" defaultValue={curso.tipo?.toLowerCase() || 'lms'}
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm appearance-none"
            >
              <option value="lms">LMS (Área do Aluno)</option>
              <option value="udemy">Udemy</option>
              <option value="espm">ESPM</option>
            </select>
            <p className="text-[10px] text-text-muted mt-1">Onde o curso é consumido. LMS = aqui na plataforma.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="nivel" className="block text-[10px] font-black text-text-primary uppercase tracking-widest">Nível de Dificuldade</label>
            <select 
              id="nivel" name="nivel" defaultValue={curso.nivel || 'Iniciante'}
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm appearance-none"
            >
              <option value="Iniciante">Iniciante</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="categoria" className="block text-[10px] font-black text-text-primary uppercase tracking-widest">Categoria no Site</label>
            <input 
              type="text" id="categoria" name="categoria" defaultValue={curso.categoria || ''}
              placeholder="Ex: Gestão, Vendas, Tecnologia"
              className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-text-primary focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <label className="block text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2 italic">
            <CreditCard className="w-3 h-3 text-primary" /> Integração com Stripe
          </label>
          <details className="group bg-primary/5 border border-primary/20 rounded-xl overflow-hidden">
            <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-4">
              <span className="text-xs text-text-secondary leading-relaxed">
                Os preços deste curso são vinculados via <b>Stripe</b> e configurados na tabela <code>planos_cursos</code> do Supabase — não há link de checkout a preencher aqui.
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary shrink-0 group-open:hidden">Ver tutorial</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary shrink-0 hidden group-open:inline">Ocultar</span>
            </summary>
            <div className="px-4 pb-4 space-y-3">
              <p className="text-[10px] text-text-primary font-bold uppercase">Como vincular um preço ao curso:</p>
              <ol className="text-xs text-text-secondary leading-relaxed list-decimal list-inside space-y-1">
                <li>Acesse <code>dashboard.stripe.com</code> → <b>Products</b> → <b>Add product</b></li>
                <li>Crie um preço para cada plano (Vitalício, Anual, Semestral) em EUR e BRL</li>
                <li>Copie o Price ID gerado (formato: <code>price_xxxxxxxxxx</code>)</li>
                <li>No Supabase → <b>Table Editor</b> → <code>planos_cursos</code></li>
                <li>Preencha <code>stripe_price_id_eur</code> e <code>valor_venda_eur</code> para cada plano</li>
              </ol>
              <div>
                <p className="text-[10px] text-text-primary font-bold uppercase mb-1">Verificar com SQL:</p>
                <pre className="text-[10px] bg-background border border-border-custom rounded-lg p-3 overflow-x-auto text-text-secondary">
{`SELECT p.nome, pc.stripe_price_id_eur, pc.valor_venda_eur
FROM planos_cursos pc
JOIN planos p ON p.id = pc.plano_id
WHERE pc.curso_id = 'seu-curso-id';`}
                </pre>
              </div>
            </div>
          </details>
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
