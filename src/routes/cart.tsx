import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { pkr } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { fetchSettings } from "@/lib/site-data";

const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Kitchen 86" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(settingsQO); },
  component: CartPage,
});

function CartPage() {
  const { items, update, remove, subtotal } = useCart();
  const { data: settings } = useSuspenseQuery(settingsQO);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full pb-28 lg:pb-10">
        <h1 className="text-3xl sm:text-4xl font-black">Your <span className="fire-text">Cart</span></h1>
        <p className="text-muted-foreground text-sm mt-1">{items.length} items ready to fire 🔥</p>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold">Your cart is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add some heat from the menu.</p>
            <Link to="/menu" className="mt-6 inline-flex items-center gap-1 rounded-lg fire-gradient px-5 py-2.5 text-sm font-bold text-white">
              Browse Menu <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-3 sm:p-4">
                  {it.image && <img src={it.image} alt={it.name} className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base truncate">{it.name}</div>
                    {it.notes && <div className="text-[11px] text-muted-foreground line-clamp-1">{it.notes}</div>}
                    <div className="text-[var(--gold)] font-black mt-0.5 text-sm sm:text-base">{pkr(it.price)}</div>
                    <div className="mt-2 sm:mt-3 flex items-center gap-2">
                      <button onClick={() => update(it.id, it.quantity - 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:fire-gradient hover:border-transparent transition-all"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="min-w-8 text-center font-bold">{it.quantity}</span>
                      <button onClick={() => update(it.id, it.quantity + 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:fire-gradient hover:border-transparent transition-all"><Plus className="h-3.5 w-3.5" /></button>
                      <button onClick={() => remove(it.id)} className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="text-right font-black text-sm sm:text-base">{pkr(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block h-fit rounded-2xl border border-border bg-card p-6 sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>
              <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">{pkr(subtotal)}</span></div>
              <div className="flex justify-between text-sm mb-4"><span className="text-muted-foreground">Delivery</span><span className="text-muted-foreground">Choose at checkout</span></div>
              <div className="border-t border-border pt-4 flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-black text-[var(--gold)]">{pkr(subtotal)}+</span>
              </div>
              <Link to="/checkout" className="mt-6 w-full inline-flex justify-center items-center gap-2 rounded-xl fire-gradient px-6 py-3.5 text-sm font-black uppercase text-white">
                Checkout <ChevronRight className="h-4 w-4" />
              </Link>
              <a href={`https://wa.me/${(settings.whatsapp ?? "").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="mt-2 w-full inline-flex justify-center items-center gap-2 rounded-xl border border-border bg-[var(--secondary-bg)] px-6 py-3 text-sm font-bold">
                Order via WhatsApp
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Mobile sticky checkout bar */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Subtotal</div>
            <div className="text-lg font-black text-[var(--gold)]">{pkr(subtotal)}+</div>
          </div>
          <Link to="/checkout" className="inline-flex items-center gap-2 rounded-xl fire-gradient px-5 py-3 text-sm font-black uppercase text-white">
            Checkout <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <SiteFooter settings={settings} />
    </div>
  );
}
