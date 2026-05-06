INSERT INTO storage.buckets (id, name, public)
VALUES ('content-plans', 'content-plans', false)
ON CONFLICT (id) DO NOTHING;