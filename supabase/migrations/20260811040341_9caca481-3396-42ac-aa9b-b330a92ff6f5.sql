CREATE TABLE public.team_clues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL,
  clue TEXT NOT NULL,
  access_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX team_clues_clue_key ON public.team_clues (lower(btrim(clue)));

GRANT ALL ON public.team_clues TO service_role;

ALTER TABLE public.team_clues ENABLE ROW LEVEL SECURITY;