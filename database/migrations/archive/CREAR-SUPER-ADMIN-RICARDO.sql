-- Script para crear super admin Ricardo
-- Ejecutar en Supabase SQL Editor

-- IMPORTANTE: La autenticación usa auth.users de Supabase
-- El password en la tabla users es solo referencia, NO se usa para login

-- ============================================
-- PASO 1: Crear usuario en Dashboard (SI NO EXISTE)
-- ============================================
-- 1. Ve a Authentication > Users en Supabase Dashboard
-- 2. Click en "Add user" > "Create new user"
-- 3. Email: ricardo@admin.com
-- 4. Password: ricardo123
-- 5. Auto Confirm User: ✅ MARCAR
-- 6. Click "Create user"

-- ============================================
-- PASO 2: Ejecutar este SQL
-- ============================================

-- Extensión necesaria para bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  auth_user_id uuid;
  hashed_password text;
BEGIN
  -- Obtener el ID del usuario de auth.users
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'ricardo@admin.com';

  -- Verificar si el usuario existe en auth.users
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario ricardo@admin.com no encontrado en auth.users. Créalo primero en Dashboard: Authentication > Users con password: ricardo123 (Auto Confirm: SI)';
  END IF;

  -- Hashear la contraseña (solo para almacenar en tabla users, NO se usa en login)
  -- NOTA: El login usa el password de auth.users, NO este
  hashed_password := crypt('ricardo123', gen_salt('bf'));

  -- Verificar si ya existe en la tabla users
  IF EXISTS(SELECT 1 FROM public.users WHERE email = 'ricardo@admin.com') THEN
    -- Actualizar usuario existente a global-admin
    UPDATE public.users 
    SET role = 'global-admin',
        name = 'Ricardo',
        password = hashed_password
    WHERE email = 'ricardo@admin.com';
    
    RAISE NOTICE '✅ Usuario actualizado a global-admin';
  ELSE
    -- Crear registro nuevo en la tabla users
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

    RAISE NOTICE '✅ Usuario Ricardo creado en tabla users con rol global-admin';
  END IF;

  RAISE NOTICE '===========================================';
  RAISE NOTICE '✅ SUPER ADMIN CONFIGURADO';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Email: ricardo@admin.com';
  RAISE NOTICE 'Password: ricardo123';
  RAISE NOTICE 'Rol: global-admin';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '👉 Inicia sesión con estas credenciales';
  RAISE NOTICE '⚠️  Si no funciona, verifica:';
  RAISE NOTICE '   1. Que el usuario existe en Authentication > Users';
  RAISE NOTICE '   2. Que Auto Confirm User esté marcado';
  RAISE NOTICE '   3. Que el password en Auth sea: ricardo123';
END $$;

-- Verificación final
SELECT 
  u.id as "ID Usuario",
  u.email as "Email",
  u.name as "Nombre",
  u.role as "Rol",
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Existe en Auth'
    ELSE '❌ NO existe en Auth'
  END as "Estado Auth",
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ No confirmado'
  END as "Email Confirmado"
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'ricardo@admin.com';
