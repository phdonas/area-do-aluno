-- Cria a tabela logs_sistema, referenciada por src/lib/logs.ts (registrarLogSistema)
-- e por src/app/(protected)/admin/auditoria/actions.ts, mas ausente do schema.

CREATE TABLE IF NOT EXISTS public.logs_sistema (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  email TEXT,
  evento TEXT NOT NULL,
  nivel TEXT DEFAULT 'info',
  origem TEXT,
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.logs_sistema ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestores podem ver todos os logs do sistema" ON public.logs_sistema;
CREATE POLICY "Gestores podem ver todos os logs do sistema"
ON public.logs_sistema FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid()
        AND (is_staff = true OR is_admin = true)
    )
);
