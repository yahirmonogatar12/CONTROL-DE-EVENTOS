-- ==================================================
-- SISTEMA DE HISTORIAL DE EVENTOS
-- ==================================================
-- Este script agrega la capacidad de rastrear el historial completo
-- de asistencias de usuarios a eventos con datos detallados

-- ==================================================
-- 1. TABLA DE HISTORIAL DE ASISTENCIAS
-- ==================================================
CREATE TABLE IF NOT EXISTS event_attendance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del evento
  event_id UUID NOT NULL,
  event_title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_location TEXT NOT NULL,
  confirmation_code TEXT NOT NULL,
  
  -- Información del usuario
  user_email TEXT NOT NULL,
  
  -- Datos de la tarjeta del usuario (snapshot al momento de asistir)
  user_name TEXT NOT NULL,
  referente TEXT,
  telefono TEXT,
  correo_electronico TEXT,
  municipio TEXT,
  seccion TEXT,
  edad INTEGER,
  sexo TEXT,
  
  -- Metadatos
  attended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 2. ÍNDICES PARA BÚSQUEDAS RÁPIDAS
-- ==================================================
CREATE INDEX idx_attendance_history_user_email ON event_attendance_history(user_email);
CREATE INDEX idx_attendance_history_event_id ON event_attendance_history(event_id);
CREATE INDEX idx_attendance_history_attended_at ON event_attendance_history(attended_at DESC);
CREATE INDEX idx_attendance_history_user_event ON event_attendance_history(user_email, event_id);

-- ==================================================
-- 3. VISTA PARA ESTADÍSTICAS DE USUARIOS
-- ==================================================
CREATE OR REPLACE VIEW user_event_stats AS
SELECT 
  user_email,
  user_name,
  COUNT(*) as total_events,
  COUNT(DISTINCT event_id) as unique_events,
  MIN(attended_at) as first_event,
  MAX(attended_at) as last_event,
  COUNT(CASE WHEN attended_at >= NOW() - INTERVAL '30 days' THEN 1 END) as events_last_30_days,
  COUNT(CASE WHEN attended_at >= NOW() - INTERVAL '7 days' THEN 1 END) as events_last_7_days
FROM event_attendance_history
GROUP BY user_email, user_name;

-- ==================================================
-- 4. VISTA PARA ESTADÍSTICAS DE EVENTOS
-- ==================================================
CREATE OR REPLACE VIEW event_attendance_stats AS
SELECT 
  event_id,
  event_title,
  event_date,
  COUNT(*) as total_attendees,
  COUNT(DISTINCT user_email) as unique_attendees,
  COUNT(DISTINCT municipio) as municipalities_represented,
  COUNT(DISTINCT seccion) as sections_represented
FROM event_attendance_history
GROUP BY event_id, event_title, event_date;

-- ==================================================
-- 5. FUNCIÓN PARA OBTENER HISTORIAL DE USUARIO
-- ==================================================
CREATE OR REPLACE FUNCTION get_user_event_history(p_user_email TEXT)
RETURNS TABLE (
  event_id UUID,
  event_title TEXT,
  event_date TEXT,
  event_location TEXT,
  confirmation_code TEXT,
  attended_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eah.event_id,
    eah.event_title,
    eah.event_date,
    eah.event_location,
    eah.confirmation_code,
    eah.attended_at
  FROM event_attendance_history eah
  WHERE eah.user_email = p_user_email
  ORDER BY eah.attended_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 6. FUNCIÓN PARA OBTENER ASISTENTES DETALLADOS DE UN EVENTO
-- ==================================================
CREATE OR REPLACE FUNCTION get_event_attendees_detailed(p_event_id UUID)
RETURNS TABLE (
  user_email TEXT,
  user_name TEXT,
  referente TEXT,
  telefono TEXT,
  municipio TEXT,
  seccion TEXT,
  edad INTEGER,
  sexo TEXT,
  attended_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eah.user_email,
    eah.user_name,
    eah.referente,
    eah.telefono,
    eah.municipio,
    eah.seccion,
    eah.edad,
    eah.sexo,
    eah.attended_at
  FROM event_attendance_history eah
  WHERE eah.event_id = p_event_id
  ORDER BY eah.attended_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 7. DESHABILITAR RLS (Row Level Security)
-- ==================================================
ALTER TABLE event_attendance_history DISABLE ROW LEVEL SECURITY;

-- ==================================================
-- 8. VERIFICACIÓN
-- ==================================================
-- Ejecutar después para verificar la estructura
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'event_attendance_history' 
ORDER BY ordinal_position;

-- Verificar vistas creadas
SELECT table_name, view_definition 
FROM information_schema.views 
WHERE table_name IN ('user_event_stats', 'event_attendance_stats');
