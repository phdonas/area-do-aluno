# 🚀 Checklist de Análise de Performance em Produção

Este documento serve como um guia passo a passo para investigar a lentidão do site `aluno.phdonassolo.com` em produção. Revise cada item na ordem abaixo para identificar os maiores gargalos de tempo de resposta.

---

## 1. Verificação de Regiões Geográficas (Vercel vs Supabase)
A causa mais comum de lentidão é a Vercel estar rodando em um continente (EUA) e o banco de dados em outro (Brasil). Cada consulta cruza o oceano, multiplicando o tempo de resposta.

**Como e Onde Verificar:**
1. **No Supabase:**
   - Acesse seu painel em [supabase.com](https://supabase.com).
   - Vá em **Project Settings** (ícone de engrenagem no menu lateral inferior) > **General**.
   - Role a página até encontrar **Region**. Anote a região (Ex: `South America (São Paulo)`).
2. **Na Vercel:**
   - Acesse o painel da Vercel e entre no projeto `area-do-aluno`.
   - Vá em **Settings** > **Functions**.
   - Encontre a configuração **Function Region**. (Pelos logs recentes, está configurado para `Washington, D.C., USA (East) – iad1`).
   
**Ação Recomendada:**
Se o Supabase estiver em São Paulo, altere a região das funções da Vercel para **`gru1 - São Paulo`** e faça um novo deploy. Isso sozinho pode reduzir a lentidão em mais de 70%.

---

## 2. Análise de Consultas Lentas e Índices no Banco
Conforme a plataforma cresce, buscas sem "índices" fazem o banco analisar todas as linhas de todas as tabelas uma por uma (Sequential Scan).

**Como e Onde Verificar:**
1. **Painel do Supabase:**
   - Vá até a aba **Logs** (ícone de lista) > **Postgres Logs**.
   - Ou vá na aba **Reports** > **Query Performance**.
   - Observe quais consultas possuem maior `execution_time`.
2. **Revisão Rápida de Índices:**
   - Vá em **Database** (ícone de barrilzinho) > **Indexes**.
   - Verifique se tabelas chaves como `assinaturas`, `aulas` e `logs_uso_ia` possuem índices nas colunas com final `_id` (ex: `usuario_id`, `curso_id`).

**Ação Recomendada:**
Criar índices para chaves estrangeiras. Se confirmar que está faltando, execute um script SQL de "Otimização de Performance" no Supabase.

---

## 3. Investigar "Cold Starts" da Vercel
Servidores Serverless dormem quando ninguém está acessando. O primeiro clique de um usuário "acorda" o servidor, demorando até 2 segundos a mais.

**Como e Onde Verificar:**
1. **Painel da Vercel:**
   - Acesse o projeto e clique na aba superior **Logs**.
   - No campo de busca dos logs, tente acessar a plataforma e veja o tráfego aparecendo em tempo real.
   - Selecione um log de requisição de alguma página (ex: `/dashboard`).
   - Olhe o detalhe chamado **`Init Duration`** ou verifique se o tempo total (ex: 1500ms) ocorreu apenas na primeira vez, e ao atualizar a página o tempo cai (ex: para 200ms).

**Ação Recomendada:**
É um comportamento padrão da arquitetura Serverless. Se for incômodo, a única solução absoluta é manter o tráfego constante (robôs de ping) ou assinar planos de "Edge Functions" dedicadas.

---

## 4. Analisar o Cascata (Waterfall) no Navegador
Às vezes o servidor é rápido, mas o código da tela carrega as coisas numa ordem ruim, esperando um dado chegar para só então pedir o próximo dado.

**Como e Onde Verificar:**
1. **No seu Navegador:**
   - Abra o painel administrativo ou o dashboard do aluno (onde sentir a lentidão).
   - Aperte `F12` (ou botão direito > Inspecionar) e vá na aba **Network (Rede)**.
   - Atualize a página (`F5`).
   - Clique em "Fetch/XHR" e observe a barra de tempo ("Waterfall") à direita de cada item.
   - Veja se os pedidos ao banco ou as imagens grandes estão enfileiradas como uma "escada" longa e qual arquivo demora mais tempo para carregar.

---

## 5. Falta de Uso de Cache no Next.js
O Next.js é capaz de memorizar páginas estáticas (como a Vitrine ou Catálogo), mas as marcações no código podem estar obrigando o servidor a re-renderizar a página inteira em cada clique.

**Como e Onde Verificar:**
1. **Nos Logs do GitHub / Terminal:**
   - Lembre-se do último texto que apareceu no final do build:
   - As páginas listadas com o ícone **`○ (Static)`** estão em cache perfeito e carregam instantaneamente.
   - As páginas com o ícone **`ƒ (Dynamic)`** estão gerando processamento pesado em cada clique. Páginas protegidas (Dashboard, Player) sempre serão dinâmicas, mas vitrines públicas não devem ser.
   
---

### 📝 Resumo Rápido para Amanhã:
1. Confirmar se a Região Vercel e Região Supabase são a mesma. (Provável vilão principal).
2. Ver no Network (F12) se as consultas levam mais de 500ms.
3. Checar a aba de "Query Performance" no Supabase.
