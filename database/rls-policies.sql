-- RLS Policies for all tables
-- Run this in Supabase SQL Editor after running database/schema/current.sql

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert" ON users;
DROP POLICY IF EXISTS "Users can update own" ON users;
DROP POLICY IF EXISTS "Users can view own cards" ON cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON cards;
DROP POLICY IF EXISTS "Users can update own cards" ON cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON cards;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;
DROP POLICY IF EXISTS "Anyone can view attendees" ON event_attendees;
DROP POLICY IF EXISTS "Anyone can register attendance" ON event_attendees;
DROP POLICY IF EXISTS "Users can delete own attendance" ON event_attendees;
DROP POLICY IF EXISTS "Anyone can view history" ON event_attendance_history;
DROP POLICY IF EXISTS "Anyone can insert history" ON event_attendance_history;
DROP POLICY IF EXISTS "Anyone can view complaints" ON complaints_suggestions;
DROP POLICY IF EXISTS "Anyone can insert complaints" ON complaints_suggestions;
DROP POLICY IF EXISTS "Anyone can update complaints" ON complaints_suggestions;

-- users: open read, open insert/update (app manages auth)
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own" ON users
  FOR UPDATE USING (true);

-- cards: fully open (app-level auth controls access)
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own cards" ON cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (true);

-- events: open read, open write (app-level admin check)
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update events" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (true);

-- event_attendees: fully open
CREATE POLICY "Anyone can view attendees" ON event_attendees
  FOR SELECT USING (true);

CREATE POLICY "Anyone can register attendance" ON event_attendees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own attendance" ON event_attendees
  FOR DELETE USING (true);

-- event_attendance_history: open read/write
CREATE POLICY "Anyone can view history" ON event_attendance_history
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert history" ON event_attendance_history
  FOR INSERT WITH CHECK (true);

-- complaints_suggestions: fully open
CREATE POLICY "Anyone can view complaints" ON complaints_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert complaints" ON complaints_suggestions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update complaints" ON complaints_suggestions
  FOR UPDATE USING (true);
