import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, X, Loader2 } from "lucide-react";
import { uploadMedia } from "@/lib/upload";

type Props = {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  folder?: string;
  label?: string;
  kind?: "image" | "video";
};

export function MediaUpload({ value, onChange, accept, folder = "uploads", label, kind = "image" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const isVideo = kind === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(value);

  async function handle(file: File) {
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Uploaded ✓");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>}
      {value ? (
        <div className="relative inline-block">
          {isVideo ? (
            <video src={value} className="h-28 w-40 object-cover rounded-lg border border-border" muted />
          ) : (
            <img src={value} alt="" className="h-28 w-40 object-cover rounded-lg border border-border" />
          )}
          <button type="button" onClick={() => onChange("")} className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => ref.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-[var(--secondary-bg)] px-3 py-2 text-xs font-bold hover:border-primary disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {busy ? "Uploading…" : value ? "Replace" : `Upload ${kind}`}
        </button>
        <input
          ref={ref}
          type="file"
          accept={accept ?? (kind === "video" ? "video/*" : "image/*")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
            e.target.value = "";
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <LinkIcon className="h-3 w-3 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste a URL"
          className="flex-1 rounded-lg border border-border bg-[var(--secondary-bg)] px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
    </div>
  );
}
