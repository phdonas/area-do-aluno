-- Tabela para log de uso de ferramentas (Telemetria)
CREATE TABLE IF NOT EXISTS public.log_uso_ferramentas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ferramenta_id UUID REFERENCES public.recursos(id) ON DELETE SET NULL,
    ferramenta_nome TEXT NOT NULL,
    url_acessada TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.log_uso_ferramentas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem inserir seus próprios logs
CREATE POLICY "Usuários podem inserir seus próprios logs" 
ON public.log_uso_ferramentas 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

-- Política: Admins podem ver todos os logs
CREATE POLICY "Admins podem ver todos os logs" 
ON public.log_uso_ferramentas 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios 
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
    )
);

-- Índice para performance nas consultas do Admin
CREATE INDEX IF NOT EXISTS idx_log_uso_usuario ON public.log_uso_ferramentas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_log_uso_created ON public.log_uso_ferramentas(created_at DESC);

-- Função para estatísticas de uso por ferramenta (Ranking)
CREATE OR REPLACE FUNCTION public.get_ferramentas_stats()
RETURNS TABLE (
    ferramenta_nome TEXT,
    total_usos BIGINT,
    usuarios_unicos BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.ferramenta_nome,
        COUNT(*)::BIGINT as total_usos,
        COUNT(DISTINCT l.usuario_id)::BIGINT as usuarios_unicos
    FROM 
        public.log_uso_ferramentas l
    GROUP BY 
        l.ferramenta_nome
    ORDER BY 
        total_usos DESC;
END;
$$;
