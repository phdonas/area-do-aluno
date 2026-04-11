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
  RefreshCw
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
    status: 'ativo'
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
              <p className="text-xs font-black text-text-muted uppercase tracking-widest">Prof. Paulo H. Donassolo</p>
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
