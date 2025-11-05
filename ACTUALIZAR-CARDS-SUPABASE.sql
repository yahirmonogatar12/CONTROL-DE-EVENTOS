-- ==================================================
-- ACTUALIZACIÓN DE TABLA CARDS - NUEVOS CAMPOS
-- ==================================================
-- Ejecutar este script en Supabase SQL Editor

-- OPCIÓN 1: Eliminar la tabla anterior y crear nueva (RECOMENDADO si no hay datos importantes)
DROP TABLE IF EXISTS cards CASCADE;

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vinculación con usuario
  user_email TEXT NOT NULL,
  
  -- Información del referente
  referente TEXT NOT NULL,
  
  -- Datos personales
  nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo_electronico TEXT NOT NULL,
  
  -- Dirección
  calle_numero TEXT NOT NULL,
  colonia TEXT NOT NULL,
  municipio TEXT NOT NULL,
  estado TEXT NOT NULL,
  
  -- Información adicional
  edad INTEGER NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('Masculino', 'Femenino', 'Otro')),
  seccion TEXT NOT NULL,
  necesidad TEXT NOT NULL,
  
  -- Buzón y seguimiento
  buzon TEXT NOT NULL,
  seguimiento_buzon TEXT NOT NULL,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_cards_user_email ON cards(user_email);
CREATE INDEX idx_cards_referente ON cards(referente);
CREATE INDEX idx_cards_nombre ON cards(nombre);
CREATE INDEX idx_cards_apellido_paterno ON cards(apellido_paterno);
CREATE INDEX idx_cards_telefono ON cards(telefono);
CREATE INDEX idx_cards_municipio ON cards(municipio);
CREATE INDEX idx_cards_seccion ON cards(seccion);
CREATE INDEX idx_cards_created_at ON cards(created_at DESC);

-- Deshabilitar RLS
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- OPCIÓN 2: Si quieres mantener datos existentes (usar ALTER TABLE)
-- ==================================================
-- COMENTAR LA SECCIÓN ANTERIOR Y DESCOMENTAR ESTA SI TIENES DATOS IMPORTANTES

/*
-- Eliminar columnas antiguas que no están en el nuevo diseño
ALTER TABLE cards DROP COLUMN IF EXISTS curp CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS address CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS phone CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS folio_no CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS distrito CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS programas CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS fecha CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS responsable_captura CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS cancelada CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS observaciones CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS sex CASCADE;
ALTER TABLE cards DROP COLUMN IF EXISTS age CASCADE;

-- Agregar nuevas columnas
ALTER TABLE cards ADD COLUMN IF NOT EXISTS referente TEXT NOT NULL DEFAULT 'Sin referente';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS nombre TEXT NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS apellido_paterno TEXT NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS apellido_materno TEXT NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS telefono TEXT NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS correo_electronico TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS calle_numero TEXT NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS colonia TEXT NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS municipio TEXT NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT '';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('Masculino', 'Femenino', 'Otro'));
ALTER TABLE cards ADD COLUMN IF NOT EXISTS seccion TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS necesidad TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS buzon TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS seguimiento_buzon TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS nota TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_cards_referente ON cards(referente);
CREATE INDEX IF NOT EXISTS idx_cards_nombre ON cards(nombre);
CREATE INDEX IF NOT EXISTS idx_cards_apellido_paterno ON cards(apellido_paterno);
CREATE INDEX IF NOT EXISTS idx_cards_telefono ON cards(telefono);
CREATE INDEX IF NOT EXISTS idx_cards_municipio ON cards(municipio);
CREATE INDEX IF NOT EXISTS idx_cards_seccion ON cards(seccion);
*/

-- ==================================================
-- VERIFICACIÓN
-- ==================================================
-- Ejecutar después para verificar la estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;
