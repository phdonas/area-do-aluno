'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Zap, 
  ChevronLeft, 
  Save, 
  Link as LinkIcon, 
  Type, 
  AlignLeft, 
  Smile, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

export default function NovoFerramentaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    descricao: '',
    icone: 'Zap',
    url_externa: '',
    capa_url: '',
    label_botao: 'Abrir Ferramenta',
    status: 'ativo',
    visivel_no_site: false,
    categoria: '',
    url_checkout: '',
    tipo_entrega: '',
    url_entrega: ''
  })

  // Gerar slug automaticamente baseado no nome
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value
    const slug = nome.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
    
    setFormData(prev => ({ ...prev, nome, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: dbError } = await supabase
      .from('ferramentas_saas')
      .insert([formData])

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
    } else {
      router.push('/admin/ferramentas')
      router.refresh()
    }
  }

  // Lista de ícones populares para facilitar a escolha
  const iconOptions = ['Zap', 'Calculator', 'TrendingUp', 'Target', 'Cpu', 'ShieldCheck', 'DollarSign', 'Library', 'Users']

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link 
            href="/admin/ferramentas" 
            className="p-3 bg-surface border border-border-custom hover:bg-black/5 rounded-2xl transition-all"
           >
              <ChevronLeft className="w-5 h-5 text-text-primary" />
           </Link>
           <div>
              <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase">Nova Ferramenta Premium</h1>
              <p className="text-xs font-black text-text-muted uppercase tracking-widest">Prof. Paulo Donassolo — Formação que Gera Resultados</p>
           </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold animate-shake">
           <AlertCircle className="w-5 h-5" />
           {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* COLUNA PRINCIPAL */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border-custom rounded-[2.5rem] p-10 space-y-8 shadow-sm">
               
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Type className="w-3 h-3" /> Nome da Ferramenta
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Calculadora de Gás"
                    value={formData.nome}
                    onChange={handleNomeChange}
                    className="w-full px-6 py-4 bg-background border border-border-custom rounded-2xl text-sm font-bold focus:border-primary outline-none"
                  />
               </div>

               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <AlignLeft className="w-3 h-3" /> Descrição Curta (Impacto)
                  </label>
                  <textarea 
                    required 
                    rows={3}
                    placeholder="O que o aluno vai alcançar com esta ferramenta?"
                    value={formData.descricao}
                    onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full px-6 py-4 bg-background border border-border-custom rounded-2xl text-sm font-bold focus:border-primary outline-none resize-none"
                  />
               </div>

               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <LinkIcon className="w-3 h-3" /> Link Externo (Hostgator/Drive)
                  </label>
                  <input 
                    required 
                    type="url" 
                    placeholder="https://sua-url.com/ferramenta"
                    value={formData.url_externa}
                    onChange={e => setFormData(prev => ({ ...prev, url_externa: e.target.value }))}
                    className="w-full px-6 py-4 bg-background border border-border-custom rounded-2xl text-sm font-bold focus:border-primary outline-none"
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Identificador (Slug)</label>
                    <input 
                      disabled 
                      type="text" 
                      value={formData.slug}
                      className="w-full px-4 py-3 bg-black/5 border border-border-custom rounded-xl text-xs font-bold text-text-muted cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Texto do Botão</label>
                    <input 
                      type="text" 
                      value={formData.label_botao}
                      onChange={e => setFormData(prev => ({ ...prev, label_botao: e.target.value }))}
                      className="w-full px-4 py-3 bg-background border border-border-custom rounded-xl text-xs font-bold focus:border-primary outline-none"
                    />
                  </div>
               </div>

               {/* INTEGRAÇÃO COM SITE PÚBLICO E VENDAS */}
               <div className="pt-6 border-t border-border-custom space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                     <Globe className="w-5 h-5 text-primary" />
                     <h3 className="text-sm font-black uppercase tracking-widest text-text-primary italic">Venda e Exibição no Site</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div 
                        onClick={() => setFormData(prev => ({ ...prev, visivel_no_site: !prev.visivel_no_site }))}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                           formData.visivel_no_site 
                           ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                           : 'border-border-custom bg-background opacity-70 hover:opacity-100'
                        }`}
                     >
                        <div className="flex items-center gap-4">
                           <div>
                              <p className="text-xs font-black uppercase tracking-widest italic text-text-primary">Visível no Site</p>
                              <p className="text-[10px] text-text-secondary font-medium">Ative para aparecer no catálogo.</p>
                           </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.visivel_no_site ? 'border-primary bg-primary' : 'border-border-custom'}`}>
                           {formData.visivel_no_site && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Categoria no Site</label>
                        <input 
                           type="text" 
                           placeholder="Ex: Produtividade"
                           value={formData.categoria || ''}
                           onChange={e => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                           className="w-full px-4 py-3 bg-background border border-border-custom rounded-xl text-xs font-bold focus:border-primary outline-none"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Tipo de Entrega</label>
                        <select 
                           value={formData.tipo_entrega || ''}
                           onChange={e => setFormData(prev => ({ ...prev, tipo_entrega: e.target.value }))}
                           className="w-full px-4 py-3 bg-background border border-border-custom rounded-xl text-xs font-bold focus:border-primary outline-none appearance-none"
                        >
                           <option value="">Selecione...</option>
                           <option value="Acesso Interno">Acesso Interno / Redirecionamento</option>
                           <option value="Download de Arquivo">Download de Arquivo</option>
                           <option value="Acesso Externo">Acesso Externo</option>
                        </select>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2"><LinkIcon className="w-3 h-3"/> URL de Entrega</label>
                        <input 
                           type="url" 
                           placeholder="Ex: Link do PDF ou Rota Interna"
                           value={formData.url_entrega || ''}
                           onChange={e => setFormData(prev => ({ ...prev, url_entrega: e.target.value }))}
                           className="w-full px-4 py-3 bg-background border border-border-custom rounded-xl text-xs font-bold focus:border-primary outline-none"
                        />
                     </div>
                  </div>

                  <div className="space-y-4 pt-4">
                     <label className="text-xs font-black uppercase tracking-widest text-text-primary flex items-center gap-2 italic"><LinkIcon className="w-3 h-3 text-primary"/> Link de Checkout (Hotmart)</label>
                     <input 
                        type="url" 
                        placeholder="Cole o link da página de pagamento"
                        value={formData.url_checkout || ''}
                        onChange={e => setFormData(prev => ({ ...prev, url_checkout: e.target.value }))}
                        className="w-full px-6 py-4 bg-background border border-border-custom rounded-xl text-sm font-bold focus:border-primary outline-none"
                     />
                     <div className="mt-2 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <p className="text-[10px] text-text-primary font-bold uppercase mb-1">Como preencher este link?</p>
                        <p className="text-xs text-text-secondary leading-relaxed">
                           Acesse a Hotmart: <b>Produtos &gt; Meus Produtos &gt; Links de Divulgação</b> e copie a URL da <i>Página de Pagamento</i>. O e-mail do aluno é anexado automaticamente.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* COLUNA LATERAL (ESTÉTICA) */}
         <div className="space-y-6">
            <div className="bg-surface border border-border-custom rounded-[2.5rem] p-8 space-y-8 shadow-sm">
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Smile className="w-3 h-3" /> Ícone Lucide
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                     {iconOptions.map(iconName => {
                        // @ts-ignore
                        const IconComp = LucideIcons[iconName] || Zap
                        return (
                          <button 
                            type="button"
                            key={iconName}
                            onClick={() => setFormData(prev => ({ ...prev, icone: iconName }))}
                            className={`p-4 rounded-xl border flex items-center justify-center transition-all ${formData.icone === iconName ? 'bg-primary border-primary text-white shadow-lg' : 'bg-background border-border-custom text-text-muted hover:border-primary/50'}`}
                          >
                             <IconComp className="w-5 h-5" />
                          </button>
                        )
                     })}
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <ImageIcon className="w-3 h-3" /> URL da Capa (Opcional)
                  </label>
                  <input 
                    type="url" 
                    placeholder="Link da imagem/thumb"
                    value={formData.capa_url}
                    onChange={e => setFormData(prev => ({ ...prev, capa_url: e.target.value }))}
                    className="w-full px-6 py-4 bg-background border border-border-custom rounded-2xl text-xs font-bold focus:border-primary outline-none"
                  />
               </div>

               <div className="pt-6">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {loading ? 'Sincronizando...' : 'Publicar Ferramenta'}
                  </button>
               </div>
            </div>

            {/* PREVIEW CARD */}
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] space-y-4 opacity-70 grayscale hover:grayscale-0 transition-all">
               <p className="text-[10px] font-black uppercase tracking-widest text-primary text-center">Pré-visualização do Aluno</p>
               <div className="bg-surface p-6 rounded-2xl border border-border-custom shadow-sm text-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-4">
                    <LucideIcons.Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-text-primary limit-1">{formData.nome || 'Nome da Ferramenta'}</h4>
                  <p className="text-[10px] text-text-muted mt-2 line-clamp-2">{formData.descricao || 'Descrição aparecerá aqui...'}</p>
               </div>
            </div>
         </div>
      </form>
    </div>
  )
}
