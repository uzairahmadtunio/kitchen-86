import { useEffect, useMemo, useState } from "react";
import { X, Flame, Minus, Plus, ShoppingCart } from "lucide-react";
import type { MenuItem, Category } from "@/lib/site-data";
import { pkr } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

type Size = { label: string; delta: number };
type Addon = { label: string; delta: number };

function normalizeOptions(raw: any): { label: string; delta: number }[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((o: any) => {
      if (typeof o === "string") return { label: o, delta: 0 };
      const label = String(o.label ?? o.name ?? "").trim();
      const delta = Number(o.delta ?? o.price ?? o.extra ?? 0) || 0;
      return label ? { label, delta } : null;
    })
    .filter(Boolean) as { label: string; delta: number }[];
}

export function ItemDetailModal({
  item,
  allItems,
  categories,
  onClose,
}: {
  item: MenuItem;
  allItems: MenuItem[];
  categories: Category[];
  onClose: () => void;
}) {
  const { add } = useCart();
  const sizes: Size[] = useMemo(() => normalizeOptions((item as any).sizes), [item]);
  const addons: Addon[] = useMemo(() => normalizeOptions((item as any).addons), [item]);

  const [sizeIdx, setSizeIdx] = useState<number>(0);
  const [picked, setPicked] = useState<Record<number, boolean>>({});
  const [qty, setQty] = useState(1);
  const [spice, setSpice] = useState<string>("Medium");

  // Reset state when switching items
  useEffect(() => {
    setSizeIdx(0);
    setPicked({});
    setQty(1);
    setSpice("Medium");
  }, [item.id]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const sizeDelta = sizes[sizeIdx]?.delta ?? 0;
  const addonsDelta = addons.reduce((s, a, i) => s + (picked[i] ? a.delta : 0), 0);
  const unit = Number(item.price) + sizeDelta + addonsDelta;
  const total = unit * qty;
  const savings = item.original_price && Number(item.original_price) > Number(item.price)
    ? Number(item.original_price) - Number(item.price) : 0;

  const category = categories.find((c) => c.id === item.category_id);
  const related = allItems
    .filter((m) => m.category_id === item.category_id && m.id !== item.id)
    .slice(0, 6);

  function handleAdd() {
    const sizeLabel = sizes[sizeIdx]?.label;
    const addonLabels = addons.filter((_, i) => picked[i]).map((a) => a.label);
    const variantKey = [sizeLabel, ...addonLabels, `spice:${spice}`].filter(Boolean).join("|");
    const id = `${item.id}::${variantKey}`;
    const noteParts: string[] = [];
    if (sizeLabel && sizes.length > 1) noteParts.push(`Size: ${sizeLabel}`);
    if (addonLabels.length) noteParts.push(`Add-ons: ${addonLabels.join(", ")}`);
    noteParts.push(`Spice: ${spice}`);
    add({
      id,
      itemId: item.id,
      name: sizeLabel && sizes.length > 1 ? `${item.name} (${sizeLabel})` : item.name,
      price: unit,
      image: item.image_url ?? undefined,
      quantity: qty,
      notes: noteParts.join(" · "),
    });
    toast.success(`✅ Added ${qty}× ${item.name} to cart`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-[600px] sm:rounded-2xl bg-card border border-border shadow-2xl flex flex-col max-h-[100vh] sm:max-h-[90vh] animate-scale-in"
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-28 sm:pb-4">
          {/* Image */}
          <div className="relative h-[220px] sm:h-[280px] w-full overflow-hidden bg-[var(--secondary-bg)] sm:rounded-t-2xl">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-muted-foreground">No image</div>
            )}
            <div className="absolute left-3 top-3 flex gap-2">
              {item.is_bestseller && (
                <span className="inline-flex items-center gap-1 rounded-full fire-gradient px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  <Flame className="h-3 w-3" /> Bestseller
                </span>
              )}
              {category && (
                <span className="rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-[10px] font-black uppercase text-white">
                  {category.icon} {category.name}
                </span>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="px-5 sm:px-6 pt-5">
            <h2 className="text-2xl font-black leading-tight">{item.name}</h2>
            {item.description && (
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            )}
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <div className="text-2xl font-black text-[var(--gold)]">{pkr(item.price)}</div>
              {item.original_price && Number(item.original_price) > Number(item.price) && (
                <div className="text-sm text-muted-foreground line-through">{pkr(item.original_price)}</div>
              )}
              {savings > 0 && (
                <span className="rounded-full bg-[var(--success)]/15 text-[var(--success)] px-2 py-0.5 text-[10px] font-black uppercase">
                  Save {pkr(savings)}
                </span>
              )}
            </div>
          </div>

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="px-5 sm:px-6 mt-6">
              <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Size</div>
              <div className="space-y-2">
                {sizes.map((s, i) => (
                  <label
                    key={i}
                    className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer ${
                      sizeIdx === i ? "border-primary bg-[var(--secondary-bg)]" : "border-border"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="size"
                        checked={sizeIdx === i}
                        onChange={() => setSizeIdx(i)}
                        className="accent-primary"
                      />
                      <span className="font-bold text-sm">{s.label}</span>
                    </span>
                    <span className="text-xs font-bold text-[var(--gold)]">
                      {s.delta > 0 ? `+${pkr(s.delta)}` : s.delta < 0 ? `-${pkr(-s.delta)}` : "Included"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {addons.length > 0 && (
            <div className="px-5 sm:px-6 mt-6">
              <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Add-ons</div>
              <div className="space-y-2">
                {addons.map((a, i) => (
                  <label
                    key={i}
                    className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer ${
                      picked[i] ? "border-primary bg-[var(--secondary-bg)]" : "border-border"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!picked[i]}
                        onChange={(e) => setPicked((p) => ({ ...p, [i]: e.target.checked }))}
                        className="accent-primary h-4 w-4"
                      />
                      <span className="font-bold text-sm">{a.label}</span>
                    </span>
                    <span className="text-xs font-bold text-[var(--gold)]">
                      {a.delta > 0 ? `+${pkr(a.delta)}` : a.delta < 0 ? `-${pkr(-a.delta)}` : "Free"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Spice level */}
          <div className="px-5 sm:px-6 mt-6">
            <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Spice Level</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Mild", icon: "🟢" },
                { label: "Medium", icon: "🟡" },
                { label: "Hot", icon: "🔴" },
                { label: "Extra Hot", icon: "🔥" },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSpice(s.label)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 text-[11px] font-bold transition ${
                    spice === s.label ? "border-primary bg-[var(--secondary-bg)]" : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg leading-none">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="px-5 sm:px-6 mt-6">
            <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Quantity</div>
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-border p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-10 w-10 place-items-center rounded-lg fire-gradient text-white disabled:opacity-40"
                disabled={qty <= 1}
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="w-10 text-center font-black text-lg">{qty}</div>
              <button
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                className="grid h-10 w-10 place-items-center rounded-lg fire-gradient text-white disabled:opacity-40"
                disabled={qty >= 10}
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <div className="px-5 sm:px-6 text-sm font-black mb-3">You Might Also Like 🔥</div>
              <div className="px-5 sm:px-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {related.map((r) => (
                  <RelatedCard key={r.id} item={r} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky add-to-cart */}
        <div className="absolute sm:static bottom-0 inset-x-0 border-t border-border bg-card p-4 sm:rounded-b-2xl">
          <button
            onClick={handleAdd}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl fire-gradient px-6 py-3.5 text-sm font-black uppercase text-white"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart — {pkr(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

function RelatedCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  return (
    <div className="shrink-0 w-[140px] rounded-xl border border-border bg-[var(--secondary-bg)] overflow-hidden">
      <div className="h-[90px] w-full bg-card overflow-hidden">
        {item.image_url && (
          <img src={item.image_url} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-2">
        <div className="text-xs font-bold line-clamp-1">{item.name}</div>
        <div className="mt-1 flex items-center justify-between gap-1">
          <span className="text-xs font-black text-[var(--gold)]">{pkr(item.price)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              add({ itemId: item.id, name: item.name, price: Number(item.price), image: item.image_url ?? undefined });
              toast.success(`✅ Added ${item.name}`);
            }}
            className="grid h-7 w-7 place-items-center rounded-full fire-gradient text-white"
            aria-label={`Add ${item.name}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
