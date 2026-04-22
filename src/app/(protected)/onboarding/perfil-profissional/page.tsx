'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  Globe, 
  Loader2, 
  ArrowRight,
  User,
  Phone as PhoneIcon,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import { salvarPerfilProfissional } from './actions'

import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export default function OnboardingPerfilProfissional() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    telefone: '',
    cargo: '',
    segmento_mercado: '',
    tamanho_empresa: '',
    experiencia_anos: ''
  })
  const router = useRouter()

  const handleUpdate = async () => {
    setLoading(true)
    setServerError(null)
    
    try {
      const result = await salvarPerfilProfissional(formData)

      if (result.error) {
        setServerError(result.error)
        return
      }

      router.push('/vitrine?welcome=true')
    } catch (err: any) {
      setServerError('Não foi possível conectar ao servidor. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = 
    formData.full_name && 
    formData.telefone && 
    formData.cargo && 
    formData.segmento_mercado && 
    formData.tamanho_empresa && 
    formData.experiencia_anos

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <style jsx global>{`
        .PhoneInput {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--background);
          border: 1px solid var(--border-custom);
          padding: 18px 20px;
          border-radius: 1rem;
          transition: all 0.2s;
        }
        .PhoneInput:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 1px var(--primary);
        }
        .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 0.875rem;
          flex: 1;
        }
        .PhoneInputCountry {
          display: flex;
          align-items: center;
        }
        .PhoneInputCountryIcon {
          width: 24px;
          height: auto;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-surface border border-border-custom rounded-[48px] overflow-hidden shadow-2xl"
      >
        <div className="p-12 md:p-16 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.8)]" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Seu Cadastro</span>
               <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest">+50 PHD COINS</span>
               </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter italic">
              Quase lá. <br/>
              <span className="text-text-secondary opacity-50">Queremos te conhecer.</span>
            </h1>
            <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-md">
              Para personalizar sua trilha de evolução e os diagnósticos de IA, precisamos entender seu momento profissional.
            </p>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dados Pessoais - Destaque */}
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border-custom/30">
               <div className="space-y-2 group">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted group-focus-within:text-primary transition-colors">
                    <User className="w-3.5 h-3.5" /> Nome Completo
                  </label>
                  <input 
                    placeholder="Seu nome"
                    className="w-full bg-background border border-border-custom focus:border-primary p-5 rounded-2xl text-sm font-bold text-text-primary outline-none transition-all placeholder:text-text-muted/50"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
               </div>

               <div className="space-y-2 group">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted group-focus-within:text-primary transition-colors">
                    <PhoneIcon className="w-3.5 h-3.5" /> Telefone / WhatsApp
                  </label>
                  <PhoneInput
                    defaultCountry="BR"
                    placeholder="Seu telefone"
                    value={formData.telefone}
                    onChange={(val) => setFormData({...formData, telefone: val || ''})}
                    className="premium-phone-input"
                  />
               </div>
            </div>

            {/* Dados Profissionais */}
            <div className="space-y-2 group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted group-focus-within:text-primary transition-colors">
                <Briefcase className="w-3.5 h-3.5" /> Seu Cargo Atual
              </label>
              <input 
                placeholder="Ex: Gerente de Vendas"
                className="w-full bg-background border border-border-custom focus:border-primary p-5 rounded-2xl text-sm font-bold text-text-primary outline-none transition-all placeholder:text-text-muted/50"
                value={formData.cargo}
                onChange={(e) => setFormData({...formData, cargo: e.target.value})}
              />
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted group-focus-within:text-primary transition-colors">
                <Globe className="w-3.5 h-3.5" /> Segmento de Mercado
              </label>
              <select 
                className="w-full bg-background border border-border-custom focus:border-primary p-5 rounded-2xl text-sm font-bold text-text-primary outline-none transition-all appearance-none"
                value={formData.segmento_mercado}
                onChange={(e) => setFormData({...formData, segmento_mercado: e.target.value})}
              >
                <option value="" disabled className="bg-surface">Selecione o segmento</option>
                <option value="tecnologia" className="bg-surface">Tecnologia / SaaS</option>
                <option value="financas" className="bg-surface">Finanças / Bancos</option>
                <option value="varejo" className="bg-surface">Varejo / E-commerce</option>
                <option value="educacao" className="bg-surface">Educação</option>
                <option value="saude" className="bg-surface">Saúde</option>
                <option value="industria" className="bg-surface">Indústria</option>
                <option value="servicos" className="bg-surface">Serviços</option>
                <option value="outros" className="bg-surface">Outros</option>
              </select>
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted group-focus-within:text-primary transition-colors">
                <Building2 className="w-3.5 h-3.5" /> Tamanho da Empresa
              </label>
              <select 
                className="w-full bg-background border border-border-custom focus:border-primary p-5 rounded-2xl text-sm font-bold text-text-primary outline-none transition-all appearance-none"
                value={formData.tamanho_empresa}
                onChange={(e) => setFormData({...formData, tamanho_empresa: e.target.value})}
              >
                <option value="" disabled className="bg-surface">Tamanho do time</option>
                <option value="1-10" className="bg-surface">1 - 10 pessoas</option>
                <option value="11-50" className="bg-surface">11 - 50 pessoas</option>
                <option value="51-200" className="bg-surface">51 - 200 pessoas</option>
                <option value="201-500" className="bg-surface">201 - 500 pessoas</option>
                <option value="500+" className="bg-surface">Mais de 500</option>
              </select>
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted group-focus-within:text-primary transition-colors">
                <Calendar className="w-3.5 h-3.5" /> Anos de Experiência
              </label>
              <input 
                type="number"
                placeholder="Ex: 5"
                className="w-full bg-background border border-border-custom focus:border-primary p-5 rounded-2xl text-sm font-bold text-text-primary outline-none transition-all placeholder:text-text-muted/50"
                value={formData.experiencia_anos}
                onChange={(e) => setFormData({...formData, experiencia_anos: e.target.value})}
              />
            </div>
          </div>

          {/* Footer/Action */}
          <div className="pt-8 flex flex-col items-center gap-6">
            {serverError && (
              <div className="bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase p-6 rounded-2xl w-full border border-rose-500/30 space-y-1">
                <p className="tracking-widest">ERRO: {serverError}</p>
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={!isFormValid || loading}
              className="w-full bg-text-primary text-background py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:scale-[1.02] shadow-2xl transition-all disabled:opacity-20 disabled:scale-100 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                   Finalizar o Cadastro
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.3em]">Ambiente Seguro PHDonassolo Academy &copy; 2026</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-border-custom/30 flex">
          <div className="h-full bg-primary w-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
        </div>
      </motion.div>
    </div>
  )
}
