-- Criação da Tabela Central de Recursos (Ferramentas Avulsas)
CREATE TABLE IF NOT EXISTS public.recursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  thumb_url VARCHAR(500), -- Imagem de capa (vitrine)
  arquivo_url VARCHAR(1000) NOT NULL, -- Link do HostGator, S3 ou arquivo
  tipo VARCHAR(50) DEFAULT 'simulador', -- 'simulador', 'planilha', 'pdf', 'link'
  abertura_tipo VARCHAR(50) DEFAULT 'modal', -- 'modal' (abre iframe), 'nova_aba', 'download'
  status VARCHAR(20) DEFAULT 'ativo', -- 'ativo', 'inativo'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integração com Aulas (Permitindo que uma Ferramenta seja o conteúdo principal de uma Aula)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aulas' AND column_name='recurso_id') THEN
        ALTER TABLE public.aulas ADD COLUMN recurso_id UUID REFERENCES public.recursos(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Configurando Políticas de Segurança e Privilégios (RLS)
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;

-- Alunos logados só veem os recursos "ativos"
DROP POLICY IF EXISTS "Ver_Recursos" ON public.recursos;
CREATE POLICY "Ver_Recursos" ON public.recursos FOR SELECT USING (status = 'ativo');

-- Administradores têm controle total
DROP POLICY IF EXISTS "Admin_Crud_Recursos" ON public.recursos;
CREATE POLICY "Admin_Crud_Recursos" ON public.recursos FOR ALL USING (public.is_admin());
