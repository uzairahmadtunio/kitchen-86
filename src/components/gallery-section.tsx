import { useEffect, useState } from "react";
import { X } from "lucide-react";

const IMAGES = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80",
  "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=900&q=80",
  "https://images.unsplash.com/photo-1562967914-608f82629710?w=900&q=80",
  "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=900&q=80",
  "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=900&q=80",
  "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&q=80",
];

export function GallerySection() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [lightbox]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-6 sm:mb-8 text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold">🔥 Snapshots</div>
        <h2 className="mt-2 text-3xl sm:text-5xl font-black">Our Food <span className="fire-text">Gallery</span></h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {IMAGES.map((src, i) => (
          <button key={i} onClick={() => setLightbox(src)} className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card">
            <img src={src} alt={`Kitchen 86 dish ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FF4500]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-[100] grid place-items-center bg-black/90 backdrop-blur p-4 animate-fade-in">
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <img src={lightbox} alt="Kitchen 86" className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain animate-scale-in" />
        </div>
      )}
    </section>
  );
}
