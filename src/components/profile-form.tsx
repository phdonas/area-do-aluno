'use client'

import { useState } from 'react'
import { User, Phone, MapPin, Hash, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  initialData: any
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    telefone: initialData?.telefone || '',
    rua: initialData?.rua || '',
    numero: initialData?.numero || '',
    bairro: initialData?.bairro || '',
    cidade: initialData?.cidade || '',
    estado: initialData?.estado || '',
    cep: initialData?.cep || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update(formData)
        .eq('id', initialData.id)

      if (updateError) throw updateError

      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err)
      setError(err.message || 'Ocorreu um erro ao salvar as alterações.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-surface border border-border-custom rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-border-custom bg-background/20">
          <h3 className="font-black text-text-primary uppercase tracking-widest text-xs flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-primary" /> Editar Dados Pessoais
          </h3>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-background/30">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
              Nome Completo
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full bg-surface border border-border-custom p-4 rounded-2xl text-sm font-bold text-text-primary focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full bg-surface border border-border-custom p-4 rounded-2xl text-sm font-bold text-text-primary focus:border-primary/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border-custom rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-border-custom bg-background/20">
          <h3 className="font-black text-text-primary uppercase tracking-widest text-xs flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Endereço de Correspondência
          </h3>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-background/30">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Rua / Logradouro</label>
            <input
              type="text"
              name="rua"
              value={formData.rua}
              onChange={handleChange}
              className="w-full bg-surface border border-border-custom p-4 rounded-2xl text-sm font-bold text-text-primary outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Número</label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className="w-full bg-surface border border-border-custom p-4 rounded-2xl text-sm font-bold text-text-primary outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Bairro</label>
            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              className="w-full bg-surface border border-border-custom p-4 rounded-2xl text-sm font-bold text-text-primary outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Cidade</label>
            <input
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              className="w-full bg-surface border border-border-custom p-4 rounded-2xl text-sm font-bold text-text-primary outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Estado / UF</label>
            <input
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full bg-surface border border-border-custom p-4 rounded-2xl text-sm font-bold text-text-primary outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">C.E.P / Código Postal</label>
            <input
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              className="w-full bg-surface border border-border-custom p-4 rounded-2xl text-sm font-bold text-text-primary outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {error && <p className="text-rose-500 text-sm font-bold uppercase tracking-widest animate-pulse">{error}</p>}
        {success && <p className="text-emerald-500 text-sm font-bold uppercase tracking-widest">Perfil atualizado com sucesso!</p>}
        
        <button
          disabled={loading}
          type="submit"
          className="w-full md:w-auto ml-auto flex items-center justify-center gap-3 px-10 py-5 bg-text-primary text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-black/10 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </button>
      </div>
    </form>
  )
}
