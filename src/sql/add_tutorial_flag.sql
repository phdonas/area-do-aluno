-- Adiciona a coluna tutorial_concluido na tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tutorial_concluido BOOLEAN DEFAULT FALSE;

-- Adiciona comentário explicativo para a coluna
COMMENT ON COLUMN usuarios.tutorial_concluido IS 'Indica se o aluno concluiu o tour tutorial de onboarding guiado pela plataforma';
