import { useState } from "react";
import { Upload, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BUCKET = "payment-screenshots";
const SIGN_EXPIRY = 60 * 60 * 24 * 365 * 5;

export function PaymentScreenshotUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Max 8MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) throw error;
      const { data, error: e2 } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGN_EXPIRY);
      if (e2 || !data) throw e2 ?? new Error("Sign URL failed");
      onChange(data.signedUrl);
      toast.success("✅ Screenshot uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  if (value) {
    return (
      <div className="rounded-lg border-2 border-[var(--success)] bg-[var(--success)]/5 p-3 flex items-center gap-3">
        <img src={value} alt="screenshot" className="h-14 w-14 rounded-md object-cover border border-border" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[var(--success)] flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Screenshot uploaded</div>
          <div className="text-[10px] text-muted-foreground truncate">Ready to attach</div>
        </div>
        <button onClick={() => onChange("")} className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive" aria-label="Remove">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <label className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-[var(--secondary-bg)] px-4 py-3 text-xs font-bold cursor-pointer hover:border-primary ${busy ? "opacity-60 pointer-events-none" : ""}`}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      📸 {busy ? "Uploading..." : "Upload Payment Screenshot (optional)"}
      <input type="file" accept="image/*" className="hidden" onChange={onPick} disabled={busy} />
    </label>
  );
}
