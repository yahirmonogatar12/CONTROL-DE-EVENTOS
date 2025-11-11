-- ==================================================
-- ACTUALIZACIÓN: AGREGAR FOLIO A QUEJAS Y SUGERENCIAS
-- ==================================================
-- Este script actualiza la tabla existente para agregar el campo folio

-- Agregar columna folio si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'complaints_suggestions' 
    AND column_name = 'folio'
  ) THEN
    ALTER TABLE complaints_suggestions 
    ADD COLUMN folio TEXT;
  END IF;
END $$;

-- Crear secuencia para el folio si no existe
CREATE SEQUENCE IF NOT EXISTS complaints_folio_seq START WITH 1000;

-- Función para generar folio único
CREATE OR REPLACE FUNCTION generate_complaint_folio()
RETURNS TEXT AS $$
DECLARE
  new_folio TEXT;
  folio_prefix TEXT;
BEGIN
  -- Generar prefijo CS (Complaint/Suggestion)
  folio_prefix := 'CS';
  
  -- Generar folio con formato: CS-YYYY-NNNN
  new_folio := folio_prefix || '-' || 
               TO_CHAR(NOW(), 'YYYY') || '-' || 
               LPAD(nextval('complaints_folio_seq')::TEXT, 4, '0');
  
  RETURN new_folio;
END;
$$ LANGUAGE plpgsql;

-- Actualizar registros existentes que no tengan folio
UPDATE complaints_suggestions 
SET folio = generate_complaint_folio()
WHERE folio IS NULL OR folio = '';

-- Ahora hacer la columna NOT NULL y UNIQUE
ALTER TABLE complaints_suggestions 
ALTER COLUMN folio SET NOT NULL;

-- Agregar constraint de unicidad
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'complaints_suggestions_folio_key'
  ) THEN
    ALTER TABLE complaints_suggestions 
    ADD CONSTRAINT complaints_suggestions_folio_key UNIQUE (folio);
  END IF;
END $$;

-- Crear índice para folio si no existe
CREATE INDEX IF NOT EXISTS idx_complaints_folio ON complaints_suggestions(folio);

-- Función para asignar folio automáticamente
CREATE OR REPLACE FUNCTION set_complaint_folio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    NEW.folio := generate_complaint_folio();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger existente si existe y recrearlo
DROP TRIGGER IF EXISTS complaints_set_folio_trigger ON complaints_suggestions;

CREATE TRIGGER complaints_set_folio_trigger
  BEFORE INSERT ON complaints_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION set_complaint_folio();

-- Eliminar funciones existentes para poder recrearlas con nueva estructura
DROP FUNCTION IF EXISTS get_user_complaints(TEXT);
DROP FUNCTION IF EXISTS get_all_complaints();

-- Actualizar función get_user_complaints para incluir folio
CREATE OR REPLACE FUNCTION get_user_complaints(user_email_param TEXT)
RETURNS TABLE (
  id UUID,
  folio TEXT,
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
    cs.folio,
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

-- Actualizar función get_all_complaints para incluir folio
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

-- Verificar que el folio se agregó correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'complaints_suggestions'
  AND column_name = 'folio';

-- Verificar registros con folio
SELECT 
  folio,
  type,
  subject,
  created_at
FROM complaints_suggestions
ORDER BY created_at DESC
LIMIT 5;
