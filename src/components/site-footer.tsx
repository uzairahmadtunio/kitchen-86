import { Flame, Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";

export function SiteFooter({ settings }: { settings: Record<string, string> }) {
  return (
    <footer id="contact" className="border-t border-border bg-[var(--secondary-bg)] mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg fire-gradient">
              <Flame className="h-5 w-5 text-white" />
            </span>
            <div className="text-xl font-black">KITCHEN <span className="fire-text">86</span></div>
          </div>
          <p className="text-sm text-muted-foreground">{settings.tagline}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-[var(--gold)]">Visit Us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary" />{settings.address}</li>
            <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 text-primary" />{settings.hours}</li>
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-primary" />{settings.phone}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-[var(--gold)]">Follow Us</h4>
          <div className="flex gap-2">
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:fire-gradient hover:border-transparent transition-all"><Facebook className="h-4 w-4" /></a>}
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:fire-gradient hover:border-transparent transition-all"><Instagram className="h-4 w-4" /></a>}
            {settings.tiktok && <a href={settings.tiktok} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:fire-gradient hover:border-transparent transition-all font-black text-xs">TT</a>}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-[var(--gold)]">Order Now</h4>
          <a href={`https://wa.me/${(settings.whatsapp ?? "").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">
            <Phone className="h-4 w-4" /> WhatsApp
          </a>
          <p className="text-xs text-muted-foreground mt-3">Delivery available in Larkana city only.</p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kitchen 86. Always Fresh · Always Fire 🔥
      </div>
    </footer>
  );
}
