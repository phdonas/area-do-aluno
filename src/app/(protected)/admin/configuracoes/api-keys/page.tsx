'use client'

import { useState, useEffect } from 'react'
import { getApiKeys, saveApiKey, SupportedApiKeys } from './actions'
import { KeyRound, MonitorPlay, Sparkles, BrainCircuit, Cpu, Save, Loader2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'

export default function ApiKeysPage() {
  const { success, error: toastError } = useToast()
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchKeys() {
      const data = await getApiKeys()
      setKeys(data)
      setLoading(false)
    }
    fetchKeys()
  }, [])

  const handleSave = async (chave: SupportedApiKeys) => {
    const valor = keys[chave] || ''
    setSaving(chave)
    try {
      const result = await saveApiKey(chave, valor)
      if (result.success) {
        success(`Chave atualizada com sucesso!`)
      } else {
        toastError(result.error || 'Erro ao salvar a chave.')
      }
    } catch (e) {
      toastError('Erro ao salvar a chave.')
    } finally {
      setSaving(null)
    }
  }

  const handleChange = (chave: string, valor: string) => {
    setKeys(prev => ({ ...prev, [chave]: valor }))
  }

  const toggleShow = (chave: string) => {
    setShowKey(prev => ({ ...prev, [chave]: !prev[chave] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const integrations = [
    {
      id: 'youtube_api_key' as SupportedApiKeys,
      name: 'YouTube Data API v3',
      description: 'Necessária para importar vídeos e playlists do YouTube.',
      icon: MonitorPlay,
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    },
    {
      id: 'gemini_api_key' as SupportedApiKeys,
      name: 'Google Gemini',
      description: 'Chave para integrações com a IA do Google Gemini.',
      icon: Sparkles,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'claude_api_key' as SupportedApiKeys,
      name: 'Anthropic Claude',
      description: 'Chave para integrações com a IA Claude.',
      icon: BrainCircuit,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'openai_api_key' as SupportedApiKeys,
      name: 'OpenAI',
      description: 'Chave para integrações com ChatGPT / OpenAI.',
      icon: Cpu,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/admin" className="text-sm font-bold text-primary hover:underline mb-4 inline-block">
          &lt; Voltar para o Dashboard
        </Link>
        <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
          <KeyRound className="w-8 h-8 text-primary" />
          Chaves de API
        </h1>
        <p className="text-text-secondary mt-2">
          Gerencie as chaves de integração para serviços externos de forma centralizada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon
          const isSaving = saving === integration.id
          const isVisible = showKey[integration.id]
          const value = keys[integration.id] || ''

          return (
            <div key={integration.id} className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl ${integration.bg} ${integration.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-lg">{integration.name}</h3>
                  <p className="text-sm text-text-secondary leading-tight mt-1">
                    {integration.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => handleChange(integration.id, e.target.value)}
                    placeholder="Cole a API Key aqui..."
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-12 transition-all font-mono"
                  />
                  <button
                    onClick={() => toggleShow(integration.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => handleSave(integration.id)}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar {integration.name}
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
