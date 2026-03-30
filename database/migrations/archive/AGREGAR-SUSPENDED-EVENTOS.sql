-- ==================================================
-- AGREGAR CAMPO SUSPENDED A EVENTOS
-- ==================================================
-- Este script agrega la capacidad de suspender eventos
-- en lugar de eliminarlos cuando tienen asistentes

-- Agregar campo suspended a la tabla events
ALTER TABLE events ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false;

-- Crear índice para búsquedas rápidas de eventos activos
CREATE INDEX IF NOT EXISTS idx_events_suspended ON events(suspended);

-- Verificar la estructura actualizada
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name = 'suspended';
