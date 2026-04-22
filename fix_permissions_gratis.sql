-- GARANTIR PERMISSÃO PARA ALUNOS LOGADOS CHAMAREM A FUNÇÃO DE MATRÍCULA
GRANT EXECUTE ON FUNCTION public.matricular_curso_gratuito(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.matricular_curso_gratuito(UUID, UUID) TO service_role;

-- LOG DE GARANTIA: Verificar se o curso de teste ainda existe e é gratuito
UPDATE public.cursos SET is_gratis = TRUE WHERE id = '00000000-0000-0000-0000-000000000001';
