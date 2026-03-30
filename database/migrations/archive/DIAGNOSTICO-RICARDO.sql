-- Script de diagnóstico para usuario Ricardo
-- Ejecutar en Supabase SQL Editor

-- ==========================================
-- DIAGNÓSTICO COMPLETO
-- ==========================================

-- 1. Verificar usuario en auth.users
SELECT 
  'AUTH.USERS' as tabla,
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '❌ Email NO confirmado'
  END as estado_confirmacion,
  encrypted_password as password_hasheado,
  created_at,
  last_sign_in_at as ultimo_login
FROM auth.users
WHERE email = 'ricardo@admin.com';

-- 2. Verificar usuario en tabla users
SELECT 
  'PUBLIC.USERS' as tabla,
  id,
  email,
  name,
  role,
  password as password_almacenado,
  created_at
FROM public.users
WHERE email = 'ricardo@admin.com';

-- 3. Verificar que los IDs coincidan
SELECT 
  CASE 
    WHEN au.id = u.id THEN '✅ IDs coinciden correctamente'
    ELSE '❌ ERROR: IDs NO coinciden'
  END as verificacion_ids,
  au.id as id_en_auth,
  u.id as id_en_users
FROM auth.users au
FULL OUTER JOIN public.users u ON au.email = u.email
WHERE au.email = 'ricardo@admin.com' OR u.email = 'ricardo@admin.com';

-- ==========================================
-- RESUMEN DE VERIFICACIÓN
-- ==========================================
DO $$
DECLARE
  existe_en_auth boolean;
  existe_en_users boolean;
  email_confirmado boolean;
  ids_coinciden boolean;
  auth_id uuid;
  users_id uuid;
BEGIN
  -- Verificar existencia en auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'ricardo@admin.com') INTO existe_en_auth;
  
  -- Verificar existencia en public.users
  SELECT EXISTS(SELECT 1 FROM public.users WHERE email = 'ricardo@admin.com') INTO existe_en_users;
  
  -- Verificar confirmación de email
  SELECT email_confirmed_at IS NOT NULL INTO email_confirmado
  FROM auth.users WHERE email = 'ricardo@admin.com';
  
  -- Verificar IDs
  SELECT id INTO auth_id FROM auth.users WHERE email = 'ricardo@admin.com';
  SELECT id INTO users_id FROM public.users WHERE email = 'ricardo@admin.com';
  ids_coinciden := (auth_id = users_id);

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'DIAGNÓSTICO: ricardo@admin.com';
  RAISE NOTICE '==========================================';
  
  IF existe_en_auth THEN
    RAISE NOTICE '✅ Usuario existe en auth.users';
  ELSE
    RAISE NOTICE '❌ Usuario NO existe en auth.users';
  END IF;
  
  IF existe_en_users THEN
    RAISE NOTICE '✅ Usuario existe en public.users';
  ELSE
    RAISE NOTICE '❌ Usuario NO existe en public.users';
  END IF;
  
  IF email_confirmado THEN
    RAISE NOTICE '✅ Email confirmado';
  ELSE
    RAISE NOTICE '❌ Email NO confirmado';
  END IF;
  
  IF ids_coinciden THEN
    RAISE NOTICE '✅ IDs coinciden entre tablas';
  ELSE
    RAISE NOTICE '❌ IDs NO coinciden';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SOLUCIONES:';
  RAISE NOTICE '==========================================';
  
  IF NOT existe_en_auth THEN
    RAISE NOTICE '1. Ve a Authentication > Users en Dashboard';
    RAISE NOTICE '2. Crea el usuario ricardo@admin.com';
    RAISE NOTICE '3. Password: ricardo123';
    RAISE NOTICE '4. Marca: Auto Confirm User';
  END IF;
  
  IF NOT email_confirmado THEN
    RAISE NOTICE '1. Ve a Authentication > Users';
    RAISE NOTICE '2. Busca ricardo@admin.com';
    RAISE NOTICE '3. Click en ... > Confirm email';
  END IF;
  
  IF NOT ids_coinciden AND existe_en_auth AND existe_en_users THEN
    RAISE NOTICE '1. Elimina el usuario de public.users';
    RAISE NOTICE '2. Ejecuta CREAR-SUPER-ADMIN-RICARDO.sql';
  END IF;
  
  IF existe_en_auth AND email_confirmado AND ids_coinciden THEN
    RAISE NOTICE '✅ TODO CORRECTO - Verifica password:';
    RAISE NOTICE '   Ve a Authentication > Users > ricardo@admin.com';
    RAISE NOTICE '   Click en ... > Send password reset';
    RAISE NOTICE '   O elimina y recrea con password: ricardo123';
  END IF;
  
  RAISE NOTICE '';
END $$;
