-- Dê a si mesmo poderes supremos de Administrador!
-- Execute no SQL Editor do Supabase para fazer aparecer a "Admin Zone" no seu menu

UPDATE public.usuarios 
SET is_admin = true 
WHERE email = 'admin@phdonassolo.com';
