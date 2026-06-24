import { supabase } from "@/integrations/supabase/client";

const BUCKET = "kitchen86-media";
// 10 years in seconds — bucket is private, signed URL approximates "public"
const SIGN_EXPIRY = 60 * 60 * 24 * 365 * 10;

export async function uploadMedia(file: File, folder = "uploads"): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGN_EXPIRY);
  if (e2 || !data) throw e2 ?? new Error("Could not sign URL");
  return data.signedUrl;
}
