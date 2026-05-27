-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.follia_business_type AS ENUM (
  'restaurant', 'retail_shop', 'barbershop_salon', 'professional', 'other'
);

CREATE TYPE public.follia_site_status AS ENUM (
  'draft', 'awaiting_payment', 'in_review', 'live', 'suspended'
);

CREATE TYPE public.follia_plan AS ENUM (
  'basic_19', 'with_setup_297'
);

CREATE TYPE public.follia_ticket_status AS ENUM (
  'open', 'in_progress', 'resolved', 'closed'
);

CREATE TYPE public.follia_ticket_category AS ENUM (
  'general', 'edit_request', 'bug', 'billing'
);

CREATE TYPE public.follia_booking_status AS ENUM (
  'pending', 'confirmed', 'declined', 'cancelled'
);

CREATE TYPE public.follia_domain_request_status AS ENUM (
  'pending_payment', 'paid', 'configuring', 'live', 'cancelled'
);

-- ============================================================
-- TABLE: follia_sites
-- ============================================================
CREATE TABLE public.follia_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  lead_email TEXT NOT NULL,
  claimed_at TIMESTAMPTZ,
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  business_type public.follia_business_type NOT NULL DEFAULT 'other',
  business_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  config JSONB NOT NULL DEFAULT jsonb_build_object(
    'show_map', true,
    'opening_hours', '[]'::jsonb,
    'address', '',
    'phone', '',
    'email', ''
  ),
  status public.follia_site_status NOT NULL DEFAULT 'draft',
  plan public.follia_plan,
  has_full_assistance BOOLEAN NOT NULL DEFAULT false,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subdomain_format CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$')
);

CREATE INDEX idx_follia_sites_user ON public.follia_sites(user_id);
CREATE INDEX idx_follia_sites_email ON public.follia_sites(lead_email);
CREATE INDEX idx_follia_sites_status ON public.follia_sites(status);
CREATE INDEX idx_follia_sites_subdomain ON public.follia_sites(subdomain);

GRANT SELECT, INSERT, UPDATE ON public.follia_sites TO authenticated;
GRANT SELECT ON public.follia_sites TO anon;
GRANT ALL ON public.follia_sites TO service_role;

ALTER TABLE public.follia_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own sites" ON public.follia_sites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Public reads live sites" ON public.follia_sites FOR SELECT TO anon, authenticated
  USING (status = 'live');
CREATE POLICY "Owners update own sites" ON public.follia_sites FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Service role manages sites" ON public.follia_sites FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- TABLE: follia_menu_items (restaurant)
-- ============================================================
CREATE TABLE public.follia_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.follia_sites(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Menù',
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_follia_menu_site ON public.follia_menu_items(site_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follia_menu_items TO authenticated;
GRANT SELECT ON public.follia_menu_items TO anon;
GRANT ALL ON public.follia_menu_items TO service_role;

ALTER TABLE public.follia_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage menu" ON public.follia_menu_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()));
CREATE POLICY "Public reads menu of live sites" ON public.follia_menu_items FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.status = 'live'));
CREATE POLICY "Service role manages menu" ON public.follia_menu_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- TABLE: follia_table_bookings (restaurant)
-- ============================================================
CREATE TABLE public.follia_table_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.follia_sites(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  party_size INTEGER NOT NULL CHECK (party_size > 0 AND party_size <= 50),
  slot_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  status public.follia_booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_follia_bookings_site ON public.follia_table_bookings(site_id, slot_at);

GRANT SELECT, INSERT, UPDATE ON public.follia_table_bookings TO authenticated;
GRANT INSERT ON public.follia_table_bookings TO anon;
GRANT ALL ON public.follia_table_bookings TO service_role;

ALTER TABLE public.follia_table_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read bookings" ON public.follia_table_bookings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()));
CREATE POLICY "Owners update bookings" ON public.follia_table_bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()));
CREATE POLICY "Public can create bookings on live sites" ON public.follia_table_bookings FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.status = 'live'));
CREATE POLICY "Service role manages bookings" ON public.follia_table_bookings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- TABLE: follia_products (retail showcase)
-- ============================================================
CREATE TABLE public.follia_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.follia_sites(id) ON DELETE CASCADE,
  category TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price_display TEXT,
  image_url TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_follia_products_site ON public.follia_products(site_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follia_products TO authenticated;
GRANT SELECT ON public.follia_products TO anon;
GRANT ALL ON public.follia_products TO service_role;

ALTER TABLE public.follia_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage products" ON public.follia_products FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()));
CREATE POLICY "Public reads products of live sites" ON public.follia_products FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.status = 'live'));
CREATE POLICY "Service role manages products" ON public.follia_products FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- TABLE: follia_services (salon/barber/professional)
-- ============================================================
CREATE TABLE public.follia_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.follia_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER,
  duration_minutes INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  bookable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_follia_services_site ON public.follia_services(site_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follia_services TO authenticated;
GRANT SELECT ON public.follia_services TO anon;
GRANT ALL ON public.follia_services TO service_role;

ALTER TABLE public.follia_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage services" ON public.follia_services FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()));
CREATE POLICY "Public reads services of live sites" ON public.follia_services FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.status = 'live'));
CREATE POLICY "Service role manages services" ON public.follia_services FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- TABLE: follia_appointments (salon/barber)
-- ============================================================
CREATE TABLE public.follia_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.follia_sites(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.follia_services(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  slot_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  status public.follia_booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_follia_appts_site ON public.follia_appointments(site_id, slot_at);

GRANT SELECT, INSERT, UPDATE ON public.follia_appointments TO authenticated;
GRANT INSERT ON public.follia_appointments TO anon;
GRANT ALL ON public.follia_appointments TO service_role;

ALTER TABLE public.follia_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read appointments" ON public.follia_appointments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()));
CREATE POLICY "Owners update appointments" ON public.follia_appointments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()));
CREATE POLICY "Public creates appointments on live sites" ON public.follia_appointments FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.status = 'live'));
CREATE POLICY "Service role manages appointments" ON public.follia_appointments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- TABLE: follia_tickets + messages
-- ============================================================
CREATE TABLE public.follia_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.follia_sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  category public.follia_ticket_category NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  status public.follia_ticket_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_follia_tickets_user ON public.follia_tickets(user_id, status);
CREATE INDEX idx_follia_tickets_site ON public.follia_tickets(site_id);

