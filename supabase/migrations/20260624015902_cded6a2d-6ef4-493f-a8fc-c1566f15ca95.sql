
-- 1. Add video_url to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS video_url text;

-- 2. Public order tracking RPC (guest order tracking by order_number + phone)
CREATE OR REPLACE FUNCTION public.track_order(p_order_number text, p_phone text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_items jsonb;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE order_number = upper(trim(p_order_number))
    AND regexp_replace(customer_phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'item_name', item_name, 'quantity', quantity, 'subtotal', subtotal
  )), '[]'::jsonb) INTO v_items
  FROM public.order_items WHERE order_id = v_order.id;

  RETURN jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'customer_name', v_order.customer_name,
    'delivery_area', v_order.delivery_area,
    'address', v_order.address,
    'subtotal', v_order.subtotal,
    'delivery_charge', v_order.delivery_charge,
    'total', v_order.total,
    'payment_method', v_order.payment_method,
    'created_at', v_order.created_at,
    'items', v_items
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;

-- 3. Storage policies for kitchen86-media bucket
CREATE POLICY "admin upload kitchen86-media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kitchen86-media' AND public.is_admin());

CREATE POLICY "admin update kitchen86-media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'kitchen86-media' AND public.is_admin());

CREATE POLICY "admin delete kitchen86-media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kitchen86-media' AND public.is_admin());

CREATE POLICY "public read kitchen86-media"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'kitchen86-media');
