import { Link } from "@tanstack/react-router";
import { Package, X } from "lucide-react";
import { useLastOrder, clearLastOrder } from "@/lib/last-order";

export function OrderTrackingBanner() {
  const last = useLastOrder();
  if (!last) return null;
  return (
    <div className="border-b border-primary/30 bg-gradient-to-r from-primary/15 via-[var(--gold)]/10 to-primary/15">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-foreground">
          <Package className="h-3.5 w-3.5 text-primary" />
          <span>Your order <b className="font-mono text-[var(--gold)]">{last.order_number}</b> is in progress.</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/track" search={{ o: last.order_number, p: last.phone }} className="rounded-full fire-gradient px-3 py-1 font-bold text-white">
            Track Order →
          </Link>
          <button onClick={clearLastOrder} className="grid h-6 w-6 place-items-center rounded-full hover:bg-card" aria-label="Dismiss">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
