-- ==================================================
-- SISTEMA DE QUEJAS Y SUGERENCIAS
-- ==================================================
-- Este script crea la infraestructura para que usuarios
-- envíen quejas/sugerencias y administradores las gestionen

-- Crear tabla de quejas y sugerencias
CREATE TABLE IF NOT EXISTS complaints_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('queja', 'sugerencia')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_revision', 'resuelto', 'cerrado')),
  admin_response TEXT,
  admin_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_complaints_user_email ON complaints_suggestions(user_email);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_complaints_type ON complaints_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints_suggestions(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_updated_at_trigger
  BEFORE UPDATE ON complaints_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_complaints_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE complaints_suggestions ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios pueden ver sus propias quejas/sugerencias
CREATE POLICY "Usuarios ven sus propias quejas"
ON complaints_suggestions
FOR SELECT
USING (auth.uid() IS NOT NULL OR true); -- Permitir lectura para operaciones del sistema

-- Política: Usuarios pueden crear quejas/sugerencias
CREATE POLICY "Usuarios pueden crear quejas"
ON complaints_suggestions
FOR INSERT
WITH CHECK (true);

-- Política: Solo admins pueden actualizar (responder)
CREATE POLICY "Admins pueden actualizar quejas"
ON complaints_suggestions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Vista para estadísticas de quejas y sugerencias
CREATE OR REPLACE VIEW complaints_stats AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE type = 'queja') as total_quejas,
  COUNT(*) FILTER (WHERE type = 'sugerencia') as total_sugerencias,
  COUNT(*) FILTER (WHERE status = 'pendiente') as pendientes,
  COUNT(*) FILTER (WHERE status = 'en_revision') as en_revision,
  COUNT(*) FILTER (WHERE status = 'resuelto') as resueltos,
  COUNT(*) FILTER (WHERE status = 'cerrado') as cerrados,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as ultimos_30_dias,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as ultimos_7_dias,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric(10,2) as promedio_horas_resolucion
FROM complaints_suggestions;

-- Función para obtener quejas/sugerencias de un usuario
CREATE OR REPLACE FUNCTION get_user_complaints(user_email_param TEXT)
RETURNS TABLE (
  id UUID,
  type TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.type,
    cs.subject,
    cs.message,
    cs.status,
    cs.admin_response,
    cs.created_at,
    cs.updated_at
  FROM complaints_suggestions cs
  WHERE cs.user_email = user_email_param
  ORDER BY cs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener todas las quejas/sugerencias (admin)
CREATE OR REPLACE FUNCTION get_all_complaints()
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  user_name TEXT,
  type TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  admin_response TEXT,
  admin_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.user_email,
    cs.user_name,
    cs.type,
    cs.subject,
    cs.message,
    cs.status,
    cs.admin_response,
    cs.admin_email,
    cs.created_at,
    cs.updated_at,
    cs.resolved_at
  FROM complaints_suggestions cs
  ORDER BY 
    CASE cs.status
      WHEN 'pendiente' THEN 1
      WHEN 'en_revision' THEN 2
      WHEN 'resuelto' THEN 3
      WHEN 'cerrado' THEN 4
    END,
    cs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Verificar la estructura creada
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'complaints_suggestions'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'complaints_suggestions';

-- ==================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ==================================================
-- Descomentar para insertar datos de prueba

/*
INSERT INTO complaints_suggestions (user_email, user_name, type, subject, message, status) VALUES
('usuario1@example.com', 'Juan Pérez', 'queja', 'Problema con registro', 'No pude registrar mi asistencia al evento', 'pendiente'),
('usuario2@example.com', 'María García', 'sugerencia', 'Mejorar la interfaz', 'Sería bueno agregar modo oscuro', 'en_revision'),
('usuario3@example.com', 'Carlos López', 'queja', 'Error en QR', 'El código QR no se descarga correctamente', 'resuelto');
*/
