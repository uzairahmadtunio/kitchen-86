import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart-context";
import { pkr } from "@/lib/format";
import { fetchSettings, fetchAreas, fetchPaymentMethods } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";
import { saveLastOrder } from "@/lib/last-order";

const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });
const areasQO = queryOptions({ queryKey: ["areas"], queryFn: fetchAreas });
const paymentsQO = queryOptions({ queryKey: ["payment-methods"], queryFn: fetchPaymentMethods });

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Kitchen 86" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(settingsQO);
    context.queryClient.ensureQueryData(areasQO);
  },
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  phone: z.string().trim().min(10, "Enter a valid phone").max(20),
  address: z.string().trim().min(8, "Enter delivery address").max(500),
  area: z.string().min(1, "Select delivery area"),
  notes: z.string().max(500).optional(),
  payment: z.enum(["cod", "online"]),
});

function Checkout() {
  const { data: settings } = useSuspenseQuery(settingsQO);
  const { data: areas } = useSuspenseQuery(areasQO);
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", address: "", area: "", customArea: "", notes: "", payment: "cod" as "cod" | "online" });
  const [submitting, setSubmitting] = useState(false);

  const selectedArea = areas.find((a) => a.id === form.area);
  const isCustom = (selectedArea?.zone ?? "").toLowerCase() === "custom";
  const deliveryCharge = Number(selectedArea?.charge ?? 0);
  const total = subtotal + deliveryCharge;

  const grouped = areas.reduce<Record<string, typeof areas>>((acc, a) => {
    const z = (a.zone ?? "Other").toUpperCase();
    (acc[z] = acc[z] ?? []).push(a);
    return acc;
  }, {});
  const zoneOrder = ["A", "B", "C", "D", "CUSTOM", "OTHER"];
  const zoneKeys = Object.keys(grouped).sort((a, b) => {
    const ai = zoneOrder.indexOf(a); const bi = zoneOrder.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  const zoneLabel = (z: string) =>
    z === "CUSTOM" ? "Other / Custom" : z === "OTHER" ? "Other" : `Zone ${z}`;

  async function placeOrder() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!items.length) { toast.error("Your cart is empty"); return; }

    if (isCustom && form.customArea.trim().length < 3) {
      toast.error("Please describe your area"); return;
    }

    setSubmitting(true);
    try {
      const areaName = isCustom
        ? `Other / Custom — ${form.customArea.trim()}`
        : (selectedArea?.name ?? null);
      const composedNotes = isCustom
        ? `[Custom area — charge to be confirmed on WhatsApp]\n${form.notes || ""}`.trim()
        : (form.notes || null);

      const { data: order, error } = await (supabase as any).from("orders").insert({
        customer_name: form.name,
        customer_phone: form.phone,
        delivery_area: areaName,
        delivery_charge: deliveryCharge,
        address: form.address,
        notes: composedNotes,
        payment_method: form.payment,
        subtotal,
        total,
      }).select().single();
      if (error) throw error;

      const orderItems = items.map((i) => ({
        order_id: order.id,
        item_name: i.name,
        item_price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
        customizations: i.notes ? { notes: i.notes } : null,
      }));
      const { error: e2 } = await (supabase as any).from("order_items").insert(orderItems);
      if (e2) throw e2;

      clear();
      saveLastOrder({ order_number: order.order_number, phone: form.phone, placed_at: Date.now() });

      // Auto-open WhatsApp with formatted order message
      try {
        const waNumber = (settings.whatsapp || "+923064379361").replace(/\D/g, "");
        const time = new Date().toLocaleString("en-PK", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
        const lines = [
          `🔥 NEW ORDER ${order.order_number}`,
          `━━━━━━━━━━━━━━━`,
          `👤 Name: ${form.name}`,
          `📱 Phone: ${form.phone}`,
          `📍 Area: ${areaName}`,
          `🏠 Address: ${form.address}`,
          `━━━━━━━━━━━━━━━`,
          `🛒 ORDER ITEMS:`,
          ...items.map((i) => `• ${i.name} x${i.quantity} — PKR ${i.price * i.quantity}`),
          `━━━━━━━━━━━━━━━`,
          `💰 Subtotal: PKR ${subtotal}`,
          `🚚 Delivery: PKR ${deliveryCharge}`,
          `💵 TOTAL: PKR ${total}`,
          `💳 Payment: ${form.payment.toUpperCase()}`,
          `━━━━━━━━━━━━━━━`,
          `⏰ Time: ${time}`,
          `Kitchen 86 — Station Road Larkana`,
        ];
        const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
        window.open(url, "_blank");
      } catch {}

      toast.success("Order placed! 🔥");
      navigate({ to: "/order-success", search: { o: order.order_number } });
    } catch (e: any) {
      toast.error(e.message ?? "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <div className="flex-1 mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-3xl font-black">Cart is empty</h1>
          <Link to="/menu" className="mt-6 inline-flex rounded-lg fire-gradient px-5 py-2.5 text-sm font-bold text-white">Browse Menu</Link>
        </div>
        <SiteFooter settings={settings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-10 flex-1">
        <h1 className="text-4xl font-black"><span className="fire-text">Checkout</span></h1>

        <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <Card title="Contact">
              <Field label="Full name"><input className={inputCls} value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Your name" /></Field>
              <Field label="Phone (WhatsApp)"><input className={inputCls} value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} placeholder="03XX-XXXXXXX" /></Field>
            </Card>

            <Card title="Delivery">
              <Field label="Area">
                <select className={inputCls} value={form.area} onChange={(e)=>setForm({...form,area:e.target.value, customArea: ""})}>
                  <option value="">Select area in Larkana</option>
                  {zoneKeys.map((z) => (
                    <optgroup key={z} label={`${zoneLabel(z)} — ${z === "CUSTOM" ? "Custom charge" : `PKR ${grouped[z][0].charge}`}`}>
                      {grouped[z].map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} {z !== "CUSTOM" ? `— ${pkr(a.charge)} · ${a.est_time}` : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              {selectedArea && !isCustom && (
                <div className="rounded-lg border border-border bg-[var(--secondary-bg)] px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Delivery charge:</span> <b className="text-[var(--gold)]">{pkr(deliveryCharge)}</b>
                  <span className="text-muted-foreground"> · ETA:</span> <b>{selectedArea.est_time}</b>
                </div>
              )}
              {isCustom && (
                <>
                  <Field label="Please describe your area">
                    <input className={inputCls} value={form.customArea} onChange={(e)=>setForm({...form,customArea:e.target.value})} placeholder="e.g. Near XYZ school, behind ABC market" />
                  </Field>
                  <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-2 text-xs text-[var(--gold)]">
                    🟡 Delivery charge PKR 100 — Admin will confirm exact charge on WhatsApp
                  </div>
                </>
              )}
              <Field label="Address"><textarea className={inputCls} rows={3} value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} placeholder="House #, Street, Landmark" /></Field>
              <Field label="Notes (optional)"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Extra sauce, no onions, etc." /></Field>
            </Card>

            <Card title="Payment">
              <div className="grid grid-cols-2 gap-3">
                {([["cod","Cash on Delivery"],["online","Online (Soon)"]] as const).map(([v,l]) => (
                  <button key={v} type="button" onClick={()=>v==="cod"&&setForm({...form,payment:v})} disabled={v==="online"} className={`rounded-xl border-2 p-4 text-left ${form.payment===v?"border-primary bg-[var(--secondary-bg)]":"border-border"} disabled:opacity-40`}>
                    <div className="font-bold text-sm">{l}</div>
                    <div className="text-xs text-muted-foreground mt-1">{v==="cod"?"Pay when it arrives 🔥":"Coming soon"}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="h-fit rounded-2xl border border-border bg-card p-6 sticky top-24 space-y-3">
            <h3 className="font-bold">Order Summary</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i.quantity}× {i.name}</span>
                  <span className="font-bold">{pkr(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5 text-sm">
              <Row label="Subtotal" value={pkr(subtotal)} />
              <Row label="Delivery" value={selectedArea ? pkr(deliveryCharge) : "—"} />
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-black text-[var(--gold)]">{pkr(total)}</span>
            </div>
            <button onClick={placeOrder} disabled={submitting} className="w-full inline-flex justify-center items-center gap-2 rounded-xl fire-gradient px-6 py-3.5 text-sm font-black uppercase text-white disabled:opacity-50">
              {submitting ? "Placing..." : "Place Order"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      <SiteFooter settings={settings} />
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-[var(--secondary-bg)] px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]";
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-6"><h3 className="font-bold mb-4">{title}</h3><div className="space-y-3">{children}</div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>{children}</label>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-bold">{value}</span></div>;
}
