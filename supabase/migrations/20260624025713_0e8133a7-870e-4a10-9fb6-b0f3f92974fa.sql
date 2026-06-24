
CREATE POLICY "anyone_upload_payment_screenshots" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "auth_read_payment_screenshots" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-screenshots');
