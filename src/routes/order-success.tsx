import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Phone, Home, Package } from "lucide-react";
import { getLastOrder } from "@/lib/last-order";
import { z } from "zod";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchSettings } from "@/lib/site-data";

const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });

export const Route = createFileRoute("/order-success")({
  validateSearch: (s) => z.object({ o: z.string().optional() }).parse(s),
  head: () => ({ meta: [{ title: "Order Confirmed — Kitchen 86" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(settingsQO); },
  component: Success,
});

function Success() {
  const { o } = Route.useSearch();
  const { data: settings } = useSuspenseQuery(settingsQO);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 grid place-items-center px-4 py-16">
        <div className="max-w-md w-full text-center rounded-3xl border border-border bg-card p-10">
          <div className="mx-auto h-20 w-20 grid place-items-center rounded-full fire-gradient">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-black">Order Confirmed! 🔥</h1>
          <p className="mt-2 text-muted-foreground">Your fresh food is being fired up.</p>
          {o && <div className="mt-5 rounded-xl bg-[var(--secondary-bg)] border border-border p-4">
            <div className="text-xs uppercase text-muted-foreground">Order #</div>
            <div className="text-xl font-black text-[var(--gold)] font-mono">{o}</div>
          </div>}
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
            <a href={`https://wa.me/${(settings.whatsapp ?? "").replace(/\D/g,"")}?text=Hi%2C%20I%20just%20placed%20order%20${o ?? ""}`} target="_blank" rel="noreferrer" className="inline-flex justify-center items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-bold text-white">
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
