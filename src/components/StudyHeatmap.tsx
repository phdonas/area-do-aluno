'use client'

import { motion } from 'framer-motion'
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface StudyHeatmapProps {
  activityData: Record<string, number> // Mapa de YYYY-MM-DD -> quantidade de aulas
}

export function StudyHeatmap({ activityData }: StudyHeatmapProps) {
  // Gera os últimos 120 dias para preencher o grid (ajustado para visual de calendário)
  const daysToShow = 119 // 17 semanas
  const lastDays = eachDayOfInterval({
    start: subDays(new Date(), daysToShow),
    end: new Date(),
  })

  // Agrupa por semanas para o visual de colunas do GitHub
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  lastDays.forEach((day, index) => {
    currentWeek.push(day);
    if (day.getDay() === 6 || index === lastDays.length - 1) { // Sábado ou último dia
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="bg-slate-500/10 dark:bg-slate-50/90 border border-slate-500/20 dark:border-slate-200 rounded-xl p-8 flex flex-col shadow-sm backdrop-blur-sm h-full overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground dark:text-slate-950 font-display">Consistência de Acesso</h3>
          <p className="text-[10px] text-text-muted dark:text-slate-800/60 mt-1 font-bold uppercase tracking-widest font-sans">Atividade nos últimos meses</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/5 dark:bg-primary/20 rounded-full border border-primary/10 dark:border-primary/30">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <span className="text-[9px] font-black text-primary dark:text-primary uppercase tracking-widest leading-none">Sincronizado</span>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-4 custom-scrollbar-thin">
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-1.5 flex-shrink-0">
            {week.map((date, dIndex) => {
              const dateKey = format(date, 'yyyy-MM-dd')
              const count = activityData[dateKey] || 0
              
              let levelColor = 'bg-background border-border-custom/30'
              if (count > 0) levelColor = 'bg-primary/20 border-primary/20'
              if (count > 2) levelColor = 'bg-primary/50 border-primary/40'
              if (count >= 5) levelColor = 'bg-primary border-primary/60 shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]'

              return (
                <motion.div
                  key={dateKey}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (wIndex * 7 + dIndex) * 0.002 }}
                  className={`w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 cursor-help relative group ${levelColor}`}
                >
                  {/* Tooltip customizado */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-black text-[9px] font-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-50 pointer-events-none shadow-2xl border border-white/5">
                    {count} {count === 1 ? 'aula' : 'aulas'} em {format(date, "dd 'de' MMM", { locale: ptBR })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border-custom border-dashed pt-6">
         <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest text-text-muted">
            <span>Menos</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-background border border-border-custom/30" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary/20" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/50 border border-primary/40" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary border border-primary/60" />
            </div>
            <span>Mais</span>
         </div>
         
         <div className="flex gap-6">
            <div className="text-right">
               <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total de Aulas</p>
               <p className="text-sm font-black text-text-primary">{Object.values(activityData).reduce((a, b) => a + b, 0)}</p>
            </div>
         </div>
      </div>
    </div>
  )
}
