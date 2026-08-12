-- ==========================================
-- STARDUST GATEWAY - SUPABASE SCHEMA MIGRATION
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==========================================

-- 1. Create event_settings table
CREATE TABLE IF NOT EXISTS public.event_settings (
  id INT8 PRIMARY KEY DEFAULT 1,
  start_time TEXT NOT NULL DEFAULT '2026-11-14T09:00:00Z',
  ctf_url TEXT NOT NULL DEFAULT '/ctf',
  stats JSONB NOT NULL DEFAULT '[{"label":"INVESTIGATORS","value":"60"},{"label":"HOURS OF ACCESS","value":"1.5"},{"label":"SEALED LAYERS","value":"04"},{"label":"FILES RECOVERED","value":"0.02%"}]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row if not exists
INSERT INTO public.event_settings (id, start_time, ctf_url, stats)
VALUES (
  1,
  '2026-11-14T09:00:00Z',
  '/ctf',
  '[{"label":"INVESTIGATORS","value":"60"},{"label":"HOURS OF ACCESS","value":"1.5"},{"label":"SEALED LAYERS","value":"04"},{"label":"FILES RECOVERED","value":"0.02%"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create admin_credentials table
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id INT8 PRIMARY KEY DEFAULT 1,
  callsign TEXT NOT NULL DEFAULT 'COMMANDER',
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row if not exists (default password: STARDUST2026!)
INSERT INTO public.admin_credentials (id, callsign, password_hash)
VALUES (
  1,
  'COMMANDER',
  '79c93df3fb72ee8ebdb7e55ceccfb316:855a1d7f45c8ad1c8c88686948ca298f2441961e05d9852ce748ea92c99a6cf7'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create team_clues table
CREATE TABLE IF NOT EXISTS public.team_clues (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  team_name TEXT NOT NULL,
  clue TEXT NOT NULL,
  access_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial team clues
INSERT INTO public.team_clues (id, team_name, clue, access_code)
VALUES
  ('clue-1', 'ORION PHALANX', 'ASTERIA-71-ALPHA', 'KEY-7109-ALPHA'),
  ('clue-2', 'CYGNUS INITIATIVE', 'MIRROR-SIGNAL-9', 'KEY-9942-BETA'),
  ('clue-3', 'VANGUARD SEC', 'DEEPSPACE-OMEGA', 'KEY-0071-OMEGA')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_clues ENABLE ROW LEVEL SECURITY;

-- Allow public read access to event_settings and team_clues
CREATE POLICY "Public read event_settings" ON public.event_settings FOR SELECT USING (true);
CREATE POLICY "Public read team_clues" ON public.team_clues FOR SELECT USING (true);
