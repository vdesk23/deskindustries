
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  cover_url TEXT,
  content_md TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'insight',
  tags TEXT[] NOT NULL DEFAULT '{}',
  author_name TEXT NOT NULL DEFAULT 'Desk Industries',
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX blog_posts_published_idx ON public.blog_posts (published, published_at DESC);
CREATE INDEX blog_posts_category_idx ON public.blog_posts (category);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can read all posts"
  ON public.blog_posts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can read blog covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-covers');

CREATE POLICY "Admins can upload blog covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));
