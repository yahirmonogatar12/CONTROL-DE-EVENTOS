-- SOLUCIÓN TEMPORAL: Desactiva RLS para pruebas
-- Ejecuta esto en el SQL Editor de Supabase

ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;

-- Luego verifica si puedes ver los datos en Table Editor
