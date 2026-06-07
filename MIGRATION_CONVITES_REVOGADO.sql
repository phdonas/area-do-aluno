-- Adiciona suporte a revogação de convites pendentes em `convites_matricula`
-- Não altera o campo `usado` — revogação é um estado independente,
-- permitindo distinguir "Revogado" de "Ativado"/"Aguardando" na UI.
--
-- Executar manualmente no Supabase SQL Editor.

ALTER TABLE convites_matricula
ADD COLUMN IF NOT EXISTS revogado boolean DEFAULT false;

ALTER TABLE convites_matricula
ADD COLUMN IF NOT EXISTS revogado_em timestamptz;
