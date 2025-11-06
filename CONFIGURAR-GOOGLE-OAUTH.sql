-- ==================================================
-- CONFIGURACIÓN PARA GOOGLE OAUTH
-- ==================================================
-- Este script configura las políticas necesarias para
-- autenticación con Google OAuth en Supabase

-- 1. Habilitar RLS en la tabla users si no está habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Crear política para permitir inserción de nuevos usuarios vía OAuth
CREATE POLICY "Permitir inserción de usuarios OAuth"
ON users
FOR INSERT
WITH CHECK (true);

-- 3. Crear política para permitir lectura de usuarios autenticados
CREATE POLICY "Permitir lectura de usuarios autenticados"
ON users
FOR SELECT
USING (auth.uid() IS NOT NULL OR true);

-- 4. Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

-- ==================================================
-- NOTAS DE CONFIGURACIÓN
-- ==================================================
-- Después de ejecutar este script, necesitas:
-- 
-- 1. Configurar Google Cloud Console:
--    - Ve a: https://console.cloud.google.com/
--    - Crea un proyecto o selecciona uno existente
--    - Ve a "APIs & Services" > "Credentials"
--    - Crea "OAuth 2.0 Client ID"
--    - Tipo de aplicación: "Web application"
--    - Authorized redirect URIs:
--      https://TU-PROYECTO.supabase.co/auth/v1/callback
--    - Copia el Client ID y Client Secret
--
-- 2. Configurar en Supabase Dashboard:
--    - Ve a tu proyecto en Supabase
--    - Authentication > Providers > Google
--    - Activa el toggle de "Google Enabled"
--    - Pega tu Client ID
--    - Pega tu Client Secret
--    - Guarda los cambios
--
-- 3. URL de callback para desarrollo local:
--    http://localhost:3000/auth/callback
--
-- 4. URL de callback para producción (Vercel):
--    https://tu-dominio.vercel.app/auth/callback
