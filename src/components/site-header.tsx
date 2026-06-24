import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu as MenuIcon, X, Flame, Package } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { OrderTrackingBanner } from "@/components/order-tracking-banner";

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/track", label: "Track Order" },
    { to: "/#deals", label: "Deals" },
    { to: "/#about", label: "About" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <OrderTrackingBanner />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-10 w-10 place-items-center rounded-lg fire-gradient">
            <Flame className="h-5 w-5 text-white" />
          </span>
          <div className="leading-tight">
            <div className="text-lg font-black tracking-tight">KITCHEN <span className="fire-text">86</span></div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">Always Fresh · Always Fire</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/track" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold hover:border-primary">
            <Package className="h-3.5 w-3.5" /> Track
          </Link>
          <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white glow-orange transition-transform hover:scale-105">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--gold)] px-1.5 text-[11px] font-black text-black">{count}</span>
            )}
          </Link>
          <button className="md:hidden grid h-10 w-10 place-items-center rounded-lg border border-border" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="flex flex-col p-4 gap-1">
            {links.map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-card">{l.label}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
