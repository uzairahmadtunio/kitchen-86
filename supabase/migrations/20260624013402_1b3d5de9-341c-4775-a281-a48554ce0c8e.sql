
-- Helper: admin check
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'manager',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid())) AND is_active = true)
$$;

CREATE POLICY "admins read admin_users" ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins manage admin_users" ON public.admin_users FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- site_settings
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins write settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order int DEFAULT 0,
  icon text,
  is_active boolean DEFAULT true
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "admins write categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- menu_items
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  original_price numeric,
  image_url text,
  is_bestseller boolean DEFAULT false,
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sizes jsonb,
  addons jsonb,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read menu" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "admins write menu" ON public.menu_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- deals
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  original_price numeric,
  deal_price numeric NOT NULL,
  items_included text,
  badge_text text,
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0,
  valid_until timestamptz
);
GRANT SELECT ON public.deals TO anon, authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read deals" ON public.deals FOR SELECT USING (true);
CREATE POLICY "admins write deals" ON public.deals FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- cart_suggestions
CREATE TABLE public.cart_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE CASCADE,
  label text,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true
);
GRANT SELECT ON public.cart_suggestions TO anon, authenticated;
GRANT ALL ON public.cart_suggestions TO service_role;
ALTER TABLE public.cart_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read suggestions" ON public.cart_suggestions FOR SELECT USING (true);
CREATE POLICY "admins write suggestions" ON public.cart_suggestions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- delivery_areas
CREATE TABLE public.delivery_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  charge numeric NOT NULL DEFAULT 0,
  min_order numeric DEFAULT 0,
  est_time text,
  is_active boolean DEFAULT true
);
GRANT SELECT ON public.delivery_areas TO anon, authenticated;
GRANT ALL ON public.delivery_areas TO service_role;
ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read areas" ON public.delivery_areas FOR SELECT USING (true);
CREATE POLICY "admins write areas" ON public.delivery_areas FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT ('K86-' || to_char(now(),'YYMMDD') || '-' || lpad(floor(random()*10000)::text,4,'0')),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_area text,
  delivery_charge numeric DEFAULT 0,
  address text,
  notes text,
  payment_method text DEFAULT 'cod',
  subtotal numeric NOT NULL,
  total numeric NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.is_admin());

-- order_items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_price numeric NOT NULL,
  quantity int NOT NULL,
  customizations jsonb,
  subtotal numeric NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read order_items" ON public.order_items FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins delete order_items" ON public.order_items FOR DELETE TO authenticated USING (public.is_admin());

-- reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "admins read all reviews" ON public.reviews FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "admins write reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.is_admin());
