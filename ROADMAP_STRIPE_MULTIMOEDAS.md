# Roadmap: Integração Stripe & Multimoedas (USD/EUR/BRL)

Este documento resume o estado atual da implementação financeira e detalha os próximos passos para a ativação do Stripe como meio de pagamento automatizado.

## 1. Conclusões da Auditoria de Schema
- **Estado Atual**: Fases 1 e 2 concluídas. O banco de dados já possui suporte para preços fixos em Euro (€) e Dólar ($), além de uma infraestrutura de logs para auditoria.
- **Segurança**: As políticas de Row Level Security (RLS) foram refinadas para garantir que apenas gestores (Admin/Staff) visualizem logs financeiros.
- **Retrocompatibilidade**: A estrutura atual é 100% compatível com as vendas existentes em Real (BRL). Nenhuma funcionalidade ativa foi alterada.

## 2. O que já foi implementado
- [x] **Schema DB**: Novas colunas em `planos_cursos` e tabela `logs_transacoes`.
- [x] **Admin UI**: Campos de entrada para EUR e USD no modal de vínculo de cursos.
- [x] **Server Actions**: Atualização da lógica de salvamento para suportar multimoedas.

## 3. Próximos Passos (Standby)

### Fase 3: Integração Técnica Stripe
1. **Configuração de Ambiente**:
   - Instalar SDK: `npm install stripe`.
   - Adicionar chaves ao `.env.local`: `STRIPE_TEST_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`.
2. **Checkout Session**:
   - Criar Server Action para gerar a sessão de pagamento baseada na moeda selecionada pelo usuário.
3. **Webhook Handler**:
   - Desenvolver a rota `/api/webhooks/stripe` para processar eventos `checkout.session.completed`.
   - Implementar a liberação automática de matrícula após confirmação de pagamento.

### Fase 4: Refatoração da Experiência do Aluno
1. **Dinamismo no Checkout**:
   - Alterar o componente de checkout para carregar o preço da moeda correta do banco de dados (removendo cálculos manuais de câmbio).
2. **Fluxo Gratuito (Short-circuit)**:
   - Garantir que cursos com valor `0` ignorem o Stripe e ativem o acesso instantaneamente.

## 4. Como Testar (Modo Sandbox)
- Utilizar o **Stripe CLI** para simular eventos de webhook localmente.
- Usar cartões de teste do Stripe (ex: `4242 4242 4242 4242`) para validar fluxos de sucesso e falha.
- Monitorar a tabela `logs_transacoes` para verificar se os payloads estão sendo gravados corretamente.

---
**Status:** Em Standby (Pronto para retomada a partir da Fase 3).
