
-- 1) Helper: check if a site is live (SECURITY DEFINER so child policies can use it without exposing follia_sites)
CREATE OR REPLACE FUNCTION public.is_follia_site_live(_site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.follia_sites
    WHERE id = _site_id AND status = 'live'
  );
$$;

REVOKE ALL ON FUNCTION public.is_follia_site_live(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_follia_site_live(uuid) TO anon, authenticated, service_role;

-- 2) Drop public-read policy on follia_sites (SSR uses service role)
DROP POLICY IF EXISTS "Public reads live sites" ON public.follia_sites;

-- 3) Recreate child-table public-read policies via the helper

-- follia_menu_items
DROP POLICY IF EXISTS "Public reads menu of live sites" ON public.follia_menu_items;
CREATE POLICY "Public reads menu of live sites" ON public.follia_menu_items
  FOR SELECT TO anon, authenticated
  USING (public.is_follia_site_live(site_id));

-- follia_products
DROP POLICY IF EXISTS "Public reads products of live sites" ON public.follia_products;
CREATE POLICY "Public reads products of live sites" ON public.follia_products
  FOR SELECT TO anon, authenticated
  USING (public.is_follia_site_live(site_id));

-- follia_services
DROP POLICY IF EXISTS "Public reads services of live sites" ON public.follia_services;
CREATE POLICY "Public reads services of live sites" ON public.follia_services
  FOR SELECT TO anon, authenticated
  USING (public.is_follia_site_live(site_id));

-- follia_appointments (public INSERT)
DROP POLICY IF EXISTS "Public creates appointments on live sites" ON public.follia_appointments;
CREATE POLICY "Public creates appointments on live sites" ON public.follia_appointments
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_follia_site_live(site_id));

-- follia_table_bookings (public INSERT)
DROP POLICY IF EXISTS "Public can create bookings on live sites" ON public.follia_table_bookings;
CREATE POLICY "Public can create bookings on live sites" ON public.follia_table_bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_follia_site_live(site_id));

-- 4) Storage: prevent listing the public follia-assets bucket
-- (Files remain accessible via their public URLs; only API listing is removed.)
DROP POLICY IF EXISTS "Follia assets are publicly readable" ON storage.objects;
