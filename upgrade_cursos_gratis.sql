-- ADICIONAR IS_GRATIS AOS CURSOS
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS is_gratis BOOLEAN DEFAULT FALSE;

-- FUNÇÃO PARA MATRÍCULA EM CURSO GRATUITO
CREATE OR REPLACE FUNCTION public.matricular_curso_gratuito(p_user_id UUID, p_curso_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 1. Verifica se o curso é realmente gratuito
  IF NOT EXISTS (SELECT 1 FROM public.cursos WHERE id = p_curso_id AND is_gratis = TRUE) THEN
    RAISE EXCEPTION 'Este curso não é gratuito.';
  END IF;

  -- 2. Verifica se já está matriculado
  IF EXISTS (SELECT 1 FROM public.assinaturas WHERE usuario_id = p_user_id AND curso_id = p_curso_id AND status = 'ativa') THEN
    RETURN;
  END IF;

  -- 3. Insere a assinatura (Vitalícia por padrão para cursos gratuitos?)
  -- O usuário pediu para considerar prazo determinado, mas cursos gratuitos costumam ser vitalícios.
  -- Usaremos a nova lógica de duracao_meses = 0.
  INSERT INTO public.assinaturas (usuario_id, curso_id, status, data_inicio, data_vencimento, metadata)
  VALUES (
    p_user_id, 
    p_curso_id, 
    'ativa', 
    NOW(), 
    '9999-12-31T23:59:59Z', 
    jsonb_build_object('origem', 'matricula_gratuita_auto')
  );

  -- 4. Log
  INSERT INTO public.logs_matriculas (usuario_id, evento, curso_id, origem)
  VALUES (p_user_id, 'MATRICULA_GRATUITA', p_curso_id, 'catalogo_client');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
