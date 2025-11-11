-- ==================================================
-- ACTUALIZACIÓN: AGREGAR IMÁGENES A QUEJAS Y SUGERENCIAS
-- ==================================================
-- Este script agrega la columna para almacenar URLs de imágenes

-- Agregar columna images si no existe (array de URLs)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'complaints_suggestions' 
    AND column_name = 'images'
  ) THEN
    ALTER TABLE complaints_suggestions 
    ADD COLUMN images TEXT[];
  END IF;
END $$;

-- Actualizar funciones para incluir images

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS get_user_complaints(TEXT);
DROP FUNCTION IF EXISTS get_all_complaints();

-- Recrear get_user_complaints con images
CREATE OR REPLACE FUNCTION get_user_complaints(user_email_param TEXT)
RETURNS TABLE (
  id UUID,
  folio TEXT,
  type TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  admin_response TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.folio,
    cs.type,
    cs.subject,
    cs.message,
    cs.status,
    cs.admin_response,
    cs.images,
    cs.created_at,
    cs.updated_at
  FROM complaints_suggestions cs
  WHERE cs.user_email = user_email_param
  ORDER BY cs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Recrear get_all_complaints con images
CREATE OR REPLACE FUNCTION get_all_complaints()
RETURNS TABLE (
  id UUID,
  folio TEXT,
  user_email TEXT,
  user_name TEXT,
  type TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  admin_response TEXT,
  admin_email TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.folio,
    cs.user_email,
    cs.user_name,
    cs.type,
    cs.subject,
    cs.message,
    cs.status,
    cs.admin_response,
    cs.admin_email,
    cs.images,
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

-- Verificar columna images
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'complaints_suggestions'
  AND column_name = 'images';
