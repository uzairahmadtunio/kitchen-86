
-- pages
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pages public read" ON public.pages FOR SELECT USING (is_active = true);
CREATE POLICY "pages auth write" ON public.pages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- team_members
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  image_url text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team public read" ON public.team_members FOR SELECT USING (is_active = true);
CREATE POLICY "team auth write" ON public.team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed pages
INSERT INTO public.pages (slug, title, content) VALUES
('privacy-policy', 'Privacy Policy',
'Kitchen 86 Privacy Policy

Last updated: January 2025

1. Information We Collect
We collect your name, phone number, and delivery address only to process your food orders. We do not store payment card details.

2. How We Use Your Information
Your information is used solely to:
- Process and deliver your order
- Send order confirmation via WhatsApp
- Improve our service

3. Data Sharing
We do not sell or share your personal information with any third parties. Your data stays with Kitchen 86 only.

4. WhatsApp Communication
By placing an order, you agree to receive order updates on WhatsApp from +923064379361.

5. Contact Us
For any privacy concerns:
WhatsApp: +923064379361
Address: Station Road, Larkana, Sindh'),
('about-us', 'About Kitchen 86',
'Kitchen 86 — Always Fresh · Always Fire

We are Larkana''s late-night flavour destination, serving freshly cooked burgers, pizzas, broasts and shakes from 4PM till 6AM every single day.

Born on Station Road, Kitchen 86 was started by a small team of food lovers with one mission — give Larkana the kind of bold, juicy, hand-crafted food that big cities take for granted, at prices that make sense.

Every patty is smashed fresh. Every pizza is hand-stretched. Every broast piece is brined for 24 hours. Nothing pre-cooked, nothing reheated, nothing compromised.

Whether you''re grabbing a quick bite after class or feeding the whole family at 2AM, Kitchen 86 has got you. 🔥'),
('contact-us', 'Contact Us',
'Contact Kitchen 86

📍 Address: Station Road, Larkana, Sindh, Pakistan
📱 WhatsApp: +923064379361
📞 Phone: +923064379361
🕐 Hours: Daily 4:00 PM to 6:00 AM

Social Media:
Facebook: Kitchen 86
Instagram: @the_kitchen86
TikTok: @the_kitchen86

For orders, complaints, or feedback — WhatsApp karo hamen! We reply fast.');

INSERT INTO public.team_members (name, role, bio, image_url, display_order) VALUES
('Kitchen 86 Team', 'Our Amazing Team', 'The passionate people behind every delicious meal', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400', 1);

-- Storage policies for team-photos (private bucket; signed URLs in code)
CREATE POLICY "team-photos read auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'team-photos');
CREATE POLICY "team-photos read anon"  ON storage.objects FOR SELECT TO anon USING (bucket_id = 'team-photos');
CREATE POLICY "team-photos insert"     ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'team-photos');
CREATE POLICY "team-photos update"     ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'team-photos');
CREATE POLICY "team-photos delete"     ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'team-photos');
