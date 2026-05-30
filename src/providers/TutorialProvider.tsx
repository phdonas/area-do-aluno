'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Joyride, EventData, STATUS, Step } from 'react-joyride'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registrarTutorialConcluido } from './tutorial-actions'

type TutorialContextType = {
  startTutorial: () => void;
  isActive: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [run, setRun] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(true) // Inicialmente inativo até carregar dados
  const [steps, setSteps] = useState<Step[]>([])
  const supabase = createClient()

  // 1. Busca no Supabase se o usuário logado concluiu o tutorial
  useEffect(() => {
    async function checkTutorialStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: userData } = await supabase
          .from('usuarios')
          .select('tutorial_concluido')
          .eq('id', user.id)
          .single()

        if (userData) {
          const concluido = !!userData.tutorial_concluido
          setHasCompleted(concluido)
          // Se ainda não concluiu, iniciamos automaticamente
          if (!concluido) {
            setRun(true)
          }
        }
      } catch (err) {
        console.error('Erro ao verificar status do tutorial:', err)
      }
    }
    checkTutorialStatus()
  }, [supabase])

  // 2. Mapeamento de Etapas (Steps) baseado no Roteiro do Aluno
  useEffect(() => {
    if (hasCompleted) {
      setSteps([])
      return
    }

    const allSteps: { [key: string]: Step[] } = {
      '/vitrine': [
        {
          target: '#tutorial-hero',
          title: '🏆 Bem-vindo à PHD Academy!',
          content: 'Aqui você encontra nossos treinamentos de alta performance comercial e materiais gratuitos.',
          skipBeacon: true,
          placement: 'bottom',
        },
        {
          target: '#tutorial-cursos',
          title: '📚 Nossos Treinamentos',
          content: 'Clique aqui para conhecer o conteúdo detalhado de um curso ou iniciar seu checkout de forma imediata.',
          placement: 'top',
        }
      ],
      '/catalogo': [
        {
          target: '#tutorial-hero',
          title: '🏆 Bem-vindo à PHD Academy!',
          content: 'Aqui você encontra nossos treinamentos de alta performance comercial e materiais gratuitos.',
          skipBeacon: true,
          placement: 'bottom',
        },
        {
          target: '#tutorial-cursos',
          title: '📚 Nossos Treinamentos',
          content: 'Clique aqui para conhecer o conteúdo detalhado de um curso ou iniciar seu checkout de forma imediata.',
          placement: 'top',
        }
      ],
      '/dashboard': [
        {
          target: '#tutorial-boasvindas',
          title: '⚡ Quartel-General de Estudos',
          content: 'Seja muito bem-vindo! Aqui você visualiza suas atividades diárias e acompanha seu progresso.',
          skipBeacon: true,
          placement: 'bottom',
        },
        {
          target: '#tutorial-streak',
          title: '🔥 Fogo do Streak!',
          content: 'O foguinho mostra o seu Streak diário. Estude todos os dias seguidos para manter sua sequência acesa e acumular PHD Coins!',
          placement: 'bottom',
        },
        {
          target: '#tutorial-continuar',
          title: '🚀 De Onde Parou',
          content: 'Nós salvamos exatamente seu ponto de estudo anterior. Clique aqui para pular direto para a sua última aula assistida.',
          placement: 'right',
        }
      ],
      '/onboarding/perfil-profissional': [
        {
          target: '#tutorial-onboarding-campos',
          title: '📋 Conhecendo Seu Perfil',
          content: 'Preencha seu cargo, tempo de experiência e segmento profissional para adaptarmos a experiência ao seu cenário real.',
          skipBeacon: true,
          placement: 'bottom',
        },
        {
          target: '#tutorial-onboarding-seguranca',
          title: '🔒 Inteligência Artificial Protegida',
          content: 'Esses dados servem para que a nossa IA gere exemplos e roteiros de vendas sob medida para o seu setor de atuação.',
          placement: 'top',
        }
      ],
      '/loja': [
        {
          target: '#tutorial-loja-descoberta',
          title: '🛍️ Expandindo Conhecimentos',
          content: 'Quer ir mais a fundo? Aqui você descobre novos módulos, pacotes premium e mentorias disponíveis.',
          skipBeacon: true,
          placement: 'bottom',
        },
        {
          target: '#tutorial-loja-moeda',
          title: '🌍 Moeda Inteligente',
          content: 'Os valores são convertidos e adaptados automaticamente de acordo com o seu país (BRL, USD ou EUR).',
          placement: 'top',
        }
      ],
      '/simuladores': [
        {
          target: '#tutorial-simuladores-conhecimento',
          title: '🤖 Simuladores Baseados em IA',
          content: 'Coloque em prática o que assistiu! Teste argumentos de vendas, simule negociações difíceis ou realize testes objetivos.',
          skipBeacon: true,
          placement: 'top',
        }
      ]
    }

    // Mapeamento dinâmico para o Player de Aula
    if (pathname?.startsWith('/player/')) {
      setSteps([
        {
          target: '#tutorial-video',
          title: '🎥 Dê o Play!',
          content: 'Assista à aula com player de alta resolução. Salvamos seu progresso no banco a cada 30 segundos automaticamente.',
          skipBeacon: true,
          placement: 'bottom',
        },
        {
          target: '#tutorial-ferramentas',
          title: '🛠️ Ferramentas & Apoios',
          content: 'Abaixo do vídeo, acesse PDFs, templates estruturados e simuladores atrelados diretamente a este módulo.',
          placement: 'top',
        },
        {
          target: '#tutorial-insights',
          title: '💡 Seus Insights de Vendas',
          content: 'Escreva suas principais sacadas! Suas anotações ficam gravadas e linkadas a esta aula específica para consultas futuras.',
          placement: 'top',
        },
        {
          target: '#tutorial-conclusao',
          title: '✅ Concluir Etapa',
          content: 'Ao terminar, não se esqueça de marcar a aula como concluída. Isso avança seu progresso e rende PHD Coins!',
          placement: 'left',
        }
      ])
    } else {
      const activePathSteps = allSteps[pathname || ''] || []
      setSteps(activePathSteps)
    }

  }, [pathname, hasCompleted])

  const handleJoyrideCallback = async (data: EventData) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setRun(false)
      setHasCompleted(true)
      
      // Persiste a conclusão no Supabase Admin
      const res = await registrarTutorialConcluido()
      if (res.success) {
        console.log('✅ Tutorial concluído registrado com sucesso!')
      } else {
        console.error('❌ Falha ao salvar progresso do tutorial:', res.error)
      }
    }
  }

  const startTutorial = () => {
    setHasCompleted(false)
    setRun(true)
  }

  return (
    <TutorialContext.Provider value={{ startTutorial, isActive: run }}>
      {children}
      {run && steps.length > 0 && (
        <Joyride
          steps={steps}
          run={run}
          continuous
          onEvent={handleJoyrideCallback}
          locale={{
            back: 'Voltar',
            close: 'Fechar',
            last: 'Concluir Tour',
            next: 'Próximo',
            open: 'Abrir',
            skip: 'Pular Tour'
          }}
          options={{
            arrowColor: '#1e293b',
            backgroundColor: '#0f172a', // Slate escuro premium
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            primaryColor: '#3b82f6', // Azul PHD
            textColor: '#f8fafc',
            zIndex: 10000,
            showProgress: true,
            buttons: ['back', 'close', 'primary', 'skip'],
          }}
          styles={{
            tooltipContainer: {
              textAlign: 'left',
              fontFamily: 'inherit',
              borderRadius: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '1.25rem',
            },
            tooltipContent: {
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: '1.6',
              color: '#cbd5e1',
              padding: '0.5rem 0 1rem 0'
            },
            tooltipTitle: {
              fontSize: '15px',
              fontWeight: '900',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              textTransform: 'uppercase',
              fontStyle: 'italic',
            },
            buttonPrimary: {
              backgroundColor: '#3b82f6',
              borderRadius: '0.75rem',
              fontFamily: 'inherit',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0.6rem 1.2rem',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            },
            buttonBack: {
              marginRight: '1rem',
              color: '#94a3b8',
              fontFamily: 'inherit',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            },
            buttonSkip: {
              color: '#ef4444',
              fontFamily: 'inherit',
              fontSize: '10px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }
          }}
        />
      )}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial deve ser usado dentro de um TutorialProvider')
  }
  return context
}
