-- ============================================
-- ACTUALIZAR CONTRASEÑAS DE USUARIOS DEMO CON BCRYPT
-- ============================================

-- Contraseñas originales:
-- globaladmin@example.com: global123 
-- admin@example.com: admin123
-- user@example.com: user123

-- IMPORTANTE: Ejecuta estos comandos en Supabase SQL Editor

-- Actualizar contraseña de globaladmin@example.com
UPDATE users SET password = '$2b$10$zlPDJ.nb.84WzLXZVt7dF.kN/m9ZH0tuFBhfT.kOHhAkcPlJt.SHW' WHERE email = 'globaladmin@example.com';

-- Actualizar contraseña de admin@example.com
UPDATE users SET password = '$2b$10$4lXLbspqdkcp1vI6/OjrauuTZqd3FqhAQ3NRDyDbNYNkavmgWIaem' WHERE email = 'admin@example.com';

-- Actualizar contraseña de user@example.com
UPDATE users SET password = '$2b$10$GAdfhm5QFweFRy5XCqk23uv7qZ6GoCuTa6Z8tU81motoRjzzKPkRO' WHERE email = 'user@example.com';

