-- ============================================
-- EJECUTAR ESTOS COMANDOS EN SUPABASE SQL EDITOR
-- EN ORDEN: Primero STEP 1, luego STEP 2, luego STEP 3
-- ============================================

-- ============================================
-- STEP 1: LIMPIAR TABLAS EXISTENTES
-- ============================================
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- STEP 2: CREAR TABLAS CON ESTRUCTURA CORRECTA
-- ============================================

-- 1. Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('global-admin', 'admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de tarjetas (COMPLETA con todos los campos)
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  name TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  curp TEXT,
  sex TEXT NOT NULL,
  age TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  folio_no TEXT,
  distrito TEXT,
  seccion TEXT,
  calle_numero TEXT,
  colonia TEXT,
  programas TEXT[],
  fecha TEXT,
  responsable_captura TEXT,
  cancelada BOOLEAN DEFAULT FALSE,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  qr_code TEXT NOT NULL,
  confirmation_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de asistentes a eventos
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_email)
);

-- Índices para rendimiento
CREATE INDEX idx_cards_user_email ON cards(user_email);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_confirmation_code ON events(confirmation_code);
CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_email ON event_attendees(user_email);

-- Función y trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Deshabilitar RLS temporalmente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: INSERTAR USUARIOS DEMO CON CONTRASEÑAS HASHEADAS
-- ============================================
INSERT INTO users (email, name, password, role) VALUES
('globaladmin@example.com', 'Administrador Global', '$2b$10$zlPDJ.nb.84WzLXZVt7dF.kN/m9ZH0tuFBhfT.kOHhAkcPlJt.SHW', 'global-admin'),
('admin@example.com', 'Administrador', '$2b$10$4lXLbspqdkcp1vI6/OjrauuTZqd3FqhAQ3NRDyDbNYNkavmgWIaem', 'admin'),
('user@example.com', 'Usuario Normal', '$2b$10$GAdfhm5QFweFRy5XCqk23uv7qZ6GoCuTa6Z8tU81motoRjzzKPkRO', 'user')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password;

-- Las contraseñas son:
-- globaladmin@example.com: global123
-- admin@example.com: admin123
-- user@example.com: user123
