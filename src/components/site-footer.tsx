import { Link } from "@tanstack/react-router";
import { Flame, Phone, Instagram, Facebook } from "lucide-react";

export function SiteFooter({ settings }: { settings: Record<string, string> }) {
  const wa = (settings.whatsapp ?? "").replace(/\D/g, "");
  return (
    <footer className="border-t border-border bg-[#060606] mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg fire-gradient">
              <Flame className="h-5 w-5 text-white" />
            </span>
            <div className="text-xl font-black">KITCHEN <span className="fire-text">86</span></div>
          </div>
          <div className="text-sm font-bold text-[var(--gold)]">Always Fresh — Taste The Best</div>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">{settings.about_us || settings.tagline}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-[var(--gold)]">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/menu" className="text-muted-foreground hover:text-foreground">Menu</Link></li>
            <li><a href="/#deals" className="text-muted-foreground hover:text-foreground">Deals</a></li>
            <li><Link to="/track" className="text-muted-foreground hover:text-foreground">Track Order</Link></li>
            <li><a href="/#about" className="text-muted-foreground hover:text-foreground">About</a></li>
            <li><a href="/#contact" className="text-muted-foreground hover:text-foreground">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-[var(--gold)]">Connect</h4>
          <div className="flex gap-2 mb-4">
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-[#1877F2] hover:border-transparent transition-all"><Facebook className="h-4 w-4" /></a>}
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-[#E4405F] hover:border-transparent transition-all"><Instagram className="h-4 w-4" /></a>}
            {settings.tiktok && <a href={settings.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-black hover:border-white transition-all font-black text-xs">TT</a>}
          </div>
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">
              <Phone className="h-4 w-4" /> Order via WhatsApp
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground space-y-1">
        <div>© {new Date().getFullYear()} Kitchen 86. All Rights Reserved.</div>
        <div>Developed by <span className="text-[var(--gold)] font-bold">Uzair Ahmad</span></div>
      </div>
    </footer>
  );
}
