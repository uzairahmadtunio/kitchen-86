import { Plus } from "lucide-react";
import type { Deal } from "@/lib/site-data";
import { pkr } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

export function DealCard({ deal }: { deal: Deal }) {
  const { add } = useCart();
  const save = Number(deal.original_price ?? 0) - Number(deal.deal_price);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card card-hover">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--secondary-bg)]">
        {deal.image_url && <img src={deal.image_url} alt={deal.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        {deal.badge_text && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full fire-gradient px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white animate-pulse-fire">
            {deal.badge_text}
          </span>
        )}
        {save > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-black uppercase text-black">
            Save {pkr(save)}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-xl font-black leading-tight">{deal.name}</h3>
          <p className="mt-1 text-xs text-white/80 line-clamp-2">{deal.items_included}</p>
        </div>
      </div>
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="text-2xl font-black text-[var(--gold)]">{pkr(deal.deal_price)}</div>
          {deal.original_price && <div className="text-xs text-muted-foreground line-through">{pkr(deal.original_price)}</div>}
        </div>
        <button
          onClick={() => add({ itemId: `deal-${deal.id}`, name: deal.name, price: Number(deal.deal_price), image: deal.image_url ?? undefined })}
          className="inline-flex items-center gap-1 rounded-lg fire-gradient px-4 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Add Deal
        </button>
      </div>
    </div>
  );
}
