import { supabase } from "@/integrations/supabase/client";

export type Setting = { key: string; value: string | null };
export type Category = { id: string; name: string; display_order: number; icon: string | null; is_active: boolean };
export type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  is_bestseller: boolean;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
};
export type Deal = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  original_price: number | null;
  deal_price: number;
  items_included: string | null;
  badge_text: string | null;
  is_active: boolean;
  display_order: number;
};
export type DeliveryArea = { id: string; name: string; charge: number; est_time: string | null; is_active: boolean };
export type Review = { id: string; customer_name: string; rating: number; comment: string | null; created_at: string; is_approved: boolean; video_url: string | null };

const sb = supabase as any;

export async function fetchSettings(): Promise<Record<string, string>> {
  const { data } = await sb.from("site_settings").select("key,value");
  const map: Record<string, string> = {};
  (data ?? []).forEach((r: Setting) => { map[r.key] = r.value ?? ""; });
  return map;
}
export async function fetchCategories(): Promise<Category[]> {
  const { data } = await sb.from("categories").select("*").eq("is_active", true).order("display_order");
  return data ?? [];
}
export async function fetchMenu(): Promise<MenuItem[]> {
  const { data } = await sb.from("menu_items").select("*").eq("is_available", true).order("display_order");
  return data ?? [];
}
export async function fetchDeals(): Promise<Deal[]> {
  const { data } = await sb.from("deals").select("*").eq("is_active", true).order("display_order");
  return data ?? [];
}
export async function fetchAreas(): Promise<DeliveryArea[]> {
  const { data } = await sb.from("delivery_areas").select("*").eq("is_active", true).order("charge");
  return data ?? [];
}
export async function fetchApprovedReviews(): Promise<Review[]> {
  const { data } = await sb.from("reviews").select("*").eq("is_approved", true).order("created_at", { ascending: false }).limit(12);
  return data ?? [];
}
