CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
      AND (_user_id = auth.uid() OR auth.role() = 'service_role' OR auth.uid() IS NULL AND current_user IN ('postgres','supabase_admin'))
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  -- Purchases/subscriptions are no longer auto-linked by unverified email.
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "Owners update own sites" ON public.follia_sites;
REVOKE UPDATE ON public.follia_sites FROM authenticated, anon;