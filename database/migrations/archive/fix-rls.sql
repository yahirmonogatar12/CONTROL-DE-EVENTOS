-- EJECUTA ESTO EN SUPABASE SQL EDITOR
-- Esto desactiva temporalmente las políticas de seguridad

ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verifica el estado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
