'use client'

import { HelpCircle, ChevronRight, Info, CheckCircle2 } from 'lucide-react'
import { ReactNode } from 'react'

interface TutorialStep {
  title: string
  description: string | ReactNode
}

interface AdminTutorialCardProps {
  moduleTitle: string
  color?: 'emerald' | 'amber' | 'blue' | 'indigo' | 'purple' | 'rose' | 'sky'
  steps: TutorialStep[]
  example?: string
  role?: string // Role do usuário atual para verificação
}

export function AdminTutorialCard({ 
  moduleTitle, 
  color = 'indigo', 
  steps, 
  example,
  role 
}: AdminTutorialCardProps) {
  
  // Se o role não for admin ou staff, não renderiza nada
  // Nota: A proteção de rota já acontece no layout do admin, 
  // mas aqui garantimos que apenas os níveis mais altos vejam o conteúdo sensível do guia.
  const isAllowed = role === 'admin' || role === 'staff'
  if (!isAllowed) return null

  const colorStyles = {
    emerald: 'bg-emerald-600 shadow-emerald-500/20 text-emerald-100',
    amber: 'bg-amber-600 shadow-amber-500/20 text-amber-100',
    blue: 'bg-blue-600 shadow-blue-500/20 text-blue-100',
    indigo: 'bg-indigo-600 shadow-indigo-500/20 text-indigo-100',
    purple: 'bg-purple-600 shadow-purple-500/20 text-purple-100',
    rose: 'bg-rose-600 shadow-rose-500/20 text-rose-100',
    sky: 'bg-sky-600 shadow-sky-500/20 text-sky-100'
  }

  const tagStyles = {
    emerald: 'text-emerald-200',
    amber: 'text-amber-200',
    blue: 'text-blue-200',
    indigo: 'text-indigo-200',
    purple: 'text-purple-200',
    rose: 'text-rose-200',
    sky: 'text-sky-200'
  }

  return (
    <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group transition-all hover:scale-[1.01] ${colorStyles[color]}`}>
      
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
      
      <div className="relative z-10">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
          <HelpCircle className={`w-7 h-7 ${tagStyles[color]} animate-pulse`} />
          Guia de {moduleTitle}
        </h3>

        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div key={idx} className="space-y-2 group/step">
               <div className="flex items-center gap-2">
                  <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/20 ${tagStyles[color]}`}>
                    Passo {idx + 1}
                  </div>
               </div>
               <p className="text-[13px] font-black uppercase tracking-widest opacity-90 group-hover/step:translate-x-1 transition-transform">
                 {step.title}
               </p>
               <div className="text-sm leading-relaxed text-white italic font-medium">
                 {step.description}
               </div>
            </div>
          ))}

          {example && (
            <div className="pt-6 border-t border-white/10 mt-4">
              <div className="flex items-center gap-2 mb-3">
                 <Info className={`w-4 h-4 ${tagStyles[color]}`} />
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Exemplo Recomendado:</p>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 font-mono text-[11px] break-all leading-relaxed shadow-inner">
                {example}
              </div>
            </div>
          )}

          <div className="pt-6 bg-white/5 -mx-4 px-4 py-4 rounded-2xl mt-4 border border-white/10">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-1">
                <CheckCircle2 className="w-4 h-4 text-white" /> Checklist de Sucesso
             </div>
             <p className="text-[11px] opacity-70">
                Verifique se os campos obrigatórios (*) estão preenchidos antes de salvar.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
