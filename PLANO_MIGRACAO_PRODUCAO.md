# Plano de Migração: Área do Aluno PHD (Resumo para Retomada)

Este plano estabelece a estratégia para levar a plataforma ao ar no domínio `aluno.phdonassolo.com`.

## 1. Estratégia de Ambientes
*   **Produção (Web):** Utilizaremos o projeto Supabase atual (`xeudppoqlf...`), pois ele já contém os dados reais configurados.
*   **Desenvolvimento (Local):** Criaremos um novo projeto Supabase (`PHD-Dev`) para testes seguros no seu computador.

## 2. Fluxo de Trabalho (Workflow)
*   **Site na Web:** Conectado à Vercel. Lê as chaves de Produção.
*   **Ambiente Local:** Seu VS Code lê o arquivo `.env.local` apontando para o banco de Dev.
*   **Sincronia:** Alterações de código feitas localmente são enviadas para o GitHub e a Vercel atualiza o site automaticamente.

## 3. Passos Pendentes (Para Amanhã)
1.  **Criação do Projeto Dev:** Criar novo projeto no Supabase Cloud.
2.  **Clonagem de Estrutura:** Aplicar o script SQL de tabelas e funções no novo banco de Dev.
3.  **Configuração Vercel:**
    *   Criar conta/projeto na Vercel.
    *   Vincular repositório GitHub.
    *   Inserir as chaves do banco atual (Prod) nas "Environment Variables" da Vercel.
4.  **Configuração de DNS:** Criar subdomínio `aluno.phdonassolo.com` apontando para a Vercel.

---
**Status Atual:** Reordenação de aulas corrigida e validada. Pronto para início do deploy.
