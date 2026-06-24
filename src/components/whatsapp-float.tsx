import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { fetchSettings } from "@/lib/site-data";

type Pos = { x: number; y: number };

const BTN = 56;
const MARGIN = 16;

function defaultPos(): Pos {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  return { x: window.innerWidth - BTN - 24, y: window.innerHeight - BTN - 24 };
}

export function WhatsAppFloat() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 60_000 });
  const number = (settings?.whatsapp ?? "+923064379361").replace(/\D/g, "");

  const [pos, setPos] = useState<Pos>(() => defaultPos());
  const [hidden, setHidden] = useState(false);
  const [dragging, setDragging] = useState(false);
  const movedRef = useRef(false);
  const dragStart = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  // Restore saved position (session only — refresh keeps, no localStorage for "hidden")
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("wa-float-pos");
      if (raw) {
        const p = JSON.parse(raw) as Pos;
        if (typeof p.x === "number" && typeof p.y === "number") setPos(clamp(p));
      }
    } catch {}
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function clamp(p: Pos): Pos {
    if (typeof window === "undefined") return p;
    return {
      x: Math.max(MARGIN, Math.min(window.innerWidth - BTN - MARGIN, p.x)),
      y: Math.max(MARGIN, Math.min(window.innerHeight - BTN - MARGIN, p.y)),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    movedRef.current = false;
    setDragging(true);
    dragStart.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
    setPos(clamp({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy }));
  }
  function onPointerUp(e: React.PointerEvent) {
    setDragging(false);
    dragStart.current = null;
    try { sessionStorage.setItem("wa-float-pos", JSON.stringify(pos)); } catch {}
    if (movedRef.current) e.preventDefault();
  }
  function onClick(e: React.MouseEvent) {
    if (movedRef.current) { e.preventDefault(); return; }
  }

  if (!number) return null;
  const url = `https://wa.me/${number}?text=${encodeURIComponent("Hi Kitchen 86! I'd like to order 🍔")}`;

  // Hidden mini-restore dot
  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        aria-label="Show WhatsApp button"
        className="fixed z-40 grid h-6 w-6 place-items-center rounded-full bg-[#25D366] text-white shadow-md ring-2 ring-black/40 hover:scale-110 transition-transform"
        style={{ left: pos.x + BTN / 2 - 12, top: pos.y + BTN / 2 - 12 }}
      >
        <svg viewBox="0 0 24 24" fill="white" className="h-3.5 w-3.5" aria-hidden="true"><path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.89c0 2.09.55 4.13 1.59 5.93L0 24l6.32-1.66a11.86 11.86 0 0 0 5.73 1.46c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.4-8.42Z"/></svg>
      </button>
    );
  }

  return (
    <div
      className="fixed z-40 select-none touch-none"
      style={{ left: pos.x, top: pos.y, transition: dragging ? "none" : "left .2s ease, top .2s ease" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={onClick}
        draggable={false}
        aria-label="Order via WhatsApp"
        className={`group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/40 ${dragging ? "cursor-grabbing scale-105" : "cursor-grab hover:scale-110"} transition-transform`}
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />
        <span className="absolute -inset-1 rounded-full ring-2 ring-[#25D366]/40 pointer-events-none" />
        <svg viewBox="0 0 24 24" fill="white" className="relative h-7 w-7" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      </a>
      {/* Hide circle */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setHidden(true); }}
        aria-label="Hide WhatsApp button"
        className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-foreground/80 hover:bg-[var(--primary)] hover:text-white transition-colors shadow"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
