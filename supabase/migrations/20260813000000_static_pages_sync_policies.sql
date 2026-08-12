-- GitHub Pages is a static deployment and cannot execute TanStack server
-- functions. These policies let the browser sync event settings and team clue
-- registry rows directly through Supabase using the publishable key.

ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_clues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public update event_settings" ON public.event_settings;
DROP POLICY IF EXISTS "Public insert event_settings" ON public.event_settings;
DROP POLICY IF EXISTS "Public insert team_clues" ON public.team_clues;
DROP POLICY IF EXISTS "Public update team_clues" ON public.team_clues;
DROP POLICY IF EXISTS "Public delete team_clues" ON public.team_clues;

CREATE POLICY "Public insert event_settings"
  ON public.event_settings
  FOR INSERT
  WITH CHECK (id = 1);

CREATE POLICY "Public update event_settings"
  ON public.event_settings
  FOR UPDATE
  USING (id = 1)
  WITH CHECK (id = 1);

CREATE POLICY "Public insert team_clues"
  ON public.team_clues
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update team_clues"
  ON public.team_clues
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete team_clues"
  ON public.team_clues
  FOR DELETE
  USING (true);
