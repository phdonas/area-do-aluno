
const fs = require('fs');

async function consolidate() {
    console.log('🏗️ Consolidando Schema Final para Ambiente Local/Dev...');
    
    let finalSql = `-- ==============================================================================
-- SCHEMA_CONSOLIDADO_FINAL.sql
-- Objetivo: Clone integral (Estrutura + Lógica + Segurança) da Produção para Dev
-- Gerado em: ${new Date().toISOString()}
-- ==============================================================================\n\n`;

    // 1. Extensões
    finalSql += `-- 1. EXTENSÕES\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp";\nCREATE EXTENSION IF NOT EXISTS "vector";\n\n`;

    // 2. Estrutura (Tabelas do SCHEMA_PROD_REAL.sql)
    const prodReal = fs.readFileSync('SCHEMA_PROD_REAL.sql', 'utf8');
    // Remover o cabeçalho original e comentários de FKs (vamos re-organizar)
    const tablesPart = prodReal.split('-- RELACIONAMENTOS')[0].replace('-- SCHEMA_PROD_REAL.sql (via OpenAPI)', '');
    finalSql += `-- 2. ESTRUTURA DAS TABELAS (44 TABELAS)\n${tablesPart}\n`;

    // 3. Funções de Sistema e Gatilhos (do supabase_schema.sql e FIX_FINAL_ACESSO_ADMIN.sql)
    finalSql += `-- 3. FUNÇÕES E GATILHOS DE SISTEMA\n`;
    finalSql += `
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, full_name, role, status)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Aluno'), 'student', 'ativo');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho de Sincronização de Usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funções de Acesso
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios 
        WHERE id = auth.uid() AND (is_admin = TRUE OR role = 'admin' OR is_staff = TRUE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.tem_acesso_curso(p_user_id UUID, p_curso_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin sempre tem acesso
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE id = p_user_id AND (is_admin = TRUE OR role = 'admin')) THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.assinaturas
        WHERE usuario_id = p_user_id 
          AND (curso_id = p_curso_id OR plano_id IS NOT NULL)
          AND status IN ('ativa', 'ativo', 'Ativa', 'Ativo')
          AND (data_vencimento IS NULL OR data_vencimento > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função vital para o Dashboard
CREATE OR REPLACE FUNCTION public.get_modulos_curso(p_curso_id UUID)
RETURNS TABLE (id UUID, titulo TEXT, ordem INTEGER, ui_layout TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.titulo, m.ordem, m.ui_layout
    FROM public.modulos m
    WHERE m.curso_id = p_curso_id
    ORDER BY m.ordem ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
\n`;

    // 4. Relacionamentos (Foreign Keys)
    const relations = prodReal.split('-- RELACIONAMENTOS')[1] || '';
    finalSql += `-- 4. RELACIONAMENTOS\n${relations}\n`;

    // 5. Segurança (RLS Políticas)
    finalSql += `-- 5. POLÍTICAS DE SEGURANÇA (RLS)\n`;
    // Vamos automatizar o RLS para as tabelas principais
    const coreTables = ['usuarios', 'cursos', 'assinaturas', 'modulos', 'aulas', 'progresso_aulas', 'planos', 'pilares', 'recursos', 'questionarios'];
    coreTables.forEach(table => {
        finalSql += `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;\n`;
        finalSql += `DROP POLICY IF EXISTS "Admin_Full_Access" ON public.${table};\n`;
        finalSql += `CREATE POLICY "Admin_Full_Access" ON public.${table} FOR ALL TO authenticated USING (public.is_admin());\n`;
    });

    finalSql += `
-- Políticas de Aluno
CREATE POLICY "Users_Read_Own" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Courses_Read_Public" ON public.cursos FOR SELECT USING (status = 'publicado');
CREATE POLICY "Student_Read_Assigned_Modules" ON public.modulos FOR SELECT USING (public.tem_acesso_curso(auth.uid(), curso_id));
CREATE POLICY "Student_Read_Assigned_Lessons" ON public.aulas FOR SELECT USING (EXISTS (SELECT 1 FROM public.modulos WHERE id = modulo_id AND public.tem_acesso_curso(auth.uid(), curso_id)));
CREATE POLICY "Student_Manage_Own_Progress" ON public.progresso_aulas FOR ALL USING (usuario_id = auth.uid());
\n`;

    fs.writeFileSync('SCHEMA_CONSOLIDADO_FINAL.sql', finalSql);
    console.log('✅ SCHEMA_CONSOLIDADO_FINAL.sql gerado com sucesso!');
}

consolidate();
