
-- Add new ticket status and categories
ALTER TYPE follia_ticket_status ADD VALUE IF NOT EXISTS 'awaiting_payment';
ALTER TYPE follia_ticket_category ADD VALUE IF NOT EXISTS 'domain';
ALTER TYPE follia_ticket_category ADD VALUE IF NOT EXISTS 'branding';
ALTER TYPE follia_ticket_category ADD VALUE IF NOT EXISTS 'copy';

-- Add ticket columns
ALTER TABLE public.follia_tickets
  ADD COLUMN IF NOT EXISTS requires_payment boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS amount_cents integer,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS customer_email text;

-- Private bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('follia-ticket-attachments', 'follia-ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can upload/read in their own {user_id}/... path
CREATE POLICY "Users upload own ticket attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'follia-ticket-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users read own ticket attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'follia-ticket-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own ticket attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'follia-ticket-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Service role manages ticket attachments"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'follia-ticket-attachments')
WITH CHECK (bucket_id = 'follia-ticket-attachments');
