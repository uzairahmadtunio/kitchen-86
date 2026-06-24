import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu as MenuIcon, X, Flame, Package, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { OrderTrackingBanner } from "@/components/order-tracking-banner";

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false);
  const prevCount = useRef(count);
  const links = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/track", label: "Track Order" },
    { to: "/#deals", label: "Deals" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];
  useEffect(() => {
    if (count > prevCount.current) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 650);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

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
          <Link to="/track" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold hover:border-primary min-h-11">
            <Package className="h-3.5 w-3.5" /> Track
          </Link>
          <Link to="/cart" className={`relative inline-flex items-center gap-2 rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white glow-orange transition-transform hover:scale-105 min-h-11 ${bounce ? "animate-cart-bounce" : ""}`}>
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span key={count} className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--gold)] px-1.5 text-[11px] font-black text-black animate-badge-pop">{count}</span>
            )}
          </Link>
          <button className="md:hidden grid h-11 w-11 place-items-center rounded-lg border border-border" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile full-screen overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 top-0 z-50 bg-black/95 backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-lg fire-gradient"><Flame className="h-5 w-5 text-white" /></span>
              <div className="text-lg font-black">KITCHEN <span className="fire-text">86</span></div>
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-lg border border-border">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col p-4 gap-2">
            {links.map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="rounded-xl border border-border bg-card px-4 py-4 text-base font-bold hover:border-primary min-h-11">{l.label}</a>
            ))}
            <Link to="/cart" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl fire-gradient px-4 py-4 text-base font-black uppercase text-white">
              <ShoppingBag className="h-5 w-5" /> View Cart {count > 0 && <span className="rounded-full bg-black/30 px-2 text-xs">{count}</span>}
            </Link>
            <a href="https://wa.me/923064379361" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-4 py-4 text-base font-bold text-white">
              <Phone className="h-5 w-5" /> WhatsApp Order
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
