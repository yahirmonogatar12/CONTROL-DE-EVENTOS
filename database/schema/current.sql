-- Canonical runtime schema for the current application behavior.
-- This file documents the effective tables, constraints and triggers
-- that the frontend expects today. Historical SQL lives in
-- database/migrations/archive/.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('global-admin', 'admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  referente TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo_electronico TEXT NOT NULL,
  calle_numero TEXT NOT NULL,
  colonia TEXT NOT NULL,
  municipio TEXT NOT NULL,
  estado TEXT NOT NULL,
  edad INTEGER NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('Masculino', 'Femenino', 'Otro')),
  seccion TEXT NOT NULL,
  necesidad TEXT NOT NULL,
  buzon TEXT NOT NULL,
  seguimiento_buzon TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  qr_code TEXT NOT NULL,
  confirmation_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suspended BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_email)
);

CREATE TABLE IF NOT EXISTS event_attendance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  event_title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_location TEXT NOT NULL,
  confirmation_code TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  referente TEXT,
  telefono TEXT,
  correo_electronico TEXT,
  municipio TEXT,
  seccion TEXT,
  edad INTEGER,
  sexo TEXT,
  attended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('queja', 'sugerencia')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'en_revision', 'resuelto', 'cerrado')),
  admin_response TEXT,
  admin_email TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cards_user_email ON cards(user_email);
CREATE INDEX IF NOT EXISTS idx_cards_nombre ON cards(nombre);
CREATE INDEX IF NOT EXISTS idx_cards_municipio ON cards(municipio);
CREATE INDEX IF NOT EXISTS idx_cards_seccion ON cards(seccion);

CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_confirmation_code ON events(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_events_suspended ON events(suspended);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_email ON event_attendees(user_email);

CREATE INDEX IF NOT EXISTS idx_attendance_history_user_email ON event_attendance_history(user_email);
CREATE INDEX IF NOT EXISTS idx_attendance_history_event_id ON event_attendance_history(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_history_attended_at ON event_attendance_history(attended_at DESC);

CREATE INDEX IF NOT EXISTS idx_complaints_folio ON complaints_suggestions(folio);
CREATE INDEX IF NOT EXISTS idx_complaints_user_email ON complaints_suggestions(user_email);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_complaints_type ON complaints_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints_suggestions(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE SEQUENCE IF NOT EXISTS complaints_folio_seq START WITH 1000;

CREATE OR REPLACE FUNCTION generate_complaint_folio()
RETURNS TEXT AS $$
DECLARE
  new_folio TEXT;
BEGIN
  new_folio := 'CS-' ||
               TO_CHAR(NOW(), 'YYYY') || '-' ||
               LPAD(nextval('complaints_folio_seq')::TEXT, 4, '0');
  RETURN new_folio;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_complaint_folio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    NEW.folio := generate_complaint_folio();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS complaints_set_folio_trigger ON complaints_suggestions;
CREATE TRIGGER complaints_set_folio_trigger
  BEFORE INSERT ON complaints_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION set_complaint_folio();

DROP TRIGGER IF EXISTS complaints_updated_at_trigger ON complaints_suggestions;
CREATE TRIGGER complaints_updated_at_trigger
  BEFORE UPDATE ON complaints_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_complaints_updated_at();

-- Runtime note:
-- The app also requires two Supabase Storage buckets:
--   1. event-images
--   2. complaint-images
