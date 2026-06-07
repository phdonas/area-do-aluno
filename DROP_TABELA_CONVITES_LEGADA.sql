-- Remoção da tabela legada `convites` (substituída por `convites_matricula`)
-- Verificado em 2026-06-07: nenhuma referência no código (apenas `convites_matricula` é usada)
-- e nenhuma foreign key de outras tabelas aponta para `public.convites`.
--
-- Executar manualmente no Supabase SQL Editor após confirmação/backup.

DROP TABLE IF EXISTS public.convites;
