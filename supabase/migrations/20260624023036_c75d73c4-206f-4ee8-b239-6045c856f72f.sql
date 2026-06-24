ALTER TABLE public.delivery_areas
  ADD COLUMN IF NOT EXISTS zone TEXT;

GRANT SELECT ON public.delivery_areas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_areas TO authenticated;
GRANT ALL ON public.delivery_areas TO service_role;

DELETE FROM public.delivery_areas;

INSERT INTO public.delivery_areas (name, zone, charge, est_time, is_active) VALUES
  ('Station Road / City Centre', 'A', 50, '15-25 mins', true),
  ('Lahori Muhalla', 'A', 50, '15-25 mins', true),
  ('Hyderi Muhalla', 'A', 50, '15-25 mins', true),
  ('Sachal Colony', 'A', 50, '15-25 mins', true),
  ('Peoples Colony', 'A', 50, '15-25 mins', true),
  ('Doctors Colony', 'A', 50, '15-25 mins', true),
  ('Civil Lines', 'A', 50, '15-25 mins', true),
  ('Chandka Pull / Chandka Area', 'B', 80, '20-30 mins', true),
  ('Shaikh Zaid Colony', 'B', 80, '20-30 mins', true),
  ('Municipal Housing Colony', 'B', 80, '20-30 mins', true),
  ('Qasimabad', 'B', 80, '20-30 mins', true),
  ('New Sabzi Mandi Area', 'B', 80, '20-30 mins', true),
  ('Railway Colony', 'B', 80, '20-30 mins', true),
  ('Cantt Area', 'B', 80, '20-30 mins', true),
  ('SZABIST / University Road', 'C', 120, '25-40 mins', true),
  ('Industrial Estate Area', 'C', 120, '25-40 mins', true),
  ('QUCEST Area', 'C', 120, '25-40 mins', true),
  ('Bhutto Colony', 'C', 120, '25-40 mins', true),
  ('Model Colony', 'C', 120, '25-40 mins', true),
  ('Shah Hassan Colony', 'C', 120, '25-40 mins', true),
  ('Naudero Pull Area', 'C', 120, '25-40 mins', true),
  ('Scheme 33', 'D', 150, '35-50 mins', true),
  ('New City Area', 'D', 150, '35-50 mins', true),
  ('Cadet College Area', 'D', 150, '35-50 mins', true),
  ('Sugar Mill Area', 'D', 150, '35-50 mins', true),
  ('Other / Custom Area', 'Custom', 100, 'Admin will confirm', true);