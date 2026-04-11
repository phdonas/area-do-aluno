-- Adiciona a coluna de explicação individual para cada alternativa
ALTER TABLE public.questoes_alternativas ADD COLUMN IF NOT EXISTS explicacao TEXT;

-- Garante que o tipo da questão suporte os novos valores se necessário
-- (O tipo já é VARCHAR em questionarios_schema.sql, então os valores novos funcionam)
-- Sugestões de uso no frontend: 'escolha_simples', 'multipla_escolha', 'verdadeiro_falso'
