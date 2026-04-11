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
  RefreshCw
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
    status: 'ativo'
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
