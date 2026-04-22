'use client'

import { motion } from 'framer-motion'

interface RadarData {
  subject: string
  value: number
  fullMark: number
}

interface RadarChartProps {
  data: RadarData[]
}

export function RadarChart({ data }: RadarChartProps) {
  // Se não houver dados, exibe um placeholder neutro
  const chartData = data.length > 0 ? data : [
    { subject: 'Negociação', value: 0, fullMark: 100 },
    { subject: 'IA/Tech', value: 0, fullMark: 100 },
    { subject: 'Liderança', value: 0, fullMark: 100 },
    { subject: 'Investimentos', value: 0, fullMark: 100 },
    { subject: 'Performance', value: 0, fullMark: 100 },
  ]

  const points = chartData.map((d, i) => {
    const angle = (Math.PI * 2 * i) / chartData.length - Math.PI / 2
    const r = (d.value / 100) * 80
    return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`
  }).join(' ')

  const gridLevels = [20, 40, 60, 80]

  return (
    <div className="bg-primary/10 dark:bg-blue-50/90 border border-primary/20 dark:border-blue-200 rounded-xl p-8 flex flex-col items-center shadow-sm h-full backdrop-blur-sm">
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground dark:text-primary-dark font-display">Radar de Competências</h3>
          <p className="text-[10px] text-text-muted dark:text-primary/60 uppercase tracking-wider font-bold font-sans">Domínio por Área</p>
        </div>
        <div className="px-3 py-1 bg-secondary/10 dark:bg-secondary/20 rounded-md border border-secondary/20 dark:border-secondary/30">
          <span className="text-[9px] font-black text-secondary dark:text-secondary-dark uppercase leading-none">Dados Reais</span>
        </div>
      </div>

      <div className="relative w-full aspect-square max-w-[200px]">
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          {gridLevels.map(level => (
            <polygon
              key={level}
              points={chartData.map((_, i) => {
                const angle = (Math.PI * 2 * i) / chartData.length - Math.PI / 2
                return `${100 + level * Math.cos(angle)},${100 + level * Math.sin(angle)}`
              }).join(' ')}
              className="fill-none stroke-border-custom stroke-[0.5]"
            />
          ))}
          {chartData.map((_, i) => {
            const angle = (Math.PI * 2 * i) / chartData.length - Math.PI / 2
            return (
              <line
                key={i}
                x1="100" y1="100"
                x2={100 + 80 * Math.cos(angle)}
                y2={100 + 80 * Math.sin(angle)}
                className="stroke-border-custom stroke-[0.5]"
              />
            )
          })}
          {chartData.map((d, i) => {
            const angle = (Math.PI * 2 * i) / chartData.length - Math.PI / 2
            const r = 95
            return (
              <text
                key={i}
                x={100 + r * Math.cos(angle)}
                y={100 + r * Math.sin(angle)}
                textAnchor="middle"
                className="text-[7px] font-black uppercase fill-text-muted tracking-tighter"
              >
                {d.subject}
              </text>
            )
          })}
          <motion.polygon
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            points={points}
            className="fill-primary/20 stroke-primary stroke-2"
          />
        </svg>
      </div>
    </div>
  )
}
