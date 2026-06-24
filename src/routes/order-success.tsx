import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Phone, Home, Package, AlertCircle } from "lucide-react";
import { getLastOrder } from "@/lib/last-order";
import { z } from "zod";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchSettings } from "@/lib/site-data";

const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });

export const Route = createFileRoute("/order-success")({
  validateSearch: (s) => z.object({
    o: z.string().optional(),
    m: z.string().optional(),
    s: z.coerce.number().optional(),
  }).parse(s),
  head: () => ({ meta: [{ title: "Order Confirmed — Kitchen 86" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(settingsQO); },
  component: Success,
});

function Success() {
  const { o, m, s } = Route.useSearch();
  const { data: settings } = useSuspenseQuery(settingsQO);
  const wa = (settings.whatsapp ?? "923064379361").replace(/\D/g, "");
  const needsScreenshot = !!m && m !== "cod" && !s;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 grid place-items-center px-4 py-12">
        <div className="max-w-md w-full text-center rounded-3xl border border-border bg-card p-8 sm:p-10">
          <div className="mx-auto h-20 w-20 grid place-items-center rounded-full fire-gradient">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-black">Order Confirmed! 🔥</h1>
          <p className="mt-2 text-muted-foreground">Your fresh food is being fired up.</p>
          {o && <div className="mt-5 rounded-xl bg-[var(--secondary-bg)] border border-border p-4">
            <div className="text-xs uppercase text-muted-foreground">Order #</div>
            <div className="text-xl font-black text-[var(--gold)] font-mono">{o}</div>
          </div>}

          {needsScreenshot && (
            <div className="mt-5 rounded-xl border-2 border-orange-500/60 bg-orange-500/10 p-4 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-black text-orange-400">📱 Payment screenshot bhejein!</div>
                  <div className="text-xs text-foreground mt-1">WhatsApp: <b className="font-mono">{settings.whatsapp || "0306-4379361"}</b></div>
                  <div className="text-xs text-muted-foreground">Order <b className="text-[var(--gold)]">{o}</b> mention karein</div>
                </div>
              </div>
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent(`Order ${o ?? ""} — payment screenshot attached`)}`}
                target="_blank" rel="noreferrer"
                className="mt-3 inline-flex w-full justify-center items-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2.5 text-sm font-black text-white"
              >
                <Phone className="h-4 w-4" /> Send on WhatsApp
              </a>
            </div>
          )}

          <p className="mt-5 text-sm text-muted-foreground">We'll call you on WhatsApp to confirm. Hours: {settings.hours}.</p>
          <div className="mt-6 flex flex-col gap-2">
            {o && (() => {
              const last = typeof window !== "undefined" ? getLastOrder() : null;
              const ph = last && last.order_number === o ? last.phone : "";
              return (
                <Link to="/track" search={{ o, p: ph }} className="inline-flex justify-center items-center gap-2 rounded-xl fire-gradient px-5 py-3 text-sm font-black uppercase text-white">
                  <Package className="h-4 w-4" /> Track Your Order
                </Link>
              );
            })()}
            <a href={`https://wa.me/${wa}?text=Hi%2C%20I%20just%20placed%20order%20${o ?? ""}`} target="_blank" rel="noreferrer" className="inline-flex justify-center items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-bold text-white">
              <Phone className="h-4 w-4" /> Message us on WhatsApp
            </a>
            <Link to="/" className="inline-flex justify-center items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold">
              <Home className="h-4 w-4" /> Back home
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter settings={settings} />
    </div>
  );
}
