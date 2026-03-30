-- ============================================
-- VERIFICAR CONTRASEÑAS EN SUPABASE
-- ============================================

-- Ejecuta este SELECT para ver las contraseñas en tu DB
SELECT 
  email, 
  name,
  role,
  LEFT(password, 20) || '...' as password_hash,
  CASE 
    WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' THEN '✅ Hasheada correctamente'
    WHEN password LIKE '$2y$%' THEN '✅ Hasheada (bcrypt variant)'
    ELSE '❌ NO hasheada (texto plano)'
  END as password_status
FROM users
ORDER BY created_at;

-- Si ves "❌ NO hasheada", necesitas actualizar las contraseñas
-- Usa el archivo: update-passwords.sql
