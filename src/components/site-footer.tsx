import { Link } from "@tanstack/react-router";
import { Flame, Phone, Instagram, Facebook, MapPin, Clock } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

export function SiteFooter({ settings }: { settings: Record<string, string> }) {
  const wa = (settings.whatsapp ?? "+923064379361").replace(/\D/g, "");
  const phone = settings.phone || settings.whatsapp || "+92 306-4379361";
  const address = settings.address || "Station Road, Larkana, Sindh";
  const hours = settings.hours || "Daily 4:00 PM – 6:00 AM";

  const socialBase =
    "grid h-9 w-9 place-items-center rounded-md bg-[#1A1A1A] border border-[#2A2A2A] text-foreground/80 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors";

  return (
    <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A] mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4 text-center md:text-left">
        {/* Column 1: Brand */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg fire-gradient">
              <Flame className="h-5 w-5 text-white" />
            </span>
            <div className="text-xl font-black text-white">KITCHEN <span className="fire-text">86</span></div>
          </div>
          <div className="text-sm font-bold text-[var(--primary)] mb-2">Always Fresh — Taste The Best</div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Larkana's finest fried chicken, Matka Fries & burgers. Station Road, Larkana.
          </p>
          <div className="mt-4 flex gap-2 justify-center md:justify-start">
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className={socialBase}>
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className={socialBase}>
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {settings.tiktok && (
              <a href={settings.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className={socialBase}>
                <TikTokIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="md:border-l md:border-[#1A1A1A] md:pl-6 border-t border-[#1A1A1A] pt-8 md:border-t-0 md:pt-0">
          <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-4 text-[var(--primary)]">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="text-foreground/90 hover:text-[var(--primary)] transition-colors">Home</Link></li>
            <li><Link to="/menu" className="text-foreground/90 hover:text-[var(--primary)] transition-colors">Menu</Link></li>
            <li><a href="/#deals" className="text-foreground/90 hover:text-[var(--primary)] transition-colors">Deals</a></li>
            <li><Link to="/track" className="text-foreground/90 hover:text-[var(--primary)] transition-colors">Track Order</Link></li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div className="md:border-l md:border-[#1A1A1A] md:pl-6 border-t border-[#1A1A1A] pt-8 md:border-t-0 md:pt-0">
          <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-4 text-[var(--primary)]">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about" className="text-foreground/90 hover:text-[var(--primary)] transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="text-foreground/90 hover:text-[var(--primary)] transition-colors">Contact Us</Link></li>
            <li><Link to="/privacy-policy" className="text-foreground/90 hover:text-[var(--primary)] transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="md:border-l md:border-[#1A1A1A] md:pl-6 border-t border-[#1A1A1A] pt-8 md:border-t-0 md:pt-0">
          <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-4 text-[var(--primary)]">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2 justify-center md:justify-start">
              <MapPin className="h-4 w-4 mt-0.5 text-[var(--primary)] shrink-0" />
              <span className="text-foreground/90">{address}</span>
            </li>
            <li className="flex items-start gap-2 justify-center md:justify-start">
              <Phone className="h-4 w-4 mt-0.5 text-[var(--primary)] shrink-0" />
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-foreground/90 hover:text-[var(--primary)] transition-colors">{phone}</a>
            </li>
            <li className="flex items-start gap-2 justify-center md:justify-start">
              <Clock className="h-4 w-4 mt-0.5 text-[var(--primary)] shrink-0" />
              <span className="text-foreground/90">{hours}</span>
            </li>
          </ul>
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg fire-gradient px-4 py-2.5 text-sm font-black uppercase tracking-wide text-white hover:opacity-90 transition-opacity"
            >
              <Phone className="h-4 w-4" /> Order via WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1A1A1A] bg-[#060606] py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Kitchen 86. All Rights Reserved.</div>
          <div>
            Developed by <span className="text-[var(--primary)] font-bold">Uzair Ahmad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
