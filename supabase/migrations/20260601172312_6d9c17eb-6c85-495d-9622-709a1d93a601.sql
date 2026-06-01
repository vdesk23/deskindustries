-- Add request_status enum with the 5 lifecycle states for the new Foll.IA flow
DO $$ BEGIN
  CREATE TYPE public.follia_request_status AS ENUM ('new', 'in_progress', 'awaiting_payment', 'live', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add columns to follia_sites
ALTER TABLE public.follia_sites
  ADD COLUMN IF NOT EXISTS published_url TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS request_status public.follia_request_status NOT NULL DEFAULT 'new';

-- Backfill request_status from legacy status for existing rows
UPDATE public.follia_sites
SET request_status = CASE
  WHEN status::text = 'live' THEN 'live'::public.follia_request_status
  WHEN status::text = 'awaiting_payment' THEN 'awaiting_payment'::public.follia_request_status
  WHEN status::text = 'in_review' THEN 'in_progress'::public.follia_request_status
  WHEN status::text = 'suspended' THEN 'archived'::public.follia_request_status
  ELSE 'new'::public.follia_request_status
END
WHERE request_status = 'new';

CREATE INDEX IF NOT EXISTS idx_follia_sites_request_status ON public.follia_sites(request_status);
CREATE INDEX IF NOT EXISTS idx_follia_sites_lead_email ON public.follia_sites(lead_email);
