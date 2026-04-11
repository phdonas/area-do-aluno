-- 1. Criar um Pilar Fictício (usando UUIDs estáticos para facilitar relacionamentos)
INSERT INTO public.pilares (id, nome, cor_badge, ordem)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Pilar de Gestão', 'blue', 1)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar um Curso Fictício vindo desse Pilar
INSERT INTO public.cursos (id, pilar_id, titulo, slug, descricao, thumb_url, status)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Mestres do Tempo', 'mestres-do-tempo', 'Descubra como otimizar sua rotina, implementar rituais de produtividade e formatar relatórios em tempo recorde usando IA.', 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop', 'publicado')
ON CONFLICT (id) DO NOTHING;

-- 3. Criar Módulos para o Curso
INSERT INTO public.modulos (id, curso_id, titulo, descricao, ordem)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 'Fundamentos Invisíveis', 'O que ninguém te conta sobre a matriz.', 1),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'Automação na Prática', 'Delegando decisões difíceis aos algoritmos.', 2)
ON CONFLICT (id) DO NOTHING;

-- 4. Criar Aulas para os Módulos
INSERT INTO public.aulas (id, modulo_id, titulo, slug, descricao, video_url, duracao_minutos, ordem)
VALUES 
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'Diagnóstico da sua Agenda', 'diag-agenda', 'Descubra seus gargalos e rastreie o cansaço do dia a dia.', 'https://vimeo.com/76979871', 15, 1),
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333331', 'Matriz de Eisenhower', 'matriz-eisen', 'A fórmula exata para priorizar as ações com lucro rápido.', 'https://vimeo.com/76979872', 28, 2),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333332', 'Criando o seu formatador', 'cro-format', 'Hands-on absoluto em prompts.', 'https://vimeo.com/76979873', 45, 1)
ON CONFLICT (id) DO NOTHING;
