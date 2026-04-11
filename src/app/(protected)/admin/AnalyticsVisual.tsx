'use client'

import { motion } from 'framer-motion'

interface AnalyticsVisualProps {
  data: {
    label: string
    value: number
    color: string
  }[]
  total: number
  format?: 'currency' | 'number' | 'hours'
}

export default function AnalyticsVisual({ data, total, format = 'currency' }: AnalyticsVisualProps) {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }
    if (format === 'hours') {
      return `${val.toLocaleString('pt-BR')} ${val === 1 ? 'hora' : 'horas'}`
    }
    return val.toLocaleString('pt-BR')
  }

  return (
    <div className="space-y-10">
      {data.map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0
        
        return (
          <div key={index} className="space-y-3 relative group">
            <div className="flex justify-between items-end relative z-10">
              <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1 block group-hover:text-primary transition-colors">
                    {item.label}
                 </span>
                 <span className="text-xl font-black text-text-primary tracking-tighter">
                    {formatValue(item.value)}
                 </span>
              </div>
              <div className="text-right">
                 <span className="text-3xl font-black text-text-primary italic opacity-80">
                    {Math.round(percentage)}%
                 </span>
              </div>
            </div>

            <div className="h-4 bg-black/[0.03] rounded-full overflow-hidden relative border border-black/[0.02]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.2 }}
                className={`h-full rounded-full ${item.color} shadow-lg shadow-${item.color.split('-')[1]}-500/20`}
              />
            </div>
          </div>
        )
      })}

      {/* Grid de Fundo do "Gráfico" */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex justify-between px-10 pt-24">
         {[1,2,3,4,5,6].map(i => (
           <div key={i} className="w-[1px] h-full bg-text-primary" />
         ))}
      </div>
    </div>
  )
}

