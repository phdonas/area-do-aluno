-- 1. CONVITES
CREATE TABLE IF NOT EXISTS public.convites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token         UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  curso_id      UUID REFERENCES public.cursos(id),
  plano_tipo    TEXT DEFAULT 'gratuito', 
  origem        TEXT NOT NULL,           
  status        TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado')),
  expires_at    TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  aceito_em     TIMESTAMPTZ,
  user_id       UUID REFERENCES public.usuarios(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUPONS
CREATE TABLE IF NOT EXISTS public.cupons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        TEXT UNIQUE NOT NULL,
  tipo_desconto TEXT NOT NULL CHECK (tipo_desconto IN ('percentual', 'fixo')),
  valor         NUMERIC(10,2) NOT NULL,
  validade      DATE,
  limite_usos   INTEGER,
  usos_atual    INTEGER DEFAULT 0,
  curso_id      UUID REFERENCES public.cursos(id),
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOGS DE MATRÍCULA
CREATE TABLE IF NOT EXISTS public.logs_matriculas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  admin_id      UUID REFERENCES public.usuarios(id),
  evento        TEXT NOT NULL,
  curso_id      UUID REFERENCES public.cursos(id),
  plano_id      UUID REFERENCES public.planos(id),
  origem        TEXT,
  detalhes      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SEGURANÇA (RLS)
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_matriculas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins_Manage_Convites') THEN
    CREATE POLICY "Admins_Manage_Convites" ON public.convites FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND is_admin = TRUE));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins_Manage_Cupons') THEN
    CREATE POLICY "Admins_Manage_Cupons" ON public.cupons FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND is_admin = TRUE));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins_Manage_Logs') THEN
    CREATE POLICY "Admins_Manage_Logs" ON public.logs_matriculas FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND is_admin = TRUE));
  END IF;
END $$;

-- 5. ATUALIZAÇÃO DO TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Aluno'));

  INSERT INTO public.logs_matriculas (usuario_id, evento, origem, detalhes)
  VALUES (NEW.id, 'cadastro', 'sistema_auth', jsonb_build_object('email', NEW.email));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
