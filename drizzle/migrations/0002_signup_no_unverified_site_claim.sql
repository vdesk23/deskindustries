CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  UPDATE public.purchases
  SET user_id = NEW.id
  WHERE customer_email = NEW.email AND user_id IS NULL;

  UPDATE public.subscriptions
  SET user_id = NEW.id
  WHERE customer_email = NEW.email AND user_id IS NULL;

  -- Sites are claimed only after email verification (handled in app code).
  RETURN NEW;
END;
$function$;