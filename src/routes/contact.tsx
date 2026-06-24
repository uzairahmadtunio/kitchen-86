import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Clock, MessageCircle, Send, Facebook, Instagram } from "lucide-react";
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
    { property: "og:description", content: "Station Road, Larkana. Open daily 4PM – 6AM." },
  ] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(pageQO);
    context.queryClient.ensureQueryData(settingsQO);
  },
  errorComponent: ({ error }) => <div className="p-10 text-center">{(error as any)?.message ?? "Error"}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Page not found</div>,
  component: ContactPage,
});

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

const SUBJECTS = ["Order Inquiry", "Complaint", "Feedback", "General Question"];

function ContactPage() {
  const { data: settings } = useSuspenseQuery(settingsQO);
  const [form, setForm] = useState({ name: "", phone: "", subject: SUBJECTS[0], message: "" });

  const wa = (settings.whatsapp || "+923064379361").replace(/\D/g, "");
  const address = settings.address || "Station Road, Larkana";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const openNow = useMemo(() => {
    const h = new Date().getHours();
    return h >= 16 || h < 6; // 4 PM – 6 AM
  }, []);

  function sendWhatsApp() {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Please enter your name and a message");
      return;
    }
    const text = `Name: ${form.name}\nPhone: ${form.phone}\nSubject: ${form.subject}\nMessage: ${form.message}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-[var(--primary)] mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        {/* HERO */}
        <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] border-l-4 border-l-[#FF4500] p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white">Contact Us</h1>
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">We're here to help — reach out anytime</p>
          <span className="mt-3 inline-flex items-center rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#22C55E]">
            Usually replies in 5 mins ⚡
          </span>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-5">
          {/* LEFT — cards */}
          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] border-l-[3px] border-l-[#22C55E] p-5">
              <MessageCircle className="h-8 w-8 text-[#22C55E]" />
              <div className="mt-2 text-base font-bold text-white">WhatsApp</div>
              <div className="text-xl font-black text-[#FF4500]">+92 306-4379361</div>
              <div className="text-xs text-muted-foreground">Tap to chat</div>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2.5 text-xs font-black uppercase text-white hover:opacity-90">
                Open WhatsApp
              </a>
            </div>

            {/* Location */}
            <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] border-l-[3px] border-l-[#FF4500] p-5">
              <MapPin className="h-8 w-8 text-[#FF4500]" />
              <div className="mt-2 text-base font-bold text-white">Visit Us</div>
              <div className="text-sm text-white">Station Road, Larkana</div>
              <div className="text-xs text-muted-foreground">Sindh, Pakistan</div>
              <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#FF4500]/50 text-[#FF4500] px-4 py-2.5 text-xs font-black uppercase hover:bg-[#FF4500] hover:text-white transition-colors">
                Get Directions
              </a>
            </div>

            {/* Hours */}
            <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] border-l-[3px] border-l-[#3B82F6] p-5">
              <Clock className="h-8 w-8 text-[#3B82F6]" />
              <div className="mt-2 text-base font-bold text-white">Opening Hours</div>
              <div className="text-xs text-muted-foreground">Daily</div>
              <div className="text-lg font-black text-white">4:00 PM – 6:00 AM</div>
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider border ${openNow ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30" : "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-[#22C55E]" : "bg-[#EF4444]"} ${openNow ? "animate-pulse" : ""}`} />
                {openNow ? "Open Now" : "Closed Now"}
              </span>
            </div>

            {/* Social */}
            <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] border-l-[3px] border-l-[#A855F7] p-5">
              <div className="text-base font-bold text-white">Follow Us</div>
              <div className="mt-3 flex gap-2">
                {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#1877F2] hover:border-transparent transition-colors"><Facebook className="h-4 w-4" /></a>}
                {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#E4405F] hover:border-transparent transition-colors"><Instagram className="h-4 w-4" /></a>}
                {settings.tiktok && <a href={settings.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="grid h-10 w-10 place-items-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-black hover:border-white transition-colors"><TikTokIcon className="h-4 w-4" /></a>}
              </div>
            </div>
          </div>

          {/* RIGHT — message form */}
          <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-white">Send us a Message 💬</h2>
            <p className="mt-1 text-xs text-muted-foreground">Opens in WhatsApp — we reply within minutes ⚡</p>
            <div className="mt-5 space-y-3">
              <Field label="Your name"><input className={ic} value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Full name" /></Field>
              <Field label="Phone"><input className={ic} value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} placeholder="03XX-XXXXXXX" /></Field>
              <Field label="Subject">
                <select className={ic} value={form.subject} onChange={(e)=>setForm({...form, subject: e.target.value})}>
                  {SUBJECTS.map((s) => <option key={s} value={s} className="bg-[#141414]">{s}</option>)}
                </select>
              </Field>
              <Field label="Message"><textarea className={ic} rows={4} value={form.message} onChange={(e)=>setForm({...form, message: e.target.value})} placeholder="Type your message…" /></Field>
              <button onClick={sendWhatsApp} className="w-full inline-flex items-center justify-center gap-2 rounded-lg fire-gradient px-5 py-3 text-sm font-black uppercase tracking-wide text-white hover:opacity-90 transition-opacity">
                <Send className="h-4 w-4" /> Send via WhatsApp 📱
              </button>
              <p className="text-xs italic text-muted-foreground text-center">Your message will open in WhatsApp. We reply within minutes! ⚡</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>{children}</label>;
}
const ic = "w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3.5 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors";
