-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'unlimited');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. SEO optimizer usage log
CREATE TABLE public.seo_optimizer_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  period_month date NOT NULL DEFAULT date_trunc('month', now())::date,
  is_extra boolean NOT NULL DEFAULT false,
  extra_credit_id uuid,
  input_chars integer NOT NULL DEFAULT 0,
  output_chars integer NOT NULL DEFAULT 0,
  title text,
  preview text
);

CREATE INDEX idx_seo_usage_user_period ON public.seo_optimizer_usage(user_id, period_month);
CREATE INDEX idx_seo_usage_user_created ON public.seo_optimizer_usage(user_id, created_at DESC);

ALTER TABLE public.seo_optimizer_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage"
  ON public.seo_optimizer_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages usage"
  ON public.seo_optimizer_usage FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 5. Extra credits
CREATE TABLE public.seo_optimizer_extra_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz,
  stripe_session_id text UNIQUE
);

CREATE INDEX idx_seo_credits_user_unused
  ON public.seo_optimizer_extra_credits(user_id)
  WHERE consumed_at IS NULL;

ALTER TABLE public.seo_optimizer_extra_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credits"
  ON public.seo_optimizer_extra_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages credits"
  ON public.seo_optimizer_extra_credits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 6. Quota function
CREATE OR REPLACE FUNCTION public.get_seo_quota(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unlimited boolean;
  v_plan text := 'free';
  v_limit integer := 3;
  v_used integer := 0;
  v_extra integer := 0;
  v_price_id text;
BEGIN
  -- Unlimited role?
  SELECT public.has_role(_user_id, 'unlimited'::app_role) INTO v_unlimited;

  -- Active subscription? pick latest active row in either environment, prefer live
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

  -- Usage this month (non-extra counts against quota)
  SELECT COUNT(*) INTO v_used
  FROM public.seo_optimizer_usage
  WHERE user_id = _user_id
    AND period_month = date_trunc('month', now())::date
    AND is_extra = false;

  -- Unused extra credits
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
$$;