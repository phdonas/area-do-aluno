'use client'

import { motion } from 'framer-motion'
import { Award, Zap, Star, Shield, Trophy } from 'lucide-react'

interface Badge {
  badge_key: string
  badge_nome: string
  conquistado_em: string
}

interface BadgesGroupProps {
  badges: Badge[]
}

const BADGE_ICONS: Record<string, any> = {
  'primeiros_passos': Award,
  'semana_perfeita': FlameIcon,
  'constancia_total': Shield,
  'curso_concluido': Trophy,
  'default': Star
}

function FlameIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

export function BadgesGroup({ badges }: BadgesGroupProps) {
  return (
    <div className="bg-accent/10 dark:bg-rose-50/90 border border-accent/20 dark:border-rose-200 rounded-xl p-8 h-full flex flex-col shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground dark:text-rose-950 font-display">Conquistas Recentes</h3>
          <p className="text-[10px] text-text-muted dark:text-rose-900/60 uppercase tracking-wider font-bold">Últimos Badges</p>
        </div>
        <Award className="w-5 h-5 text-primary dark:text-rose-600 opacity-50" />
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-center flex-grow">
        {badges.length > 0 ? (
          badges.map((badge, idx) => {
            const Icon = BADGE_ICONS[badge.badge_key] || BADGE_ICONS['default']
            return (
              <motion.div
                key={badge.badge_key}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: idx * 0.1, type: 'spring' }}
                className="group relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/20 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-help">
                  <Icon className="w-8 h-8 text-white group-hover:text-secondary transition-colors" />
                </div>
                
                {/* Tooltip basic */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {badge.badge_nome}
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-dashed border-border/50 flex items-center justify-center">
              <Star className="w-8 h-8 text-text-muted/20" />
            </div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-tight">
              Sua primeira conquista<br/>está a uma aula de distância.
            </p>
          </div>
        )}
      </div>

      {badges.length > 0 && (
         <div className="mt-8 pt-6 border-t border-border/50 flex justify-center">
           <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors flex items-center gap-2">
             Ver Todas as Conquistas
           </button>
         </div>
      )}
    </div>
  )
}
