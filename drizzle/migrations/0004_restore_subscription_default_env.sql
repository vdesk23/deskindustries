CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'sandbox')
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() <> user_uuid)
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid AND environment = check_env
      AND ((status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now()))
  );
END; $$;