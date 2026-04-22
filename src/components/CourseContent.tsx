"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  CheckCircle2, 
  ListChecks, 
  Target, 
  Award, 
  ShieldCheck, 
  FileText,
  LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Target,
  Award,
  ShieldCheck,
  FileText,
  ListChecks
};

// Componente para Formatação de Texto (Markdown Lite)
export function FormattedText({ text, className = "" }: { text: string | null, className?: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Linhas Vazias -> Espaçadores
        if (!trimmed) return <div key={idx} className="h-4" />;

        // Cabeçalhos (Modernizados)
        if (line.startsWith('# ')) {
          return (
            <div key={idx} className="group/h mt-8 mb-4">
              <h2 className="text-2xl md:text-3xl font-black text-text-primary uppercase italic tracking-tighter flex items-center gap-4">
                <div className="w-1.5 h-8 bg-primary rounded-full transition-transform group-hover/h:scale-y-125" />
                {line.replace('# ', '')}
              </h2>
            </div>
          );
        }

        if (line.startsWith('## ')) {
          return <h3 key={idx} className="text-lg md:text-xl font-black text-primary uppercase italic tracking-tight mt-6 mb-2 border-b border-primary/10 pb-2">{line.replace('## ', '')}</h3>;
        }

        // Listas Estilizadas (Bento Style)
        if (trimmed.startsWith('- ')) {
          const content = processBold(line.replace('- ', ''));
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-4 items-start bg-foreground/[0.02] border border-foreground/[0.05] p-5 rounded-3xl hover:bg-foreground/[0.04] transition-colors group/item"
            >
              <div className="p-2 bg-primary/10 rounded-xl group-hover/item:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="text-inherit leading-relaxed pt-1.5">{content}</div>
            </motion.div>
          );
        }

        // Citações ou Destaques
        if (line.startsWith('> ')) {
             return (
               <blockquote key={idx} className="pl-6 border-l-4 border-emerald-500 italic text-xl font-medium text-emerald-600/80 my-6">
                  {processBold(line.replace('> ', ''))}
               </blockquote>
             )
        }

        return (
          <p key={idx} className="text-inherit leading-relaxed py-1">
            {processBold(line)}
          </p>
        );
      })}
    </div>
  );
}

// Helper para inverter **text** em <strong>text</strong>
function processBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-extrabold text-text-primary">{part}</strong> : part));
}

// Componente de Seção Expansível para Texto Longo
export function ExpandableContent({ 
  title, 
  text, 
  iconName = "ListChecks", 
  color = "primary" 
}: { 
  title: string, 
  text: string | null, 
  iconName?: string, 
  color?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!text) return null;

  const Icon = iconMap[iconName] || ListChecks;

  const colorVariants: Record<string, string> = {
    primary: "bg-primary/10 text-primary ring-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 ring-indigo-500/20",
  };

  const selectedColor = colorVariants[color] || colorVariants.primary;

  return (
    <div className={`overflow-hidden border border-foreground/5 rounded-[2.5rem] bg-foreground/[0.02] transition-all hover:bg-foreground/[0.03] ${isOpen ? 'ring-2 ring-primary/20 bg-foreground/[0.04]' : ''}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between group transition-all"
      >
        <div className="flex items-center gap-6">
           <div className={`p-4 rounded-[1.5rem] transition-transform group-hover:scale-110 ${selectedColor}`}>
              <Icon className="w-6 h-6" />
           </div>
           <h3 className="text-xl md:text-2xl font-black text-text-primary uppercase italic tracking-widest text-left">{title}</h3>
        </div>
        <div className={`p-2 rounded-full border border-foreground/10 transition-transform ${isOpen ? 'rotate-180 bg-primary/10 border-primary/20 text-primary' : 'text-text-muted'}`}>
           <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-8 pt-0 border-t border-foreground/5 ring-inset ring-1 ring-foreground/5">
               <div className="mt-8">
                  <FormattedText text={text} className="text-base md:text-lg" />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente de Card de Conteúdo Suave (Estilo Moderno baseado no Admin)
export function SoftCard({ children, className = "", color = "primary" }: { children: React.ReactNode, className?: string, color?: 'primary' | 'emerald' | 'amber' | 'slate' }) {
  const colorMap = {
    primary: "bg-primary/[0.03] border-primary/10 backdrop-blur-sm",
    emerald: "bg-emerald-500/[0.03] border-emerald-500/10 backdrop-blur-sm",
    amber: "bg-amber-500/[0.03] border-amber-500/10 backdrop-blur-sm",
    slate: "bg-surface/60 border-border-custom/50 backdrop-blur-md"
  }

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colorMap[color]} shadow-sm transition-all hover:shadow-md ${className}`}>
      {children}
    </div>
  )
}
