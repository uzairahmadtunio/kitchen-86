import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, MapPin, Phone, MessageCircle, Clock, Facebook, Instagram, Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchPage, fetchSettings } from "@/lib/site-data";
import { toast } from "sonner";

const pageQO = queryOptions({ queryKey: ["page", "contact-us"], queryFn: () => fetchPage("contact-us") });
const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact Us — Kitchen 86" },
    { name: "description", content: "Get in touch with Kitchen 86 — WhatsApp, phone, and address in Larkana." },
    { property: "og:title", content: "Contact Kitchen 86" },
    { property: "og:description", content: "Station Road, Larkana. Open daily 4PM – 6AM. WhatsApp +92 306 4379361." },
  ] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(pageQO);
    context.queryClient.ensureQueryData(settingsQO);
  },
  errorComponent: ({ error }) => <div className="p-10 text-center">{(error as any)?.message ?? "Error"}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Page not found</div>,
  component: ContactPage,
});

function ContactPage() {
  const { data: page } = useSuspenseQuery(pageQO);
  const { data: settings } = useSuspenseQuery(settingsQO);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const wa = (settings.whatsapp || "+923064379361").replace(/\D/g, "");
  const phoneNum = settings.phone || settings.whatsapp || "+923064379361";
  const address = settings.address || "Station Road, Larkana, Sindh, Pakistan";
  const hours = settings.hours || "Daily 4:00 PM to 6:00 AM";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  function sendWhatsApp() {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Please enter your name and a message");
      return;
    }
    const text = `Name: ${form.name}\nPhone: ${form.phone}\nMessage: ${form.message}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
        <h1 className="text-4xl sm:text-5xl font-black"><span className="fire-text">{page?.title ?? "Contact Us"}</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">WhatsApp karo hamen — we reply fast 🔥</p>

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          {/* LEFT: Contact info */}
          <div className="rounded-2xl border border-border bg-[#141414] p-6 space-y-5">
            <InfoRow icon={<MapPin className="h-5 w-5" />} title="Address">
              <a href={mapUrl} target="_blank" rel="noreferrer" className="text-sm text-foreground/90 hover:text-[var(--gold)]">{address}</a>
            </InfoRow>
            <InfoRow icon={<MessageCircle className="h-5 w-5 text-[#22C55E]" />} title="WhatsApp">
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#22C55E] hover:underline">{settings.whatsapp || "+92 306 4379361"}</a>
            </InfoRow>
            <InfoRow icon={<Phone className="h-5 w-5" />} title="Phone">
              <a href={`tel:${phoneNum.replace(/\s/g, "")}`} className="text-sm font-bold hover:text-[var(--gold)]">{phoneNum}</a>
            </InfoRow>
            <InfoRow icon={<Clock className="h-5 w-5 text-[var(--gold)]" />} title="Opening Hours">
              <div className="text-sm text-foreground/90">{hours}</div>
            </InfoRow>

            <div className="pt-3 border-t border-border">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Follow us</div>
              <div className="flex gap-2">
                {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-[#1877F2] hover:border-transparent transition"><Facebook className="h-4 w-4" /></a>}
                {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-[#E4405F] hover:border-transparent transition"><Instagram className="h-4 w-4" /></a>}
                {settings.tiktok && <a href={settings.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-black hover:border-white transition font-black text-xs">TT</a>}
              </div>
            </div>

            {page?.content && (
              <div className="pt-3 border-t border-border text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                {page.content}
              </div>
            )}
          </div>

          {/* RIGHT: Quick message form */}
          <div className="rounded-2xl border border-border bg-[#141414] p-6">
            <h2 className="text-xl font-black">Quick Message</h2>
            <p className="mt-1 text-xs text-muted-foreground">Send us a message — opens in WhatsApp instantly.</p>
            <div className="mt-5 space-y-3">
              <Field label="Your name"><input className={ic} value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Full name" /></Field>
              <Field label="Phone"><input className={ic} value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} placeholder="03XX-XXXXXXX" /></Field>
              <Field label="Message"><textarea className={ic} rows={5} value={form.message} onChange={(e)=>setForm({...form, message: e.target.value})} placeholder="Type your message…" /></Field>
              <button onClick={sendWhatsApp} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-black uppercase text-white hover:opacity-90">
                <Send className="h-4 w-4" /> Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}

function InfoRow({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--secondary-bg)] border border-border shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>{children}</label>;
}
const ic = "w-full rounded-lg border border-border bg-[var(--secondary-bg)] px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]";
