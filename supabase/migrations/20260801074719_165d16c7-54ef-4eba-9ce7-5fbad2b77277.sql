CREATE TABLE public.event_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  start_time timestamptz NOT NULL DEFAULT '2026-11-14T09:00:00Z',
  ctf_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.event_settings TO anon, authenticated;
GRANT ALL ON public.event_settings TO service_role;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event settings are publicly readable" ON public.event_settings FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.admin_credentials (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  callsign text NOT NULL,
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_credentials TO service_role;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

INSERT INTO public.event_settings (id, start_time, ctf_url) VALUES (1, '2026-11-14T09:00:00Z', '');
INSERT INTO public.admin_credentials (id, callsign, password_hash) VALUES (1, 'interstellar_ttf', 'e849f040a10a2f4fb36672db8a90e0b8:048f7cbd80c7a37c1d4068bad383819a7ad298afb27df25e76616b3c1a3abeeb');