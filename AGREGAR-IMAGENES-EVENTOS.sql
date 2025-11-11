-- Script para agregar campo de imagen a eventos
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Agregar columna image_url a la tabla events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE events ADD COLUMN image_url TEXT;
    RAISE NOTICE 'Columna image_url agregada exitosamente';
  ELSE
    RAISE NOTICE 'La columna image_url ya existe';
  END IF;
END $$;

-- Paso 2: Actualizar función get_events para incluir image_url
DROP FUNCTION IF EXISTS get_events();

CREATE OR REPLACE FUNCTION get_events()
RETURNS TABLE (
  id UUID,
  title TEXT,
  date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  description TEXT,
  qr_code TEXT,
  confirmation_code TEXT,
  attendees TEXT[],
  created_by TEXT,
  suspended BOOLEAN,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.date,
    e.location,
    e.description,
    e.qr_code,
    e.confirmation_code,
    e.attendees,
    e.created_by,
    e.suspended,
    e.image_url
  FROM events e
  ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Paso 3: Actualizar función get_user_events para incluir image_url
DROP FUNCTION IF EXISTS get_user_events(TEXT);

CREATE OR REPLACE FUNCTION get_user_events(user_email TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  description TEXT,
  qr_code TEXT,
  confirmation_code TEXT,
  attendees TEXT[],
  created_by TEXT,
  suspended BOOLEAN,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.date,
    e.location,
    e.description,
    e.qr_code,
    e.confirmation_code,
    e.attendees,
    e.created_by,
    e.suspended,
    e.image_url
  FROM events e
  WHERE user_email = ANY(e.attendees)
  ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Verificación
DO $$
BEGIN
  RAISE NOTICE 'Script ejecutado exitosamente';
  RAISE NOTICE 'Columna image_url agregada a la tabla events';
  RAISE NOTICE 'Funciones get_events() y get_user_events() actualizadas';
END $$;
