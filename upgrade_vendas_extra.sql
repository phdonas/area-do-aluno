-- ETAPA 1: EXPANSÃO DA TABELA DE CURSOS PARA PÁGINA DE VENDAS
ALTER TABLE public.cursos 
ADD COLUMN IF NOT EXISTS ementa_resumida TEXT,
ADD COLUMN IF NOT EXISTS pre_requisitos TEXT,
ADD COLUMN IF NOT EXISTS video_vendas_url TEXT,
ADD COLUMN IF NOT EXISTS garantia_dias INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb;

-- Comentários descritivos
COMMENT ON COLUMN public.cursos.ementa_resumida IS 'Resumo curto do que o aluno vai aprender para a página de vendas';
COMMENT ON COLUMN public.cursos.pre_requisitos IS 'O que o aluno precisa ter ou saber antes de começar';
COMMENT ON COLUMN public.cursos.video_vendas_url IS 'URL do vídeo de destaque ou trailer (Youtube/Vimeo)';
COMMENT ON COLUMN public.cursos.garantia_dias IS 'Número de dias de garantia incondicional';
COMMENT ON COLUMN public.cursos.faq IS 'Array de objetos {pergunta, resposta} para a seção de dúvidas';
