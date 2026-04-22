-- 1. ADICIONAR DURAÇÃO AOS PLANOS
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS duracao_meses INTEGER DEFAULT 12; -- 0 = Vitalício

-- 2. ATUALIZAR FUNÇÕES DE ACESSO (O coração do sistema)
-- Esta função agora verifica:
-- A) Se é Admin
-- B) Se o acesso é gratuito (is_gratis) E o usuário está logado
-- C) Se existe assinatura ATIVA E dentro do PRAZO
CREATE OR REPLACE FUNCTION public.tem_acesso_curso(p_user_id UUID, p_curso_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- 1. Se não houver usuário (não logado), sem acesso
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Verifica se usuário é admin
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE id = p_user_id AND is_admin = TRUE) THEN
    RETURN TRUE;
  END IF;

  -- 3. Verifica se o usuário tem assinatura ATIVA e DENTRO DO PRAZO
  -- Funciona para Planos Globais (is_global = true) ou Específicos do Curso
  SELECT count(*) INTO v_count
    FROM public.assinaturas a
    LEFT JOIN public.planos_cursos pc ON a.plano_id = pc.plano_id
    LEFT JOIN public.planos p ON a.plano_id = p.id
    WHERE a.usuario_id = p_user_id
    AND a.status = 'ativa'
    AND (a.data_vencimento > NOW() OR a.data_vencimento IS NULL)
    AND (
      p.is_global = TRUE 
      OR pc.curso_id = p_curso_id
      OR a.curso_id = p_curso_id -- Para matrículas diretas sem plano (legado/convite)
    );
    
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar acesso à aula para garantir LOGIN (p_user_id IS NOT NULL)
CREATE OR REPLACE FUNCTION public.tem_acesso_aula(p_user_id UUID, p_aula_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_curso_id UUID;
  v_is_gratis BOOLEAN;
BEGIN
  -- 1. Se não houver usuário (não logado), sem acesso NUNCA
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Verifica se a aula é gratuita
  SELECT is_gratis, (SELECT m.curso_id FROM public.modulos m WHERE m.id = a.modulo_id)
  INTO v_is_gratis, v_curso_id
  FROM public.aulas a
  WHERE a.id = p_aula_id;

  IF v_is_gratis = TRUE THEN
    RETURN TRUE;
  END IF;

  -- 3. Se não for grátis, segue a lógica padrão do curso
  RETURN public.tem_acesso_curso(p_user_id, v_curso_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
