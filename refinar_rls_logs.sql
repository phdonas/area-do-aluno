-- REFINAMENTO DE SEGURANÇA: Logs de Transações
DROP POLICY IF EXISTS "Admins podem ver todos os logs" ON logs_transacoes;

CREATE POLICY "Gestores podem ver todos os logs" 
ON logs_transacoes FOR SELECT 
TO authenticated 
USING ( 
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND (is_staff = true OR is_admin = true)
    )
);
