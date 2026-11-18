CREATE TABLE public.landing_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line text NOT NULL,
  variant text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  utm jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.landing_contacts TO service_role;
ALTER TABLE public.landing_contacts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.landing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.landing_contacts(id) ON DELETE CASCADE,
  line text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferred_slot text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.landing_requests TO service_role;
ALTER TABLE public.landing_requests ENABLE ROW LEVEL SECURITY;