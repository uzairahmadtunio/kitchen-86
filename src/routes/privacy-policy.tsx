import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft, Flame, MapPin, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchPage, fetchSettings } from "@/lib/site-data";

const pageQO = queryOptions({ queryKey: ["page", "privacy-policy"], queryFn: () => fetchPage("privacy-policy") });
const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — Kitchen 86" },
    { name: "description", content: "How Kitchen 86 collects, uses, and protects your personal information." },
    { property: "og:title", content: "Privacy Policy — Kitchen 86" },
    { property: "og:description", content: "How Kitchen 86 collects, uses, and protects your personal information." },
  ] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(pageQO);
    context.queryClient.ensureQueryData(settingsQO);
  },
  errorComponent: ({ error }) => <div className="p-10 text-center">{(error as any)?.message ?? "Error"}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Page not found</div>,
  component: PrivacyPage,
});

type Section = { n: number; icon: string; title: string; intro?: string; bullets?: string[]; outro?: string; badge?: { text: string; color: string } };

const SECTIONS: Section[] = [
  {
    n: 1, icon: "📋", title: "Information We Collect",
    intro: "We collect only the minimum information needed to deliver your order:",
    bullets: ["Your full name", "WhatsApp / phone number", "Delivery address", "Order details and preferences"],
    outro: "We do NOT store any payment card or bank account details.",
  },
  {
    n: 2, icon: "🎯", title: "How We Use Your Info",
    intro: "Your information is used exclusively to:",
    bullets: ["Process and prepare your food order", "Coordinate delivery to your address", "Send order confirmation via WhatsApp", "Improve our service quality"],
    outro: "We never use your data for marketing without your permission.",
  },
  {
    n: 3, icon: "🔒", title: "Data Sharing",
    badge: { text: "YOUR DATA IS SAFE", color: "#22C55E" },
    outro: "Kitchen 86 does NOT sell, trade, or share your personal information with any third parties under any circumstances. Your data stays strictly within Kitchen 86.",
  },
  {
    n: 4, icon: "💬", title: "WhatsApp Communication",
    intro: "By placing an order with Kitchen 86, you agree to receive:",
    bullets: ["Order confirmation messages", "Delivery status updates", "Important order-related notifications"],
    outro: "All messages come from: +92 306-4379361. You can opt out anytime by messaging STOP.",
  },
  {
    n: 5, icon: "🛡️", title: "Data Security",
    intro: "We take reasonable measures to protect your personal information:",
    bullets: ["Secure encrypted database storage", "No payment data stored on our servers", "Access limited to Kitchen 86 staff only", "Data used only for order fulfillment"],
  },
];

function PrivacyPage() {
  const { data: page } = useSuspenseQuery(pageQO);
  const { data: settings } = useSuspenseQuery(settingsQO);
  const wa = (settings.whatsapp || "+923064379361").replace(/\D/g, "");
  const updated = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : "January 2025";

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-[800px] px-6 py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-[var(--primary)] mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        {/* HERO */}
        <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] border-l-4 border-l-[#FF4500] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl fire-gradient">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white">{page?.title || "Privacy Policy"}</h1>
              <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">Your privacy is important to us</p>
              <span className="mt-3 inline-flex items-center rounded-full bg-[#FF4500]/15 border border-[#FF4500]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF4500]">
                Last Updated: {updated}
              </span>
            </div>
          </div>
        </div>

        {/* SECTIONS */}
        <div className="mt-6 space-y-4">
          {SECTIONS.map((s) => (
            <section key={s.n} className="rounded-xl bg-[#141414] border border-[#2A2A2A] border-l-[3px] border-l-[#FF4500] p-6">
              <header className="flex items-center gap-3 mb-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FF4500] text-white text-sm font-black">{s.n}</span>
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><span className="text-xl" aria-hidden="true">{s.icon}</span>{s.title}</h2>
              </header>
              {s.badge && (
                <div className="mb-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider" style={{ background: `${s.badge.color}22`, color: s.badge.color, border: `1px solid ${s.badge.color}55` }}>
                  ✓ {s.badge.text}
                </div>
              )}
              {s.intro && <p className="text-[15px] leading-[1.8] text-[#AAAAAA]">{s.intro}</p>}
              {s.bullets && (
                <ul className="mt-2 space-y-1.5">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[15px] leading-[1.8] text-[#AAAAAA]">
                      <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-[#FF4500] shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.outro && <p className="mt-3 text-[15px] leading-[1.8] text-[#AAAAAA]">{s.outro}</p>}
            </section>
          ))}

          {/* Section 6 — Contact */}
          <section className="rounded-xl bg-[#141414] border border-[#2A2A2A] border-l-[3px] border-l-[#FF4500] p-6">
            <header className="flex items-center gap-3 mb-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FF4500] text-white text-sm font-black">6</span>
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><span className="text-xl">📞</span>Contact Us</h2>
            </header>
            <p className="text-[15px] leading-[1.8] text-[#AAAAAA]">For any privacy concerns or questions:</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] p-4">
                <MessageCircle className="h-7 w-7 text-[#22C55E]" />
                <div className="mt-2 text-base font-bold text-white">+92 306-4379361</div>
                <div className="text-xs text-muted-foreground">Message us anytime</div>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#22C55E] px-3 py-2 text-xs font-black uppercase text-white hover:opacity-90">
                  WhatsApp Us
                </a>
              </div>
              <div className="rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] p-4">
                <MapPin className="h-7 w-7 text-[#FF4500]" />
                <div className="mt-2 text-base font-bold text-white">Station Road</div>
                <div className="text-xs text-muted-foreground">Larkana, Sindh, Pakistan</div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer card */}
        <div className="mt-8 rounded-xl bg-[#141414] border border-[#2A2A2A] p-6 text-center">
          <p className="italic text-[#FF4500] font-semibold">Kitchen 86 is committed to protecting your privacy and your trust. 🔥</p>
        </div>

        <div className="mt-6">
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF4500]/50 text-[#FF4500] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FF4500] hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
