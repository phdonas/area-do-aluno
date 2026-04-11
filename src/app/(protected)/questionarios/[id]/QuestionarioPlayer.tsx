'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronRight, HelpCircle, Trophy, RotateCcw, AlertTriangle, ChevronLeft, XCircle, Info } from 'lucide-react'
import Link from 'next/link'

interface QuestionarioPlayerProps {
  questionario: any
  questoes: any[]
}

export function QuestionarioPlayer({ questionario, questoes }: QuestionarioPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0) // 0: Start, 1: Questions, 2: Result, 3: Review
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({}) // string for simple, string[] for multiple
  const [showFeedback, setShowFeedback] = useState(false)
  
  const currentQuestion = questoes[currentQuestionIndex]
  const totalQuestions = questoes.length
  
  const handleSelect = (alternativaId: string) => {
    if (currentQuestion.tipo === 'multipla_escolha') {
      const currentAnswers = (answers[currentQuestion.id] as string[]) || []
      if (currentAnswers.includes(alternativaId)) {
        setAnswers({ ...answers, [currentQuestion.id]: currentAnswers.filter(id => id !== alternativaId) })
      } else {
        setAnswers({ ...answers, [currentQuestion.id]: [...currentAnswers, alternativaId] })
      }
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: alternativaId })
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setCurrentStep(2)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Cálculos de Resultado
  const calculateResult = () => {
    let score = 0
    questoes.forEach(q => {
      const userAnswer = answers[q.id]
      const correctAlts = q.alternativas.filter((a: any) => a.is_correta).map((a: any) => a.id)
      
      if (q.tipo === 'multipla_escolha') {
        const userAlts = (userAnswer as string[]) || []
        // Pontua apenas se acertar todas exatamente? Ou parcial? Geralmente é tudo ou nada.
        const isExactlyCorrect = 
          userAlts.length === correctAlts.length && 
          userAlts.every(id => correctAlts.includes(id))
        if (isExactlyCorrect) score++
      } else {
        if (userAnswer === correctAlts[0]) {
           score++
        }
      }
    })
    
    const percentage = Math.round((score / totalQuestions) * 100)
    const passed = percentage >= (questionario.nota_corte || 70)
    
    return { score, percentage, passed }
  }

  const result = currentStep >= 2 ? calculateResult() : null

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0 py-8 min-h-[85vh] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        
        {/* Passo 0: INTRODUÇÃO */}
        {currentStep === 0 && (
          <motion.div 
             key="intro"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0. scale: 0.9 }}
             className="bg-surface border border-border-custom p-10 md:p-16 rounded-[48px] text-center shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <HelpCircle className="w-32 h-32" />
             </div>
             
             <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8">
                <HelpCircle className="w-10 h-10" />
             </div>
             
             <h1 className="text-4xl font-black text-text-primary tracking-tighter mb-4">{questionario.titulo}</h1>
             <p className="text-text-secondary text-base mb-10 max-w-lg mx-auto leading-relaxed">
               {questionario.descricao || 'Este questionário avaliará seus conhecimentos sobre o conteúdo estudado. Leia as questões com atenção.'}
             </p>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
                <div className="bg-background border border-border-custom p-5 rounded-[24px]">
                   <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Questões</div>
                   <div className="text-2xl font-black text-text-primary">{totalQuestions}</div>
                </div>
                <div className="bg-background border border-border-custom p-5 rounded-[24px]">
                   <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Aprovação</div>
                   <div className="text-2xl font-black text-primary">{questionario.nota_corte || 70}%</div>
                </div>
                <div className="bg-background border border-border-custom p-5 rounded-[24px] col-span-2 md:col-span-1">
                   <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Dificuldade</div>
                   <div className="text-2xl font-black text-indigo-500">Média</div>
                </div>
             </div>
             
             <button 
                onClick={() => setCurrentStep(1)}
                className="w-full md:w-fit px-16 py-6 bg-primary hover:bg-primary-dark text-white font-black rounded-[28px] transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 mx-auto text-xl group"
             >
                Iniciar Avaliação
                <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
             </button>
          </motion.div>
        )}

        {/* Passo 1: QUESTÕES */}
        {currentStep === 1 && currentQuestion && (
          <motion.div 
             key={`q-${currentQuestionIndex}`}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="bg-surface border border-border-custom p-8 md:p-14 rounded-[40px] shadow-sm relative"
          >
             {/* Info Bar */}
             <div className="flex items-center justify-between gap-6 mb-12">
                <div className="flex-1">
                   <div className="flex justify-between items-end mb-3">
                       <span className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Progresso: {currentQuestionIndex + 1} / {totalQuestions}</span>
                       <span className="text-xs font-black text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
                   </div>
                   <div className="h-2 bg-background border border-border-custom rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }} />
                   </div>
                </div>
             </div>

             <div className="mb-10 text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {currentQuestion.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : currentQuestion.tipo === 'verdadeiro_falso' ? 'Verdadeiro ou Falso' : 'Escolha Simples'}
             </div>

             <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight mb-12 leading-[1.2]">
                {currentQuestion.enunciado || currentQuestion.texto}
             </h2>

             <div className="grid grid-cols-1 gap-4 mb-14">
                {currentQuestion.alternativas?.map((alt: any) => {
                  const isSelected = currentQuestion.tipo === 'multipla_escolha' 
                    ? (answers[currentQuestion.id] as string[])?.includes(alt.id)
                    : answers[currentQuestion.id] === alt.id
                  
                  return (
                    <button
                      key={alt.id}
                      onClick={() => handleSelect(alt.id)}
                      className={`w-full text-left p-6 md:px-8 md:py-6 rounded-[28px] border-2 transition-all flex items-center gap-6 group relative overflow-hidden ${
                        isSelected 
                        ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5 translate-x-2' 
                        : 'border-border-custom hover:border-text-muted hover:bg-background'
                      }`}
                    >
                      <div className={`w-10 h-10 shrink-0 border-2 rounded-2xl flex items-center justify-center transition-all ${
                         isSelected ? 'bg-primary border-primary text-white scale-110 rotate-3' : 'border-border-custom bg-surface group-hover:border-text-muted'
                      }`}>
                         {currentQuestion.tipo === 'multipla_escolha' 
                           ? (isSelected ? <CheckCircle2 className="w-6 h-6" /> : null)
                           : (isSelected ? <div className="w-3 h-3 rounded-full bg-white animate-pop" /> : null)
                         }
                      </div>
                      <span className={`text-base md:text-lg font-bold flex-1 ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                        {alt.texto}
                      </span>
                    </button>
                  )
                })}
             </div>

             <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-border-custom">
                <button 
                   onClick={prevQuestion}
                   disabled={currentQuestionIndex === 0}
                   className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-border-custom hover:border-primary/50 text-text-secondary font-black text-sm transition-all disabled:opacity-0 active:scale-95"
                >
                   <ChevronLeft className="w-5 h-5" />
                   Anterior
                </button>
                
                <button 
                   onClick={nextQuestion}
                   disabled={!answers[currentQuestion.id] || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)}
                   className="w-full md:w-fit px-16 py-5 bg-primary hover:bg-primary-dark disabled:bg-primary/20 text-white font-black rounded-2xl transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 disabled:scale-100"
                >
                   {currentQuestionIndex === totalQuestions - 1 ? 'Ver Resultado' : 'Próxima Questão'}
                   <ChevronRight className="w-6 h-6" />
                </button>
             </div>
          </motion.div>
        )}

        {/* Passo 2: RESULTADO */}
        {currentStep === 2 && result && (
           <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface border border-border-custom p-10 md:p-16 rounded-[56px] text-center shadow-2xl relative overflow-hidden"
           >
              {result.passed && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />}
              {!result.passed && <div className="absolute inset-0 bg-rose-500/5 animate-pulse" />}
              
              <div className={`w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-10 relative z-10 transition-all ${
                 result.passed 
                 ? 'bg-emerald-500/15 text-emerald-500 rotate-12' 
                 : 'bg-rose-500/15 text-rose-500 -rotate-12'
              }`}>
                 {result.passed ? <Trophy className="w-16 h-16" /> : <AlertTriangle className="w-16 h-16" />}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter mb-6 relative z-10">
                 {result.passed ? 'Excelente!' : 'Tente mais uma vez.'}
              </h1>
              
              <div className="bg-background/80 backdrop-blur inline-flex items-center gap-6 px-10 py-6 rounded-[32px] border border-border-custom mb-12 relative z-10">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Sua Nota</p>
                    <p className={`text-4xl font-black ${result.passed ? 'text-emerald-500' : 'text-rose-500'}`}>{result.percentage}%</p>
                 </div>
                 <div className="w-px h-10 bg-border-custom" />
                 <div className="text-center">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Meta</p>
                    <p className="text-4xl font-black text-text-muted">{questionario.nota_corte || 70}%</p>
                 </div>
              </div>

              <div className="space-y-4 max-w-md mx-auto relative z-10">
                 <button 
                   onClick={() => setCurrentStep(3)}
                   className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white font-black rounded-2xl transition-all border border-indigo-500/20"
                 >
                    <Info className="w-5 h-5" />
                    Revisar Respostas & Erros
                 </button>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => {
                            setCurrentStep(1)
                            setCurrentQuestionIndex(0)
                            setAnswers({})
                        }}
                        className="flex items-center justify-center gap-3 py-5 bg-background border border-border-custom hover:border-primary/50 text-text-primary font-black rounded-2xl transition-all text-sm"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Reiniciar
                    </button>
                    
                    <Link 
                        href="/dashboard"
                        className="flex items-center justify-center gap-3 py-5 bg-primary hover:bg-primary-dark text-white font-black rounded-2xl shadow-2xl shadow-primary/20 transition-all text-sm"
                    >
                        Concluído
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                 </div>
              </div>
           </motion.div>
        )}

        {/* Passo 3: REVISÃO DETALHADA */}
        {currentStep === 3 && (
           <motion.div 
             key="review"
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-8 pb-12"
           >
              <div className="flex items-center justify-between bg-surface border border-border-custom p-8 rounded-[32px] shadow-sm">
                 <div>
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">Revisão de Desempenho</h2>
                    <p className="text-sm text-text-muted font-bold">Veja onde você acertou e o que pode melhorar.</p>
                 </div>
                 <button 
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-background border border-border-custom rounded-2xl font-black text-xs hover:text-primary transition-all"
                 >
                   Voltar ao Resumo
                 </button>
              </div>

              <div className="space-y-12">
                 {questoes.map((q, qIdx) => {
                    const userAnswer = answers[q.id]
                    const correctAlts = q.alternativas.filter((a: any) => a.is_correta).map((a: any) => a.id)
                    let isCorrect = false
                    
                    if (q.tipo === 'multipla_escolha') {
                       const userAlts = (userAnswer as string[]) || []
                       isCorrect = userAlts.length === correctAlts.length && userAlts.every(id => correctAlts.includes(id))
                    } else {
                       isCorrect = userAnswer === correctAlts[0]
                    }

                    return (
                       <div key={q.id} className="bg-surface border border-border-custom rounded-[40px] overflow-hidden shadow-sm">
                          <div className={`p-4 px-8 border-b border-border-custom text-xs font-black uppercase tracking-widest flex items-center justify-between ${isCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                             <span>Questão {qIdx + 1}</span>
                             <span className="flex items-center gap-2">{isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {isCorrect ? 'Correta' : 'Incorreta'}</span>
                          </div>
                          
                          <div className="p-8 md:p-12 space-y-8">
                             <h3 className="text-xl font-bold text-text-primary leading-relaxed">{q.enunciado || q.texto}</h3>
                             
                             <div className="space-y-3">
                                {q.alternativas.map((alt: any) => {
                                   const isSelected = q.tipo === 'multipla_escolha' 
                                     ? (userAnswer as string[])?.includes(alt.id)
                                     : userAnswer === alt.id
                                   
                                   const borderClass = alt.is_correta 
                                     ? 'border-emerald-500/50 bg-emerald-500/5' 
                                     : isSelected ? 'border-rose-500/50 bg-rose-500/5' : 'border-border-custom opacity-70'

                                   return (
                                      <div key={alt.id} className={`p-5 rounded-2xl border-2 transition-all ${borderClass}`}>
                                         <div className="flex items-center gap-4">
                                            <div className="shrink-0">
                                               {alt.is_correta ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : isSelected ? <XCircle className="w-5 h-5 text-rose-500" /> : <Circle className="w-5 h-5 text-text-muted" />}
                                            </div>
                                            <div className="flex-1">
                                               <p className={`text-sm font-bold ${alt.is_correta ? 'text-emerald-700' : isSelected ? 'text-rose-700' : 'text-text-secondary'}`}>{alt.texto}</p>
                                               {alt.explicacao && (isSelected || alt.is_correta) && (
                                                  <p className="mt-2 text-xs font-medium text-text-muted border-t border-border-custom/50 pt-2 italic">
                                                     {alt.explicacao}
                                                  </p>
                                               )}
                                            </div>
                                         </div>
                                      </div>
                                   )
                                })}
                             </div>

                             {q.explicacao_correcao && (
                                <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
                                   <div className="flex items-center gap-2 mb-2 text-indigo-500">
                                      <HelpCircle className="w-4 h-4" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Feedback Adicional</span>
                                   </div>
                                   <p className="text-sm font-medium text-text-secondary italic">{q.explicacao_correcao}</p>
                                </div>
                             )}
                          </div>
                       </div>
                    )
                 })}
              </div>

              <button 
                onClick={() => setCurrentStep(2)}
                className="w-full py-6 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all"
              >
                 Voltar ao Resultado Final
              </button>
           </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
