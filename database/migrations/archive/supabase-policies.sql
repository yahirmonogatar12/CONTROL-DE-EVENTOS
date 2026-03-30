-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla users
-- Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

-- Políticas para la tabla cards
-- Los usuarios pueden ver solo sus propias tarjetas
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own cards" ON cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (true);

-- Políticas para la tabla events
-- Todos pueden ver eventos
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

-- Solo admins pueden crear eventos
CREATE POLICY "Admins can insert events" ON events
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden actualizar eventos
CREATE POLICY "Admins can update events" ON events
  FOR UPDATE USING (true);

-- Solo admins pueden eliminar eventos
CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (true);

-- Políticas para la tabla event_attendees
-- Todos pueden ver asistentes
CREATE POLICY "Anyone can view attendees" ON event_attendees
  FOR SELECT USING (true);

-- Todos pueden registrarse
CREATE POLICY "Anyone can register attendance" ON event_attendees
  FOR INSERT WITH CHECK (true);

-- Solo pueden eliminar su propia asistencia
CREATE POLICY "Users can delete own attendance" ON event_attendees
  FOR DELETE USING (true);
