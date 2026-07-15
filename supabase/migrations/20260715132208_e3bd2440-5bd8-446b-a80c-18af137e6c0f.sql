CREATE OR REPLACE FUNCTION public.get_seo_quota(_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_unlimited boolean;
  v_plan text := 'free';
  v_limit integer := 3;
  v_used integer := 0;
  v_extra integer := 0;
  v_price_id text;
  v_caller uuid := auth.uid();
BEGIN
  -- Only allow callers to look up their own quota. Service-role callers
  -- (edge functions) have a NULL auth.uid() and remain permitted.
  IF v_caller IS NOT NULL AND v_caller <> _user_id THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT public.has_role(_user_id, 'unlimited'::app_role) INTO v_unlimited;

  SELECT price_id INTO v_price_id
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND status IN ('active','trialing','past_due')
    AND (current_period_end IS NULL OR current_period_end > now())
    AND price_id IN ('seo_optimizer_starter','seo_optimizer_pro')
  ORDER BY (environment = 'live') DESC, created_at DESC
  LIMIT 1;

  IF v_price_id = 'seo_optimizer_pro' THEN
    v_plan := 'pro'; v_limit := 25;
  ELSIF v_price_id = 'seo_optimizer_starter' THEN
    v_plan := 'starter'; v_limit := 10;
  END IF;

  SELECT COUNT(*) INTO v_used
  FROM public.seo_optimizer_usage
  WHERE user_id = _user_id
    AND period_month = date_trunc('month', now())::date
    AND is_extra = false;

  SELECT COUNT(*) INTO v_extra
  FROM public.seo_optimizer_extra_credits
  WHERE user_id = _user_id AND consumed_at IS NULL;

  RETURN jsonb_build_object(
    'unlimited', COALESCE(v_unlimited, false),
    'plan', v_plan,
    'limit', v_limit,
    'used_this_month', v_used,
    'extra_credits', v_extra
  );
END;
$function$;