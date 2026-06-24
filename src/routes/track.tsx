import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Package, CheckCircle2, ChefHat, Bike, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { fetchSettings } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";
import { pkr } from "@/lib/format";
import { z } from "zod";

const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });

export const Route = createFileRoute("/track")({
  validateSearch: (s) => z.object({ o: z.string().optional(), p: z.string().optional() }).parse(s),
  head: () => ({ meta: [{ title: "Track Your Order — Kitchen 86" }, { name: "description", content: "Track your Kitchen 86 order status in real time. No login required — just enter your order number and phone." }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(settingsQO); },
  component: Track,
});

const STEPS = [
  { key: "new", label: "Order Received", icon: Package },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function Track() {
  const { data: settings } = useSuspenseQuery(settingsQO);
  const { o, p } = Route.useSearch();
  const [orderNo, setOrderNo] = useState(o ?? "");
  const [phone, setPhone] = useState(p ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  async function lookup(no = orderNo, ph = phone) {
    if (!no.trim() || !ph.trim()) { toast.error("Enter order # and phone"); return; }
    setLoading(true); setNotFound(false); setResult(null);
    try {
      const { data, error } = await (supabase as any).rpc("track_order", { p_order_number: no, p_phone: ph });
      if (error) throw error;
      if (!data) { setNotFound(true); } else { setResult(data); }
    } catch (e: any) {
      toast.error(e.message ?? "Could not look up order");
    } finally { setLoading(false); }
  }

  // Auto-lookup if URL has both params
  useEffect(() => {
    if (o && p && !result) lookup(o, p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh every 30s when we have a result and not finished
  useEffect(() => {
    if (!result || result.status === "delivered" || result.status === "cancelled") return;
    const t = setInterval(() => lookup(result.order_number, phone), 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.status]);

  const statusIdx = result ? STEPS.findIndex(s => s.key === result.status) : -1;
  const cancelled = result?.status === "cancelled";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-12 flex-1">
        <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Order Tracking</div>
        <h1 className="mt-2 text-4xl sm:text-5xl font-black">Track Your <span className="fire-text">Order</span></h1>
        <p className="mt-2 text-muted-foreground">Enter your order number and phone number — no login needed.</p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
            <input className="rounded-lg border border-border bg-[var(--secondary-bg)] px-3.5 py-2.5 text-sm font-mono uppercase placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" placeholder="ORDER #" value={orderNo} onChange={(e)=>setOrderNo(e.target.value)} />
            <input className="rounded-lg border border-border bg-[var(--secondary-bg)] px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" placeholder="Phone (03XX-XXXXXXX)" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            <button onClick={()=>lookup()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg fire-gradient px-5 py-2.5 text-sm font-black uppercase text-white disabled:opacity-50">
              <Search className="h-4 w-4" /> {loading ? "..." : "Track"}
            </button>
          </div>
        </div>

        {notFound && (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <div className="mt-2 font-bold">Order not found</div>
            <div className="text-sm text-muted-foreground">Check your order number and phone number, or contact us on WhatsApp.</div>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Order</div>
                  <div className="font-mono text-2xl font-black text-[var(--gold)]">{result.order_number}</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Placed {new Date(result.created_at).toLocaleString()}
                </div>
              </div>

              {cancelled ? (
                <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-destructive" />
                  <div>
                    <div className="font-bold">Order Cancelled</div>
                    <div className="text-sm text-muted-foreground">Contact us on WhatsApp for help.</div>
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  <div className="relative grid grid-cols-4 gap-2">
                    {STEPS.map((s, i) => {
                      const active = i <= statusIdx;
                      const current = i === statusIdx;
                      const Icon = s.icon;
                      return (
                        <div key={s.key} className="flex flex-col items-center text-center relative">
                          <div className={`relative z-10 grid h-12 w-12 place-items-center rounded-full border-2 ${active ? "fire-gradient border-transparent text-white" : "border-border bg-card text-muted-foreground"} ${current ? "animate-pulse glow-orange" : ""}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className={`mt-2 text-[11px] font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                          {i < STEPS.length - 1 && (
                            <div className={`absolute top-6 left-1/2 h-0.5 w-full ${i < statusIdx ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    {result.status === "new" && "Hum aapka order receive kar liya hai — chef ko bata diya 🔥"}
                    {result.status === "preparing" && "Chef is cooking your order right now 👨‍🍳"}
                    {result.status === "out_for_delivery" && "Rider niklay hain — fresh & hot pohanch rahay hain 🏍️"}
                    {result.status === "delivered" && "Delivered! Enjoy your meal 🎉"}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold mb-3">Order Details</h3>
              <div className="text-sm text-muted-foreground mb-3"><b className="text-foreground">{result.customer_name}</b> · {result.delivery_area}</div>
              <div className="text-sm text-muted-foreground mb-4">{result.address}</div>
              <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                {(result.items ?? []).map((it: any, i: number) => (
                  <div key={i} className="flex justify-between"><span>{it.quantity}× {it.item_name}</span><span className="font-bold">{pkr(Number(it.subtotal))}</span></div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between text-sm text-muted-foreground"><span>Delivery</span><span>{pkr(Number(result.delivery_charge ?? 0))}</span></div>
              <div className="flex justify-between mt-1 font-black text-[var(--gold)]"><span>Total</span><span>{pkr(Number(result.total))}</span></div>
            </div>

            <div className="text-center">
              <a href={`https://wa.me/${(settings.whatsapp ?? "").replace(/\D/g,"")}?text=Hi%2C%20I%20need%20help%20with%20order%20${result.order_number}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-bold text-white">
                Chat on WhatsApp about this order
              </a>
            </div>
          </div>
        )}

        {!result && !notFound && (
          <div className="mt-6 text-center">
            <Link to="/menu" className="text-sm text-muted-foreground hover:text-foreground">← Back to menu</Link>
          </div>
        )}
      </section>
      <SiteFooter settings={settings} />
    </div>
  );
}