GRANT SELECT, INSERT, UPDATE ON public.follia_tickets TO authenticated;
GRANT ALL ON public.follia_tickets TO service_role;

ALTER TABLE public.follia_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own tickets" ON public.follia_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users create own tickets" ON public.follia_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.follia_sites s WHERE s.id = site_id AND s.user_id = auth.uid()));
CREATE POLICY "Service role manages tickets" ON public.follia_tickets FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE public.follia_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.follia_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_follia_ticket_msgs ON public.follia_ticket_messages(ticket_id, created_at);

GRANT SELECT, INSERT ON public.follia_ticket_messages TO authenticated;
GRANT ALL ON public.follia_ticket_messages TO service_role;

ALTER TABLE public.follia_ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read messages of own tickets" ON public.follia_ticket_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.follia_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "Users post messages on own tickets" ON public.follia_ticket_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND is_staff = false
    AND EXISTS (SELECT 1 FROM public.follia_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );
CREATE POLICY "Service role manages messages" ON public.follia_ticket_messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- TABLE: follia_custom_domain_requests
-- ============================================================
CREATE TABLE public.follia_custom_domain_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.follia_sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  requested_domain TEXT NOT NULL,
  include_full_assistance BOOLEAN NOT NULL DEFAULT false,
  status public.follia_domain_request_status NOT NULL DEFAULT 'pending_payment',
  stripe_session_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_follia_domain_req_user ON public.follia_custom_domain_requests(user_id);

GRANT SELECT, INSERT ON public.follia_custom_domain_requests TO authenticated;
GRANT ALL ON public.follia_custom_domain_requests TO service_role;

ALTER TABLE public.follia_custom_domain_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own domain requests" ON public.follia_custom_domain_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users create own domain requests" ON public.follia_custom_domain_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role manages domain requests" ON public.follia_custom_domain_requests FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
CREATE TRIGGER trg_follia_sites_uat BEFORE UPDATE ON public.follia_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_follia_menu_uat BEFORE UPDATE ON public.follia_menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_follia_bookings_uat BEFORE UPDATE ON public.follia_table_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_follia_products_uat BEFORE UPDATE ON public.follia_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_follia_services_uat BEFORE UPDATE ON public.follia_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_follia_appts_uat BEFORE UPDATE ON public.follia_appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_follia_tickets_uat BEFORE UPDATE ON public.follia_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_follia_domain_req_uat BEFORE UPDATE ON public.follia_custom_domain_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- STORAGE BUCKET: follia-assets
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('follia-assets', 'follia-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Follia assets are publicly readable"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'follia-assets');

CREATE POLICY "Owners upload to their site folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'follia-assets'
  AND EXISTS (
    SELECT 1 FROM public.follia_sites s
    WHERE s.user_id = auth.uid()
      AND s.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Owners update their site assets"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'follia-assets'
  AND EXISTS (
    SELECT 1 FROM public.follia_sites s
    WHERE s.user_id = auth.uid()
      AND s.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Owners delete their site assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'follia-assets'
  AND EXISTS (
    SELECT 1 FROM public.follia_sites s
    WHERE s.user_id = auth.uid()
      AND s.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Service role manages follia assets"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'follia-assets')
WITH CHECK (bucket_id = 'follia-assets');
