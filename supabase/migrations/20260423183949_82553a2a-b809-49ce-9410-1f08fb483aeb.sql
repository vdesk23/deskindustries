CREATE TABLE public.lead_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business TEXT,
  sector TEXT NOT NULL,
  selected_services TEXT[] NOT NULL DEFAULT '{}',
  expected_goals TEXT[] NOT NULL DEFAULT '{}',
  looking_for TEXT NOT NULL,
  has_website TEXT NOT NULL DEFAULT 'not-specified',
  website_url TEXT,
  has_social TEXT NOT NULL DEFAULT 'not-specified',
  social_links TEXT,
  web_needs TEXT[] NOT NULL DEFAULT '{}',
  social_needs TEXT[] NOT NULL DEFAULT '{}',
  coaching_focus TEXT,
  company_resources TEXT,
  contact_preference TEXT NOT NULL DEFAULT 'email',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own lead requests"
ON public.lead_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own lead requests"
ON public.lead_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_lead_requests_updated_at
BEFORE UPDATE ON public.lead_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_lead_requests_user_id ON public.lead_requests(user_id);
CREATE INDEX idx_lead_requests_created_at ON public.lead_requests(created_at DESC);
CREATE INDEX idx_lead_requests_status ON public.lead_requests(status);