
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  account_title TEXT,
  account_number TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment methods"
  ON public.payment_methods FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage payment methods"
  ON public.payment_methods FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_methods (code, label, description, icon, sort_order, is_active) VALUES
  ('cod', 'Cash on Delivery', 'Pay with cash when your order arrives', '💵', 1, true),
  ('jazzcash', 'JazzCash', 'Send payment via JazzCash', '📱', 2, false),
  ('easypaisa', 'EasyPaisa', 'Send payment via EasyPaisa', '📲', 3, false),
  ('bank', 'Bank Transfer', 'Direct bank transfer', '🏦', 4, false);
