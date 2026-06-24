import { Flame } from "lucide-react";

export function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;
  const items = Array.from({ length: 6 }).map((_, i) => text + (i % 2 === 0 ? "  🔥  " : "  ⚡  "));
  return (
    <div className="overflow-hidden border-b border-border" style={{ background: "#FF4500" }}>
      <div className="flex items-center gap-3 py-2">
        <div className="flex gap-12 whitespace-nowrap marquee text-sm font-black text-white">
          {items.concat(items).map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2"><Flame className="h-3.5 w-3.5" />{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
