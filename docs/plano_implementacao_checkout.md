# 💰 Plano de Implementação: Checkout Industrial (PH LMS)
**Status**: Planejamento / Design UI
**Objetivo**: Automatizar a venda de cursos e ferramentas com liberação imediata de acesso.

## 1. Arquitetura de Dados (Database)
- [ ] Adicionar `price_real` (number) e `price_id_gateway` (string) na tabela `cursos`.
- [ ] Adicionar `price_real` (number) e `price_id_gateway` (string) na tabela `planos`.
- [ ] Criar log de transações `vendas_historico` (usuario_id, produto_id, tipo, status, gateway_id, valor).

## 2. Integração Financeira (Gateway)
- **Gateway**: Stripe (Recomendado) ou MercadoPago (Pix).
- **Checkout Type**: Stripe Hosted Checkout (Seguro e Conversivo).
- **Webhooks**: Rota `/api/webhooks/payment` para escuta de confirmações.

## 3. Interface do Aluno (UX/UI)
- [x] **Página de Resumo do Pedido**: Confirmação do produto, bônus e preço. (Implementando)
- [ ] **Integração com Catálogo**: Botão "Quero este curso" que dispara a `checkout-session`.
- [ ] **Páginas de Sucesso/Erro**: Telas de boas-vindas pós-pagamento.

## 4. Fluxo de Automação (Backend)
- [ ] Server Action: `initiateCheckout(productId, type)`
- [ ] Webhook Handler: Identificar `checkout.session.completed` -> Criar `assinaturas` ativa.
- [ ] E-mail Automation: Disparar acesso via e-mail corporativo.

---
*Documento gerado para continuidade do desenvolvimento em 04/04/2026.*
