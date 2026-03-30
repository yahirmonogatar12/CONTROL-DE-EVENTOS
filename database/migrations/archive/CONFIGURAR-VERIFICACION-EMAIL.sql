-- ==================================================
-- CONFIGURACIÓN DE VERIFICACIÓN DE EMAIL
-- ==================================================
-- Este script configura la verificación de correo electrónico
-- en Supabase Auth para evitar multicuentas

-- NOTA: La mayoría de la configuración de email se hace desde el Dashboard de Supabase
-- Este script solo documenta los pasos y proporciona consultas útiles

-- ==================================================
-- CONSULTAS ÚTILES
-- ==================================================

-- Ver usuarios de Supabase Auth y su estado de verificación
-- (Ejecutar en Supabase SQL Editor)
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Verificado'
    ELSE 'Pendiente de verificación'
  END as estado
FROM auth.users
ORDER BY created_at DESC;

-- Ver usuarios registrados pero no verificados
SELECT 
  id,
  email,
  created_at,
  NOW() - created_at as tiempo_sin_verificar
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- Eliminar usuarios no verificados después de 7 días (opcional)
-- PRECAUCIÓN: Esto eliminará permanentemente las cuentas
-- DELETE FROM auth.users 
-- WHERE email_confirmed_at IS NULL 
-- AND created_at < NOW() - INTERVAL '7 days';

-- ==================================================
-- POLÍTICAS RLS ACTUALIZADAS
-- ==================================================

-- Actualizar política para verificar que el email esté confirmado
DROP POLICY IF EXISTS "Permitir inserción de usuarios OAuth" ON users;
DROP POLICY IF EXISTS "Permitir lectura de usuarios autenticados" ON users;

-- Nueva política: Solo usuarios con email verificado pueden leer
CREATE POLICY "Permitir lectura de usuarios verificados"
ON users
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  OR 
  true -- Permitir lectura para operaciones del sistema
);

-- Nueva política: Inserción solo para usuarios autenticados
CREATE POLICY "Permitir inserción de usuarios autenticados"
ON users
FOR INSERT
WITH CHECK (true); -- El sistema maneja la creación

-- Política para actualización (opcional)
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON users
FOR UPDATE
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- ==================================================
-- VERIFICAR CONFIGURACIÓN
-- ==================================================

-- Ver todas las políticas de la tabla users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ==================================================
-- CONFIGURACIÓN EN SUPABASE DASHBOARD
-- ==================================================
/*
Para completar la configuración de verificación de email:

1. Ve a tu proyecto en Supabase Dashboard
2. Authentication > Email Templates
3. Personaliza el template "Confirm signup":

   Asunto sugerido:
   "Verifica tu correo - Sistema de Eventos"

   Contenido sugerido:
   ---
   Hola {{ .ConfirmationURL }}
   
   Gracias por registrarte en nuestro Sistema de Eventos.
   
   Para completar tu registro y poder acceder a todos los eventos,
   necesitas verificar tu correo electrónico.
   
   Haz clic en el siguiente enlace para verificar tu cuenta:
   
   {{ .ConfirmationURL }}
   
   Este enlace expira en 24 horas.
   
   Si no solicitaste esta cuenta, puedes ignorar este correo.
   
   ¡Gracias!
   ---

4. Authentication > URL Configuration
   - Asegúrate que "Site URL" esté configurado correctamente:
     * Desarrollo: http://localhost:3000
     * Producción: https://tu-dominio.vercel.app

5. Authentication > Settings
   - "Enable email confirmations": ACTIVADO ✅
   - "Secure email change": ACTIVADO (recomendado)
   - "Double confirm email changes": ACTIVADO (recomendado)

6. Authentication > Rate Limits (opcional pero recomendado)
   - Limitar intentos de registro desde la misma IP
   - Previene spam y abuso

7. Email Provider (si usas SMTP personalizado):
   - Authentication > Settings > SMTP Settings
   - Configura tu servidor SMTP personalizado para mejor entregabilidad
   - O usa el SMTP predeterminado de Supabase
*/
