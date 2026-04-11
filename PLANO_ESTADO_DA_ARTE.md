# 🏆 Plano de Implementação: Estado da Arte (v1.0)

Este documento estabelece o roteiro para transformar a **Área do Aluno** em uma plataforma de aprendizado de classe mundial. O plano foca em personalização, utilidade prática e retenção extrema.

---

### 🚀 Fases de Implementação

#### **Fase 1: Infraestrutura UX e "Quick Wins"**
*Objetivo: Elevar a percepção de qualidade imediata e facilidade de uso.*
1.  **Central de Comando (Cmd+K):** Implementação de um buscador global (KBar) para acesso instantâneo a aulas, simuladores e ferramentas.
2.  **Modo Foco no Player:** Interface minimalista para consumo de vídeo, inspirada na Masterclass.
3.  **Setup PWA (Mobile App):** Configuração para que o aluno instale a plataforma como um ícone no celular, com carregamento instantâneo.

#### **Fase 2: Visualização de Performance (Data-Viz)**
*Objetivo: Tornar o progresso do aluno "vísivel" e gratificante.*
1.  **Radar de Competências:** Gráfico interativo no dashboard cruzando dados de aulas assistidas + resultados de simuladores IA.
2.  **Heatmap de Estudo:** Calendário estilo GitHub para visualizar a consistência diária e gerar "loss aversion" (não querer quebrar a sequência).
3.  **Estatísticas de Tempo:** Total de horas investidas vs. benchmarck da turma.

#### **Fase 3: Inteligência de Recomendação (Dashboard Preditivo)**
*Objetivo: Usar IA para guiar o aluno e evitar a paralisia de escolha.*
1.  **Widget "Seu Próximo Passo":** Lógica no backend que sugere a aula ideal baseada no pilar de menor pontuação no Radar de Competências.
2.  **Sugestão de Vitrine Contextual:** Se o aluno falha em um simulador de "Vendas", a vitrine destaca o curso de "Fechamento de Negócios" com prioridade.

#### **Fase 4: Ecossistema SaaS (Micro-Apps)**
*Objetivo: Transformar o LMS em uma ferramenta de trabalho diário.*
1.  **Central de Ferramentas:** Dashboard dedicado a simuladores de ROI, calculadoras de impostos (portugal/brasil) ou geradores de prompts, integrados ao login do aluno.
2.  **Integração de Workspace:** Permitir que o aluno anote "insights" durante a aula que são salvos em um banco de dados pessoal exportável.

#### **Fase 5: Retenção Científica e Social**
*Objetivo: Garantir que o aluno aprenda de verdade e se sinta parte de algo.*
1.  **Engine de Revisão Espaçada (SM-2):** Algoritmo que "acorda" aulas antigas no dashboard quando o esquecimento é iminente.
2.  **Feed de Prova Social:** Notificações discretas de "conquistas da comunidade" para gerar motivação extrínseca.

---

### 🛡️ Considerações Técnicas Progressivas

*   **Performance:** Uso intensivo de *Skeleton Screens* e *Server Components* para manter o dashboard rápido mesmo com gráficos complexos.
*   **Segurança:** Toda a lógica de IA e Ferramentas protegida pela nossa nova estrutura de Middleware.
*   **Escalabilidade:** Banco de dados (Supabase) configurado com índices específicos para os logs de performance.

---
**Versão:** 1.0 - Abril 2026
**Autor:** Antigravity AI
