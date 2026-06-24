
-- Add payment screenshot + verification to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_screenshot_url text,
  ADD COLUMN IF NOT EXISTS payment_verified boolean NOT NULL DEFAULT false;

-- Customizations (spice level, addons, etc.) on order_items
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS customizations jsonb;

-- Admin role (super_admin / manager)
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'super_admin';

-- Announcement on/off flag (key/value already exists)
INSERT INTO public.site_settings(key, value) VALUES ('announcement_active','true')
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings(key, value) VALUES ('announcement','🔥 Zinger86 Combo PKR 399 only! | Free delivery above PKR 800 | Open 4PM – 6AM')
ON CONFLICT (key) DO NOTHING;

-- Enable realtime for orders (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='orders'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.orders';
  END IF;
END $$;

-- Public can insert their own payment screenshot URL on insert (already covered by orders insert policy).
-- Add a permissive update policy ONLY for payment_screenshot_url? Not needed: screenshot is uploaded then included in INSERT.
