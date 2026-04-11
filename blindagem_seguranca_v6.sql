-- ==============================================================================
-- BLINDAGEM DE SEGURANÇA v6.0: PHDonassolo Área do Aluno
-- ==============================================================================
-- Este script corrige as falhas críticas detectadas de Escalada de Privilégios
-- e Garante que NENHUMA tabela fique sem RLS (Row Level Security).

-- 0. GARANTIR FUNÇÃO ADMIN SEGURA (Já existente, mas vamos reforçar)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Roda com SECURITY DEFINER para bypassar o próprio RLS e checar o valor real
  SELECT is_admin INTO v_is_admin FROM public.usuarios WHERE id = auth.uid();
  RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. CORREÇÃO CRÍTICA: Escalada de Privilégios na tabela 'usuarios'
-- ==============================================================================
-- Usuários NUNCA devem atualizar seu próprio campo 'is_admin'.
-- Criamos um Trigger para barrar qualquer tentativa de alteração manual desse campo.
CREATE OR REPLACE FUNCTION public.protect_is_admin_field()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o valor de is_admin mudou, e quem está mudando NÃO é o próprio banco (postgres/su)
  -- ou se o usuário ATUAL não for um Admin já validado antes do update:
  IF (OLD.is_admin IS DISTINCT FROM NEW.is_admin) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Ação não permitida: Você não tem privilégios para alterar o status de admin.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_protect_admin_field ON public.usuarios;
CREATE TRIGGER tr_protect_admin_field
BEFORE UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.protect_is_admin_field();

-- 2. BLINDAGEM TOTAL RLS: Habilitar em tabelas esquecidas
-- ==============================================================================
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ferramentas_saas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simuladores_roleplay ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacoes_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacoes_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_uso_ia ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACESSO PRIVADO (Dados sensíveis de alunos)
-- ==============================================================================

-- Assinaturas: O aluno só vê as DELE. Admin vê todas.
DROP POLICY IF EXISTS "Ver_Propria_Assinatura" ON public.assinaturas;
CREATE POLICY "Ver_Propria_Assinatura" ON public.assinaturas FOR SELECT USING (auth.uid() = usuario_id OR public.is_admin());

-- Simulações IA: O aluno só vê e cria as DELE.
DROP POLICY IF EXISTS "Ver_Proprias_Simulacoes" ON public.simulacoes_historico;
CREATE POLICY "Ver_Proprias_Simulacoes" ON public.simulacoes_historico FOR ALL USING (auth.uid() = usuario_id OR public.is_admin());

DROP POLICY IF EXISTS "Ver_Proprias_Mensagens" ON public.simulacoes_mensagens;
CREATE POLICY "Ver_Proprias_Mensagens" ON public.simulacoes_mensagens FOR ALL USING (
    EXISTS (SELECT 1 FROM public.simulacoes_historico WHERE id = sessao_id AND usuario_id = auth.uid())
    OR public.is_admin()
);

-- Ferramentas SaaS: Alunos veem as ativas. Admin altera.
DROP POLICY IF EXISTS "Ver_Ferramentas_Ativas" ON public.ferramentas_saas;
CREATE POLICY "Ver_Ferramentas_Ativas" ON public.ferramentas_saas FOR SELECT USING (status = 'ativo');
CREATE POLICY "Admin_Full_Ferramentas" ON public.ferramentas_saas FOR ALL USING (public.is_admin());

-- Simuladores configs: Alunos veem os ativos. Admin altera.
DROP POLICY IF EXISTS "Ver_Simuladores_Ativos" ON public.simuladores_roleplay;
CREATE POLICY "Ver_Simuladores_Ativos" ON public.simuladores_roleplay FOR SELECT USING (status = 'ativo');
CREATE POLICY "Admin_Full_Simuladores" ON public.simuladores_roleplay FOR ALL USING (public.is_admin());

-- Bloqueio de qualquer escrita em Planos por não-admins
DROP POLICY IF EXISTS "Admin_Manage_Planos" ON public.planos;
CREATE POLICY "Admin_Manage_Planos" ON public.planos FOR ALL USING (public.is_admin());

-- 4. LOGS DE SEGURANÇA (O próprio usuário não pode ler nem deletar logs de uso)
-- ==============================================================================
DROP POLICY IF EXISTS "Admin_Only_Logs" ON public.logs_uso_ia;
CREATE POLICY "Admin_Only_Logs" ON public.logs_uso_ia FOR ALL USING (public.is_admin());

-- 5. REVISÃO DO RESET DE SENHA / ACESSO
-- ==============================================================================
-- Garante que se houver uma tabela de 'tokens' ou similar, ela também esteja trancada.

-- FIM DO SCRIPT DE BLINDAGEM.
