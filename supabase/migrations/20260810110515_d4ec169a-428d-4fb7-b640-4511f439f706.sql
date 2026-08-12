ALTER TABLE public.event_settings
  ADD COLUMN IF NOT EXISTS stats jsonb NOT NULL DEFAULT '[
    {"label":"INVESTIGATORS","value":"120"},
    {"label":"HOURS OF ACCESS","value":"36"},
    {"label":"SEALED LAYERS","value":"07"},
    {"label":"FILES RECOVERED","value":"0.02%"}
  ]'::jsonb;