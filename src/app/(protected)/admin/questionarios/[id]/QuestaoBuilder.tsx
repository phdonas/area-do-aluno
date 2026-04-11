'use client'

import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, HelpCircle, Upload, FileText, X, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { 
  createQuestao, 
  updateQuestao, 
  deleteQuestao, 
  createAlternativa, 
  updateAlternativa, 
  deleteAlternativa,
  processCSVImport
} from '../actions'

type Alternativa = {
  id: string
  texto: string
  is_correta: boolean
  explicacao: string | null
  ordem: number
}

type Questao = {
  id: string
  enunciado: string
  tipo: string // 'escolha_simples', 'multipla_escolha', 'verdadeiro_falso'
  explicacao_correcao: string | null
  ordem: number
  alternativas: Alternativa[]
}

export function QuestaoBuilder({
  questionarioId,
  questoesIniciais
}: {
  questionarioId: string
  questoesIniciais: Questao[]
}) {
  const [questoes, setQuestoes] = useState<Questao[]>(questoesIniciais)
  const [loading, setLoading] = useState(false)
  const [showCSVModal, setShowCSVModal] = useState(false)
  const [csvText, setCsvText] = useState('')

  const handleCreateQuestao = async () => {
    setLoading(true)
    try {
      await createQuestao(questionarioId)
      // Recarregar para garantir consistência dos IDs e estrutura
      window.location.reload()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuestao = async (questaoId: string, payload: any) => {
    setQuestoes(prev => prev.map(q => q.id === questaoId ? { ...q, ...payload } : q))
    await updateQuestao(questaoId, { ...payload, questionarioId })
  }

  const handleDeleteQuestao = async (questaoId: string) => {
    if (!confirm('Excluir esta questão permanentemente?')) return
    setLoading(true)
    try {
      await deleteQuestao(questaoId, questionarioId)
      setQuestoes(prev => prev.filter(q => q.id !== questaoId))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlternativa = async (questaoId: string) => {
    setLoading(true)
    try {
      await createAlternativa(questaoId)
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAlternativa = async (questaoId: string, alternativaId: string, payload: any) => {
    // Atualização otimista
    setQuestoes(prev => prev.map(q => {
      if (q.id === questaoId) {
        return {
          ...q,
          alternativas: q.alternativas.map(a => a.id === alternativaId ? { ...a, ...payload } : a)
        }
      }
      return q
    }))
    try {
      await updateAlternativa(alternativaId, payload)
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message)
    }
  }

  const handleDeleteAlternativa = async (questaoId: string, alternativaId: string) => {
    setLoading(true)
    try {
      await deleteAlternativa(alternativaId)
      setQuestoes(prev => prev.map(q => {
        if (q.id === questaoId) {
          return {
            ...q,
            alternativas: q.alternativas.filter(a => a.id !== alternativaId)
          }
        }
        return q
      }))
    } finally {
      setLoading(false)
    }
  }

  const toggleCorreta = async (questaoId: string, alternativaId: string) => {
    const questao = questoes.find(q => q.id === questaoId)
    if (!questao) return

    setLoading(true)
    try {
      // Se for escolha simples ou V/F, garantimos que apenas uma seja correta
      if (questao.tipo === 'escolha_simples' || questao.tipo === 'verdadeiro_falso') {
        for (const alt of questao.alternativas) {
          const shouldBeCorreta = alt.id === alternativaId
          // Só fazemos o update se o estado atual for diferente do desejado
          if (alt.is_correta !== shouldBeCorreta) {
             await handleUpdateAlternativa(questaoId, alt.id, { is_correta: shouldBeCorreta })
          }
        }
      } else {
        // Múltipla escolha: apenas inverte a selecionada
        const alt = questao.alternativas.find(a => a.id === alternativaId)
        if (alt) {
          await handleUpdateAlternativa(questaoId, alt.id, { is_correta: !alt.is_correta })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImportCSV = async () => {
    if (!csvText.trim()) return
    setLoading(true)
    try {
      const lines = csvText.split('\n').filter(l => l.trim() !== '')
      // Pular cabeçalho se houver (detecção simples por ';')
      const dataRows = lines[0].toLowerCase().includes('pergunta') ? lines.slice(1) : lines
      
      const parsedData = dataRows.map(row => {
        const parts = row.split(';')
        // Layout: pergunta;tipo;explicacao_geral;alt1;alt1_correta;alt1_explicacao;alt2;alt2_correta;alt2_explicacao;...
        const alternativas = []
        for (let i = 3; i < parts.length; i += 3) {
          if (parts[i]) {
            alternativas.push({
              texto: parts[i],
              correta: parts[i+1]?.toLowerCase() === 'true' || parts[i+1] === '1' || parts[i+1]?.toLowerCase() === 'sim',
              explicacao: parts[i+2] || ''
            })
          }
        }
        return {
          enunciado: parts[0],
          tipo: parts[1] || 'escolha_simples',
          explicacao_geral: parts[2] || '',
          alternativas
        }
      })

      await processCSVImport(questionarioId, parsedData)
      window.location.reload()
    } catch (e) {
      alert('Erro ao importar CSV. Verifique o formato.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Botões Superiores */}
      <div className="flex justify-between items-center bg-surface p-4 rounded-2xl border border-border-custom px-6">
         <div className="text-sm font-bold text-text-primary">
            {questoes.length} Questões Configuradas
         </div>
         <button 
           onClick={() => setShowCSVModal(true)}
           className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl text-xs font-black transition-all border border-indigo-500/20"
         >
            <Upload className="w-3.5 h-3.5" /> Importar CSV
         </button>
      </div>

      {questoes.length === 0 ? (
        <div className="bg-surface/50 border border-dashed border-border-custom p-16 rounded-[40px] text-center text-text-muted flex flex-col items-center gap-4">
          <HelpCircle className="w-12 h-12 opacity-10" />
          <p className="font-bold">Nenhuma questão criada ainda.</p>
          <button 
            onClick={handleCreateQuestao}
            className="text-primary hover:underline font-black text-sm"
          >
            Clique aqui para adicionar a primeira
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {questoes.map((q, index) => (
            <div key={q.id} className="bg-surface border border-border-custom rounded-[32px] overflow-hidden shadow-sm relative group">
              
              {/* Badge de Ordem */}
              <div className="absolute top-6 -left-2 w-12 h-10 bg-primary text-white flex items-center justify-center font-black rounded-r-2xl shadow-lg z-10">
                 {index + 1}
              </div>

              <div className="p-4 pl-14 bg-background border-b border-border-custom flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Tipo de Resposta</span>
                      <select 
                        value={q.tipo}
                        onChange={(e) => handleUpdateQuestao(q.id, { tipo: e.target.value })}
                        className="bg-surface border border-border-custom rounded-xl px-4 py-1.5 text-xs text-primary font-black focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer pr-8"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0\' stroke=\'currentColor\' %3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}
                      >
                        <option value="escolha_simples">Escolha Simples (Radio)</option>
                        <option value="multipla_escolha">Múltipla Escolha (Checkbox)</option>
                        <option value="verdadeiro_falso">Verdadeiro ou Falso</option>
                      </select>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleDeleteQuestao(q.id)}
                    className="p-2 text-text-muted hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                    title="Excluir Questão"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-10">
                {/* Enunciado */}
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Enunciado da Pergunta</label>
                  <textarea
                    value={q.enunciado}
                    onChange={(e) => setQuestoes(prev => prev.map(pq => pq.id === q.id ? { ...pq, enunciado: e.target.value } : pq))}
                    onBlur={(e) => handleUpdateQuestao(q.id, { enunciado: e.target.value })}
                    rows={3}
                    placeholder="Ex: Qual o principal benefício do GLP?"
                    className="w-full bg-background border border-border-custom rounded-2xl px-6 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-lg leading-relaxed"
                  />
                </div>

                {/* Alternativas */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Caderno de Alternativas</label>
                    {q.tipo !== 'verdadeiro_falso' && (
                       <button 
                        onClick={() => handleCreateAlternativa(q.id)}
                        disabled={loading}
                        className="text-primary hover:text-primary-dark flex items-center gap-2 font-black text-[11px] uppercase tracking-wider bg-primary/5 px-4 py-1.5 rounded-full border border-primary/20 hover:border-primary/50 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Adicionar Opção
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {q.alternativas.length === 0 ? (
                      <div className="text-xs font-bold text-text-muted p-8 border border-dashed border-border-custom rounded-3xl text-center italic opacity-50">
                        Nenhuma alternativa adicionada.
                      </div>
                    ) : (
                      q.alternativas.map((alt, aIdx) => (
                        <div key={alt.id} className="bg-background/50 border border-border-custom p-6 rounded-[24px] space-y-4 transition-all hover:bg-background/80">
                           <div className="flex items-start gap-4">
                              <button 
                                type="button"
                                onClick={() => toggleCorreta(q.id, alt.id)}
                                className={`mt-2.5 transition-all transform hover:scale-110 ${alt.is_correta ? 'text-emerald-500' : 'text-text-muted hover:text-text-primary'}`}
                                title="Marcar como alternativa correta"
                              >
                                {alt.is_correta ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                              </button>
                              
                              <div className="flex-1 space-y-4">
                                 <input 
                                   type="text"
                                   value={alt.texto}
                                   onChange={(e) => setQuestoes(prev => prev.map(pq => {
                                     if (pq.id === q.id) {
                                       return {
                                         ...pq,
                                         alternativas: pq.alternativas.map(a => a.id === alt.id ? { ...a, texto: e.target.value } : a)
                                       }
                                     }
                                     return pq
                                   }))}
                                   onBlur={(e) => handleUpdateAlternativa(q.id, alt.id, { texto: e.target.value })}
                                   placeholder={`Opção ${aIdx + 1}...`}
                                   className={`w-full bg-surface border-2 transition-all px-4 py-2.5 rounded-xl text-sm font-bold text-text-primary focus:outline-none ${alt.is_correta ? 'border-emerald-500/30 focus:border-emerald-500' : 'border-transparent focus:border-primary'}`}
                                 />
                                 
                                 {/* Explicação Individual */}
                                 <div className="pl-2 border-l-2 border-border-custom/50">
                                    <div className="flex items-center gap-2 mb-2">
                                       <HelpCircle className="w-3 h-3 text-text-muted" />
                                       <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Por que esta opção {alt.is_correta ? 'é a correta' : 'está incorreta'}?</span>
                                    </div>
                                    <textarea 
                                      value={alt.explicacao || ''}
                                      onChange={(e) => setQuestoes(prev => prev.map(pq => {
                                        if (pq.id === q.id) {
                                          return {
                                            ...pq,
                                            alternativas: pq.alternativas.map(a => a.id === alt.id ? { ...a, explicacao: e.target.value } : a)
                                          }
                                        }
                                        return pq
                                      }))}
                                      onBlur={(e) => handleUpdateAlternativa(q.id, alt.id, { explicacao: e.target.value })}
                                      className="w-full bg-surface/50 border border-border-custom rounded-xl px-4 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary/50 transition-all resize-none"
                                      rows={1}
                                      placeholder="Feedback para o aluno..."
                                    />
                                 </div>
                              </div>

                              {q.tipo !== 'verdadeiro_falso' && (
                                <button 
                                  onClick={() => handleDeleteAlternativa(q.id, alt.id)}
                                  className="p-2 text-text-muted hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Explicação Geral */}
                <div className="pt-8 border-t border-border-custom">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Feedback Geral da Questão (Dica/Gabarito)</label>
                  <textarea
                    value={q.explicacao_correcao || ''}
                    onChange={(e) => setQuestoes(prev => prev.map(pq => pq.id === q.id ? { ...pq, explicacao_correcao: e.target.value } : pq))}
                    onBlur={(e) => handleUpdateQuestao(q.id, { explicacao_correcao: e.target.value })}
                    rows={2}
                    placeholder="Mostrado após todas as seleções serem feitas..."
                    className="w-full bg-background border border-border-custom rounded-2xl px-6 py-4 text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                  />
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão de Adicionar */}
      <button 
        type="button" 
        onClick={handleCreateQuestao}
        disabled={loading}
        className="w-full h-32 bg-surface/30 border-2 border-dashed border-border-custom hover:border-primary hover:bg-primary/5 hover:text-primary text-text-muted px-6 py-4 rounded-[40px] text-lg font-black flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 group mb-20"
      >
        <div className="w-12 h-12 rounded-full bg-background border border-border-custom flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
           <Plus className="w-6 h-6" />
        </div>
        Adicionar Nova Questão Manualmente
      </button>

      {/* Modal CSV */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="bg-surface border border-border-custom w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl relative"
           >
              <button 
                onClick={() => setShowCSVModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-background border border-border-custom hover:text-rose-500 transition-all"
              >
                 <X className="w-5 h-5" />
              </button>

              <div className="p-10 md:p-12">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500">
                       <FileText className="w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-text-primary tracking-tighter">Importar via CSV</h3>
                       <p className="text-sm text-text-secondary">Adicione centenas de questões de uma só vez utilizando o padrão de ponto e vírgula (;).</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Conteúdo do CSV</label>
                          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">Padrao: pergunta;tipo;explicacao;alt1;ok1;hint1;...</span>
                       </div>
                       <textarea 
                         value={csvText}
                         onChange={(e) => setCsvText(e.target.value)}
                         rows={12}
                         placeholder={`Pergunta 1?;escolha_simples;Feedback geral;Opção A;true;Dica de erro;Opção B;false;Dica de erro 2;\nPergunta 2?;verdadeiro_falso;Feedback 2;Verdadeiro;true;Correto;Falso;false;Incorreto;`}
                         className="w-full bg-background border border-border-custom rounded-2xl px-6 py-5 text-sm font-mono text-text-primary focus:outline-none focus:border-indigo-500 transition-all resize-none"
                       />
                    </div>

                    <div className="flex gap-4">
                       <button 
                         onClick={handleImportCSV}
                         disabled={loading || !csvText.trim()}
                         className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
                       >
                          {loading ? 'Processando...' : 'Confirmar Importação'}
                          <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="bg-background/50 border border-border-custom p-6 rounded-2xl">
                       <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Layout do CSV (Headers Opcionais)</h4>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-bold text-text-secondary font-mono">
                          <div className="flex flex-col gap-1"><span className="text-primary">id_pergunta</span>Enunciado</div>
                          <div className="flex flex-col gap-1"><span className="text-primary">tipo</span>escolha_simples | multipla_escolha | verdadeiro_falso</div>
                          <div className="flex flex-col gap-1"><span className="text-primary">explicacao</span>Feedback Geral</div>
                          <div className="flex flex-col gap-1"><span className="text-primary">trios</span>[Texto]; [TRUE/FALSE]; [Feedback Alternativa]</div>
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  )
}
