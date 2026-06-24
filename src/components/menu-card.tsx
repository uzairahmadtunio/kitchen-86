import { Flame, Plus } from "lucide-react";
import type { MenuItem } from "@/lib/site-data";
import { pkr } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

export function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--secondary-bg)]">
        {item.image_url && (
          <img src={item.image_url} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        )}
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          {item.is_bestseller && (
            <span className="inline-flex items-center gap-1 rounded-full fire-gradient px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
              <Flame className="h-3 w-3" /> Bestseller
            </span>
          )}
          {item.original_price && Number(item.original_price) > Number(item.price) && (
            <span className="ml-auto rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-black uppercase text-black">
              Save {pkr(Number(item.original_price) - Number(item.price))}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold leading-tight">{item.name}</h3>
        {item.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-black text-[var(--gold)]">{pkr(item.price)}</div>
            {item.original_price && Number(item.original_price) > Number(item.price) && (
              <div className="text-xs text-muted-foreground line-through">{pkr(item.original_price)}</div>
            )}
          </div>
          <button
            onClick={() => add({ itemId: item.id, name: item.name, price: Number(item.price), image: item.image_url ?? undefined })}
            className="inline-flex items-center gap-1 rounded-lg fire-gradient px-3 py-2 text-xs font-bold text-white transition-transform hover:scale-105"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
