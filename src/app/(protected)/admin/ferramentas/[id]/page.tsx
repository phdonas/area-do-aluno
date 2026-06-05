'use client'

import { useState, useEffect } from 'react'
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

export default function EdicaoFerramentaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    async function loadFerramenta() {
      const { data, error } = await supabase
        .from('ferramentas_saas')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        setError("Ferramenta não encontrada")
      } else {
        setFormData(data)
      }
      setLoading(false)
    }
    loadFerramenta()
  }, [params.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: dbError } = await supabase
      .from('ferramentas_saas')
      .update(formData)
      .eq('id', params.id)

    if (dbError) {
      setError(dbError.message)
      setSaving(false)
    } else {
      router.push('/admin/ferramentas')
      router.refresh()
    }
  }

  const iconOptions = ['Zap', 'Calculator', 'TrendingUp', 'Target', 'Cpu', 'ShieldCheck', 'DollarSign', 'Library', 'Users']

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-text-muted">CARREGANDO DADOS...</div>

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
              <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase">Editar Ferramenta</h1>
              <p className="text-xs font-black text-text-muted uppercase tracking-widest">{formData.nome}</p>
           </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
           <AlertCircle className="w-5 h-5" />
           {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border-custom rounded-[2.5rem] p-10 space-y-8 shadow-sm">
               
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Type className="w-3 h-3" /> Nome da Ferramenta
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={formData.nome}
                    onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-6 py-4 bg-background border border-border-custom rounded-2xl text-sm font-bold focus:border-primary outline-none"
                  />
               </div>

               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <AlignLeft className="w-3 h-3" /> Descrição
                  </label>
                  <textarea 
                    required 
                    rows={3}
                    value={formData.descricao}
                    onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full px-6 py-4 bg-background border border-border-custom rounded-2xl text-sm font-bold focus:border-primary outline-none resize-none"
                  />
               </div>

               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <LinkIcon className="w-3 h-3" /> Link Externo
                  </label>
                  <input 
                    required 
                    type="url" 
                    value={formData.url_externa}
                    onChange={e => setFormData(prev => ({ ...prev, url_externa: e.target.value }))}
                    className="w-full px-6 py-4 bg-background border border-border-custom rounded-2xl text-sm font-bold focus:border-primary outline-none"
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Status</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 bg-background border border-border-custom rounded-xl text-xs font-bold focus:border-primary outline-none"
                    >
                       <option value="ativo">Ativo</option>
                       <option value="inativo">Inativo (Pausa)</option>
                    </select>
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

         <div className="space-y-6">
            <div className="bg-surface border border-border-custom rounded-[2.5rem] p-8 space-y-8 shadow-sm">
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Smile className="w-3 h-3" /> Ícone
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

               <div className="pt-6">
                  <button 
                    disabled={saving}
                    type="submit"
                    className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Atualizando...' : 'Salvar Alterações'}
                  </button>
               </div>
            </div>
         </div>
      </form>
    </div>
  )
}
