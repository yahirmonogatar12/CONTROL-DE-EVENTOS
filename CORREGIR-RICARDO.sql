-- Script para corregir el usuario Ricardo con IDs no coincidentes
-- Ejecutar en Supabase SQL Editor

-- ==========================================
-- SOLUCIÓN: Sincronizar IDs entre tablas
-- ==========================================

DO $$
DECLARE
  auth_user_id uuid := '3ada51c6-e1dd-4124-87fd-61af69e48667'; -- ID correcto de auth.users
  hashed_password text;
BEGIN
  RAISE NOTICE 'Iniciando corrección de usuario ricardo@admin.com...';
  
  -- Eliminar registro incorrecto en public.users si existe
  DELETE FROM public.users WHERE email = 'ricardo@admin.com';
  RAISE NOTICE '✅ Registro antiguo eliminado de public.users';
  
  -- Hashear la contraseña
  hashed_password := crypt('ricardo123', gen_salt('bf'));
  
  -- Crear registro correcto con el ID de auth.users
  INSERT INTO public.users (
    id,
    email,
    password,
    name,
    role,
    created_at
  )
  VALUES (
    auth_user_id,
    'ricardo@admin.com',
    hashed_password,
    'Ricardo',
    'global-admin',
    now()
  );
  
  RAISE NOTICE '✅ Usuario Ricardo creado correctamente en public.users';
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ CORRECCIÓN COMPLETADA';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Email: ricardo@admin.com';
  RAISE NOTICE 'Password: ricardo123';
  RAISE NOTICE 'Rol: global-admin';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE:';
  RAISE NOTICE 'Si aún no puedes iniciar sesión, el password en';
  RAISE NOTICE 'auth.users puede ser incorrecto. Solución:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Ve a Authentication > Users en Dashboard';
  RAISE NOTICE '2. Busca ricardo@admin.com';
  RAISE NOTICE '3. Click en ... > Reset Password';
  RAISE NOTICE '4. Establece: ricardo123';
  RAISE NOTICE '';
END $$;

-- Verificar que ahora todo esté correcto
SELECT 
  CASE 
    WHEN au.id = u.id THEN '✅ IDs ahora coinciden correctamente'
    ELSE '❌ ERROR: IDs aún NO coinciden'
  END as estado,
  au.id as id_en_auth,
  u.id as id_en_users,
  u.email,
  u.name,
  u.role,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '❌ Email NO confirmado'
  END as confirmacion_email
FROM auth.users au
JOIN public.users u ON au.email = u.email
WHERE au.email = 'ricardo@admin.com';
