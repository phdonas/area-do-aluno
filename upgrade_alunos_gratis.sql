-- ATUALIZAÇÃO PARA GESTÃO DE ALUNOS E MATERIAIS GRATUITOS
-- Adicionando campos solicitados para o perfil do usuário
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS contato_preferencial VARCHAR(50) DEFAULT 'email'; -- 'email', 'whatsapp', 'ambos'

-- Alterando tipo de Origem para suportar a lista específica
-- (Opcional: podemos manter o VARCHAR mas o frontend usará a lista)

-- Suporte a Conteúdo Gratuito (Vitrine/Degustação)
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS is_gratis BOOLEAN DEFAULT FALSE;
ALTER TABLE public.materiais_anexos ADD COLUMN IF NOT EXISTS is_gratis BOOLEAN DEFAULT FALSE;

-- Atualização da Função de Acesso para permitir conteúdo gratuito
CREATE OR REPLACE FUNCTION public.tem_acesso_aula(p_user_id UUID, p_aula_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_curso_id UUID;
  v_is_gratis BOOLEAN;
BEGIN
  -- 1. Verifica se a aula é gratuita
  SELECT is_gratis, (SELECT m.curso_id FROM public.modulos m WHERE m.id = a.modulo_id)
  INTO v_is_gratis, v_curso_id
  FROM public.aulas a
  WHERE a.id = p_aula_id;

  IF v_is_gratis = TRUE THEN
    RETURN TRUE;
  END IF;

  -- 2. Se não for grátis, segue a lógica padrão do curso
  RETURN public.tem_acesso_curso(p_user_id, v_curso_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
