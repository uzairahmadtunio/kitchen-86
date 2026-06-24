import { MapPin, Clock, Phone, MessageCircle, Navigation } from "lucide-react";

export function ContactSection({ settings }: { settings: Record<string, string> }) {
  const address = settings.address || "Station Road, Larkana, Sindh";
  const wa = (settings.whatsapp ?? "").replace(/\D/g, "");
  const directionsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-6 sm:mb-8 text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Visit Us</div>
        <h2 className="mt-2 text-3xl sm:text-5xl font-black">Get In <span className="fire-text">Touch</span></h2>
      </div>
      <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
        {/* Map placeholder */}
        <div className="relative aspect-[4/3] rounded-3xl border border-border bg-[var(--secondary-bg)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,69,0,0.18),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(255,165,0,0.12),transparent_60%)]" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center px-6">
              <div className="mx-auto h-16 w-16 grid place-items-center rounded-full fire-gradient shadow-2xl glow-orange mb-4">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Find Us At</div>
              <div className="mt-1 text-lg sm:text-xl font-black">{address}</div>
              <a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl fire-gradient px-5 py-3 text-sm font-black uppercase text-white">
                <Navigation className="h-4 w-4" /> Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5">
          <Info icon={<MapPin className="h-5 w-5 text-primary" />} label="Address" value={address} />
          <Info icon={<Clock className="h-5 w-5 text-primary" />} label="Hours" value={settings.hours || "4PM – 6AM Daily"} />
          <Info icon={<Phone className="h-5 w-5 text-primary" />} label="Phone" value={settings.phone || "0306-4379361"} />
          <Info icon={<MessageCircle className="h-5 w-5 text-primary" />} label="WhatsApp" value={settings.whatsapp || "0306-4379361"} />
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="block w-full text-center rounded-xl fire-gradient px-5 py-3.5 text-sm font-black uppercase text-white">
              Order via WhatsApp 🍔
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 grid h-10 w-10 place-items-center rounded-lg border border-border bg-[var(--secondary-bg)]">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
        <div className="text-sm font-bold truncate">{value}</div>
      </div>
    </div>
  );
}
