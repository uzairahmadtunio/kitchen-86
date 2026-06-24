import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Flame, LogOut, ShoppingBag, UtensilsCrossed, Tag, MessageSquare, Settings as SettingsIcon, Star, Trash2, Pencil, Plus, Check, X, Truck, CreditCard, LayoutDashboard, Sparkles, ShieldCheck, FileText, Users, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { pkr } from "@/lib/format";
import { MediaUpload } from "@/components/media-upload";
import { playDing, flashTitle, unlockAlertSound } from "@/lib/new-order-alerts";

const sb = supabase as any;

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Kitchen 86" }] }),
  component: AdminPage,
});

type Tab = "dashboard" | "orders" | "menu" | "deals" | "areas" | "payments" | "suggestions" | "reviews" | "settings";

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [email, setEmail] = useState<string>("");
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  // Fetch WhatsApp number once for auto-notify
  const { data: waNumber } = useQuery({
    queryKey: ["admin", "wa-number"],
    queryFn: async () => {
      const { data } = await sb.from("site_settings").select("value").eq("key", "whatsapp_number").maybeSingle();
      return (data?.value ?? "").replace(/\D/g, "");
    },
  });

  // Realtime: listen for new orders site-wide while admin is open
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload: any) => {
        const o = payload.new ?? {};
        playDing();
        flashTitle("🔔 NEW ORDER!");
        setNewCount((c) => c + 1);
        const msg = `🔥 New Order! ${o.order_number ?? ""} — ${o.customer_name ?? ""} — PKR ${o.total ?? ""}`;
        const waText = encodeURIComponent(
          `🔥 NEW ORDER ${o.order_number ?? ""}\nName: ${o.customer_name ?? ""}\nPhone: ${o.customer_phone ?? ""}\nArea: ${o.delivery_area ?? ""}\nAddress: ${o.address ?? ""}\nPayment: ${o.payment_method ?? ""}\nTotal: PKR ${o.total ?? ""}`
        );
        toast.success(msg, {
          duration: 12000,
          action: waNumber ? {
            label: "Open WhatsApp",
            onClick: () => window.open(`https://wa.me/${waNumber}?text=${waText}`, "_blank"),
          } : undefined,
        });
        qc.invalidateQueries({ queryKey: ["admin", "orders"] });
        qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      })
      .subscribe();

    const poll = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    }, 20_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [qc, waNumber]);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const tabs: { key: Tab; label: string; icon: any; emoji: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, emoji: "📊" },
    { key: "orders", label: "Orders", icon: ShoppingBag, emoji: "📦" },
    { key: "menu", label: "Menu", icon: UtensilsCrossed, emoji: "🍔" },
    { key: "deals", label: "Deals", icon: Tag, emoji: "🎯" },
    { key: "areas", label: "Areas", icon: Truck, emoji: "🚚" },
    { key: "payments", label: "Payments", icon: CreditCard, emoji: "💳" },
    { key: "suggestions", label: "Suggestions", icon: Sparkles, emoji: "✨" },
    { key: "reviews", label: "Reviews", icon: MessageSquare, emoji: "⭐" },
    { key: "settings", label: "Settings", icon: SettingsIcon, emoji: "⚙️" },
  ];

  function selectTab(k: Tab) {
    unlockAlertSound();
    setTab(k);
    if (k === "orders") setNewCount(0);
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-[var(--secondary-bg)] sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg fire-gradient"><Flame className="h-4 w-4 text-white" /></span>
            <div>
              <div className="text-sm font-black">KITCHEN <span className="fire-text">86</span> Admin</div>
              <div className="text-[10px] text-muted-foreground">{email}</div>
            </div>
          </Link>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 hidden md:flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={()=>selectTab(t.key)} className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px whitespace-nowrap ${tab===t.key?"border-primary text-foreground":"border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
              {t.key === "orders" && newCount > 0 && (
                <span className="ml-1 grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">{newCount}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "menu" && <MenuTab />}
        {tab === "deals" && <DealsTab />}
        {tab === "areas" && <AreasTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "suggestions" && <SuggestionsTab />}
        {tab === "reviews" && <ReviewsTab />}
        {tab === "settings" && <SettingsTab />}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-[var(--secondary-bg)] backdrop-blur">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t.key} onClick={()=>selectTab(t.key)} className={`relative flex-1 min-w-[68px] min-h-[56px] flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-bold ${tab===t.key?"text-primary":"text-muted-foreground"}`}>
              <span className="text-lg leading-none">{t.emoji}</span>
              <span className="leading-none">{t.label}</span>
              {t.key === "orders" && newCount > 0 && (
                <span className="absolute top-1 right-2 grid place-items-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black animate-pulse">{newCount}</span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* -------- DASHBOARD -------- */
function DashboardTab() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 7);
      const { data } = await sb.from("orders").select("*").gte("created_at", since.toISOString()).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: items = [] } = useQuery({
    queryKey: ["admin", "dashboard-items"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const { data } = await sb.from("order_items").select("item_name, quantity, created_at").gte("created_at", since.toISOString());
      return data ?? [];
    },
  });

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayOrders = orders.filter((o: any) => new Date(o.created_at) >= today);
    const days: { day: string; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const dayOrders = orders.filter((o: any) => {
        const t = new Date(o.created_at); return t >= d && t < next;
      });
      days.push({
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        total: dayOrders.reduce((s: number, o: any) => s + Number(o.total), 0),
        count: dayOrders.length,
      });
    }
    const topMap: Record<string, number> = {};
    items.forEach((it: any) => { topMap[it.item_name] = (topMap[it.item_name] ?? 0) + Number(it.quantity || 1); });
    const top = Object.entries(topMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return {
      todayCount: todayOrders.length,
      todayRevenue: todayOrders.reduce((s: number, o: any) => s + Number(o.total), 0),
      pending: orders.filter((o: any) => o.status === "new" || o.status === "preparing").length,
      weekRevenue: orders.reduce((s: number, o: any) => s + Number(o.total), 0),
      days, top,
    };
  }, [orders, items]);

  const maxDay = Math.max(1, ...stats.days.map(d => d.total));

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black mb-5">📊 Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Today's Orders" value={String(stats.todayCount)} />
        <Stat label="Today's Revenue" value={pkr(stats.todayRevenue)} accent />
        <Stat label="Pending" value={String(stats.pending)} />
        <Stat label="7-Day Revenue" value={pkr(stats.weekRevenue)} accent />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="font-black mb-4">Last 7 Days</div>
          {isLoading ? <div className="h-40 grid place-items-center text-muted-foreground text-sm">Loading...</div> : (
            <div className="flex items-end gap-2 h-40">
              {stats.days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="text-[10px] font-bold text-muted-foreground">{d.count}</div>
                  <div className="w-full rounded-t-md fire-gradient transition-all" style={{ height: `${(d.total / maxDay) * 100}%`, minHeight: d.total > 0 ? "6px" : "2px" }} title={pkr(d.total)} />
                  <div className="text-[10px] font-bold">{d.day}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="font-black mb-4">🔥 Top Items (30 days)</div>
          {stats.top.length === 0 ? <div className="text-sm text-muted-foreground">No sales yet</div> : (
            <ol className="space-y-2">
              {stats.top.map(([name, qty], i) => (
                <li key={name} className="flex items-center gap-3 text-sm">
                  <span className="grid place-items-center h-7 w-7 rounded-full fire-gradient text-white text-xs font-black">{i+1}</span>
                  <span className="flex-1 font-bold truncate">{name}</span>
                  <span className="font-black text-[var(--gold)]">{qty} sold</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------- ORDERS -------- */
function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin","orders"],
    queryFn: async () => {
      const { data } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: items = [] } = useQuery({
    queryKey: ["admin","order-items", expanded],
    queryFn: async () => {
      if (!expanded) return [];
      const { data } = await sb.from("order_items").select("*").eq("order_id", expanded);
      return data ?? [];
    },
    enabled: !!expanded,
  });

  async function setStatus(id: string, status: string) {
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    qc.invalidateQueries({ queryKey: ["admin","orders"] });
  }

  const stats = {
    total: orders.length,
    revenue: orders.reduce((s: number, o: any) => s + Number(o.total), 0),
    new: orders.filter((o: any) => o.status === "new").length,
  };

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Stat label="Total Orders" value={String(stats.total)} />
        <Stat label="Revenue" value={pkr(stats.revenue)} accent />
        <Stat label="New / Pending" value={String(stats.new)} />
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border font-bold">Recent Orders</div>
        {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading...</div> :
        orders.length === 0 ? <div className="p-8 text-center text-muted-foreground">No orders yet 🍟</div> :
        <div className="divide-y divide-border">
          {orders.map((o: any) => (
            <div key={o.id}>
              <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[160px_1fr_120px_100px_120px] gap-3 px-4 sm:px-5 py-3 sm:py-4 text-left hover:bg-[var(--secondary-bg)]">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-[var(--gold)] font-bold">{o.order_number}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{new Date(o.created_at).toLocaleString()}</div>
                  <div className="sm:hidden mt-1 font-bold text-sm truncate">{o.customer_name}</div>
                  <div className="sm:hidden text-[11px] text-muted-foreground truncate">{o.customer_phone}</div>
                </div>
                <div className="hidden sm:block min-w-0">
                  <div className="font-bold truncate">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{o.customer_phone} · {o.delivery_area}</div>
                </div>
                <div className="hidden sm:block font-black text-[var(--gold)]">{pkr(o.total)}</div>
                <div className="hidden sm:block"><StatusBadge status={o.status} /></div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="sm:hidden font-black text-[var(--gold)] text-sm">{pkr(o.total)}</span>
                  <span className="sm:hidden"><StatusBadge status={o.status} /></span>
                  {o.payment_screenshot_url && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase ${o.payment_verified?"bg-[var(--success)]/15 text-[var(--success)]":"bg-[var(--gold)]/15 text-[var(--gold)]"}`}>{o.payment_verified?"✓ Paid":"⏳ Pending"}</span>
                  )}
                  <span className="text-[11px] text-muted-foreground">{expanded === o.id ? "Hide" : "View"}</span>
                </div>
              </button>
              {expanded === o.id && (
                <div className="bg-[var(--secondary-bg)] px-5 py-4 border-t border-border space-y-3">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div><b>Address:</b> <span className="text-muted-foreground">{o.address}</span></div>
                    <div><b>Payment:</b> <span className="text-muted-foreground uppercase">{o.payment_method}</span></div>
                    {o.notes && <div className="sm:col-span-2"><b>Notes:</b> <span className="text-muted-foreground">{o.notes}</span></div>}
                  </div>
                  {o.payment_screenshot_url && (
                    <PaymentScreenshot order={o} onVerified={()=>qc.invalidateQueries({ queryKey: ["admin","orders"] })} />
                  )}
                  <div className="rounded-lg border border-border bg-card p-3">
                    {items.map((it: any) => (
                      <div key={it.id} className="flex justify-between text-sm py-1">
                        <span>{it.quantity}× {it.item_name}{it.customizations ? <span className="text-[11px] text-muted-foreground"> · {Object.entries(it.customizations).map(([k,v])=>`${k}: ${v}`).join(", ")}</span> : null}</span>
                        <span className="font-bold">{pkr(it.subtotal)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm border-t border-border mt-2 pt-2 text-muted-foreground"><span>Delivery</span><span>{pkr(o.delivery_charge)}</span></div>
                    <div className="flex justify-between font-black mt-1 text-[var(--gold)]"><span>Total</span><span>{pkr(o.total)}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["new","preparing","out_for_delivery","delivered","cancelled"].map((s) => (
                      <button key={s} onClick={()=>setStatus(o.id, s)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${o.status===s?"fire-gradient text-white":"border border-border hover:border-primary"}`}>{s.replace(/_/g," ")}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string,string> = {
    new: "bg-[var(--gold)]/15 text-[var(--gold)]",
    preparing: "bg-primary/15 text-primary",
    out_for_delivery: "bg-blue-500/15 text-blue-400",
    delivered: "bg-[var(--success)]/15 text-[var(--success)]",
    cancelled: "bg-destructive/15 text-destructive",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${map[status] ?? "bg-muted text-muted-foreground"}`}>{status.replace(/_/g," ")}</span>;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-black ${accent?"text-[var(--gold)]":""}`}>{value}</div>
    </div>
  );
}

/* -------- MENU -------- */
function MenuTab() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery({ queryKey:["admin","cats"], queryFn: async()=>{const {data}=await sb.from("categories").select("*").order("display_order"); return data ?? [];}});
  const { data: items = [] } = useQuery({ queryKey:["admin","menu"], queryFn: async()=>{const {data}=await sb.from("menu_items").select("*").order("display_order"); return data ?? [];}});
  const [editing, setEditing] = useState<any | null>(null);

  async function save(row: any) {
    const payload = { ...row };
    const { id, ...rest } = payload;
    const action = id ? sb.from("menu_items").update(rest).eq("id", id) : sb.from("menu_items").insert(rest);
    const { error } = await action;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey:["admin","menu"] });
    qc.invalidateQueries({ queryKey:["menu"] });
  }
  async function del(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await sb.from("menu_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey:["admin","menu"] });
    qc.invalidateQueries({ queryKey:["menu"] });
  }

  return (
    <div>
      <div className="flex justify-between mb-5">
        <h2 className="text-2xl font-black">Menu Items</h2>
        <button onClick={()=>setEditing({ name:"", description:"", price:0, category_id: cats[0]?.id, is_bestseller:false, is_featured:false, is_available:true, image_url:"" })} className="inline-flex items-center gap-1 rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4"/> Add Item</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it: any) => (
          <div key={it.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            {it.image_url && <img src={it.image_url} alt="" className="h-32 w-full object-cover" />}
            <div className="p-4">
              <div className="font-bold">{it.name}</div>
              <div className="text-xs text-muted-foreground">{cats.find((c:any)=>c.id===it.category_id)?.name}</div>
              <div className="mt-2 text-lg font-black text-[var(--gold)]">{pkr(it.price)}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>setEditing(it)} className="flex-1 inline-flex justify-center items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:border-primary"><Pencil className="h-3 w-3"/>Edit</button>
                <button onClick={()=>del(it.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-destructive hover:border-destructive"><Trash2 className="h-3 w-3"/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && <ItemEditor cats={cats} item={editing} onClose={()=>setEditing(null)} onSave={save} />}
    </div>
  );
}

function ItemEditor({ cats, item, onClose, onSave }: any) {
  const [f, setF] = useState(item);
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6" onClick={(e)=>e.stopPropagation()}>
        <h3 className="text-xl font-black mb-4">{item.id ? "Edit Item" : "New Item"}</h3>
        <div className="space-y-3">
          <FormField label="Name"><input className={ic} value={f.name} onChange={(e)=>setF({...f,name:e.target.value})}/></FormField>
          <FormField label="Description"><textarea className={ic} rows={2} value={f.description ?? ""} onChange={(e)=>setF({...f,description:e.target.value})}/></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price (PKR)"><input type="number" className={ic} value={f.price} onChange={(e)=>setF({...f,price:Number(e.target.value)})}/></FormField>
            <FormField label="Original Price"><input type="number" className={ic} value={f.original_price ?? ""} onChange={(e)=>setF({...f,original_price:e.target.value?Number(e.target.value):null})}/></FormField>
          </div>
          <FormField label="Category">
            <select className={ic} value={f.category_id ?? ""} onChange={(e)=>setF({...f,category_id:e.target.value})}>
              {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Image"><MediaUpload value={f.image_url ?? ""} onChange={(v)=>setF({...f,image_url:v})} folder="menu" /></FormField>
          <div className="flex flex-wrap gap-4 text-sm">
            <Toggle label="Bestseller" v={f.is_bestseller} onChange={(v)=>setF({...f,is_bestseller:v})} />
            <Toggle label="Featured" v={f.is_featured} onChange={(v)=>setF({...f,is_featured:v})} />
            <Toggle label="Available" v={f.is_available} onChange={(v)=>setF({...f,is_available:v})} />
          </div>
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={()=>onSave(f)} className="rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

/* -------- DEALS -------- */
function DealsTab() {
  const qc = useQueryClient();
  const { data: deals = [] } = useQuery({ queryKey:["admin","deals"], queryFn: async()=>{const {data}=await sb.from("deals").select("*").order("display_order"); return data ?? [];}});
  const [editing, setEditing] = useState<any | null>(null);

  async function save(d: any) {
    const { id, ...rest } = d;
    const action = id ? sb.from("deals").update(rest).eq("id", id) : sb.from("deals").insert(rest);
    const { error } = await action;
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null);
    qc.invalidateQueries({ queryKey:["admin","deals"] });
    qc.invalidateQueries({ queryKey:["deals"] });
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await sb.from("deals").delete().eq("id", id);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey:["admin","deals"] });
    qc.invalidateQueries({ queryKey:["deals"] });
  }

  return (
    <div>
      <div className="flex justify-between mb-5">
        <h2 className="text-2xl font-black">Deals</h2>
        <button onClick={()=>setEditing({ name:"", deal_price:0, original_price:0, items_included:"", badge_text:"", image_url:"", is_active:true })} className="inline-flex items-center gap-1 rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4"/> Add Deal</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map((d: any) => (
          <div key={d.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            {d.image_url && <img src={d.image_url} alt="" className="h-32 w-full object-cover" />}
            <div className="p-4">
              <div className="font-bold">{d.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{d.items_included}</div>
              <div className="mt-2 text-lg font-black text-[var(--gold)]">{pkr(d.deal_price)}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>setEditing(d)} className="flex-1 inline-flex justify-center items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:border-primary"><Pencil className="h-3 w-3"/>Edit</button>
                <button onClick={()=>del(d.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-destructive hover:border-destructive"><Trash2 className="h-3 w-3"/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur grid place-items-center p-4" onClick={()=>setEditing(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-xl font-black mb-4">{editing.id?"Edit":"New"} Deal</h3>
            <div className="space-y-3">
              <FormField label="Name"><input className={ic} value={editing.name} onChange={(e)=>setEditing({...editing,name:e.target.value})}/></FormField>
              <FormField label="Items Included"><textarea className={ic} rows={2} value={editing.items_included ?? ""} onChange={(e)=>setEditing({...editing,items_included:e.target.value})}/></FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Deal Price"><input type="number" className={ic} value={editing.deal_price} onChange={(e)=>setEditing({...editing,deal_price:Number(e.target.value)})}/></FormField>
                <FormField label="Original Price"><input type="number" className={ic} value={editing.original_price ?? ""} onChange={(e)=>setEditing({...editing,original_price:Number(e.target.value)})}/></FormField>
              </div>
              <FormField label="Badge"><input className={ic} value={editing.badge_text ?? ""} onChange={(e)=>setEditing({...editing,badge_text:e.target.value})}/></FormField>
              <FormField label="Image"><MediaUpload value={editing.image_url ?? ""} onChange={(v)=>setEditing({...editing,image_url:v})} folder="deals" /></FormField>
              <Toggle label="Active" v={editing.is_active} onChange={(v)=>setEditing({...editing,is_active:v})} />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={()=>setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Cancel</button>
              <button onClick={()=>save(editing)} className="rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- REVIEWS -------- */
function ReviewsTab() {
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery({ queryKey:["admin","reviews"], queryFn: async()=>{const {data}=await sb.from("reviews").select("*").order("created_at",{ascending:false}); return data ?? [];}});
  const [editing, setEditing] = useState<any | null>(null);

  async function approve(id: string, v: boolean) {
    await sb.from("reviews").update({ is_approved: v }).eq("id", id);
    toast.success(v?"Approved":"Hidden");
    qc.invalidateQueries({ queryKey:["admin","reviews"] });
    qc.invalidateQueries({ queryKey:["reviews-approved"] });
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await sb.from("reviews").delete().eq("id", id);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey:["admin","reviews"] });
    qc.invalidateQueries({ queryKey:["reviews-approved"] });
  }
  async function save(r: any) {
    const { id, ...rest } = r;
    if (!rest.customer_name?.trim()) return toast.error("Name required");
    if (!rest.rating || rest.rating < 1) return toast.error("Pick a rating");
    const action = id ? sb.from("reviews").update(rest).eq("id", id) : sb.from("reviews").insert(rest);
    const { error } = await action;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey:["admin","reviews"] });
    qc.invalidateQueries({ queryKey:["reviews-approved"] });
  }

  return (
    <div>
      <div className="flex justify-between mb-5">
        <h2 className="text-2xl font-black">Reviews</h2>
        <button onClick={()=>setEditing({ customer_name:"", rating:5, comment:"", video_url:"", is_approved:true })} className="inline-flex items-center gap-1 rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4"/> Add Review</button>
      </div>
      <div className="space-y-3">
        {reviews.map((r: any) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex gap-4">
              {r.video_url && <video src={r.video_url} className="h-24 w-32 rounded-lg object-cover bg-black border border-border" muted controls />}
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="font-bold">{r.customer_name} {r.is_approved && <span className="ml-2 text-[10px] uppercase font-black text-[var(--success)]">live</span>}</div>
                    <div className="flex gap-0.5 text-[var(--gold)] mt-1">{Array.from({length:r.rating}).map((_,i)=><Star key={i} className="h-3.5 w-3.5 fill-current"/>)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {r.is_approved ? (
                    <button onClick={()=>approve(r.id,false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">Hide</button>
                  ) : (
                    <button onClick={()=>approve(r.id,true)} className="inline-flex items-center gap-1 rounded-lg fire-gradient px-3 py-1.5 text-xs font-bold text-white"><Check className="h-3 w-3"/>Approve</button>
                  )}
                  <button onClick={()=>setEditing(r)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:border-primary"><Pencil className="h-3 w-3"/>Edit</button>
                  <button onClick={()=>del(r.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-destructive"><Trash2 className="h-3 w-3"/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">No reviews yet</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur grid place-items-center p-4 overflow-y-auto" onClick={()=>setEditing(null)}>
          <div className="w-full max-w-lg my-8 rounded-2xl border border-border bg-card p-6" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-xl font-black mb-4">{editing.id?"Edit":"New"} Review</h3>
            <div className="space-y-3">
              <FormField label="Customer name"><input className={ic} value={editing.customer_name} onChange={(e)=>setEditing({...editing,customer_name:e.target.value})}/></FormField>
              <FormField label="Rating">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={()=>setEditing({...editing,rating:n})} className={`p-1 ${n<=editing.rating?"text-[var(--gold)]":"text-muted-foreground"}`}>
                      <Star className={`h-6 w-6 ${n<=editing.rating?"fill-current":""}`} />
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="Comment"><textarea className={ic} rows={3} value={editing.comment ?? ""} onChange={(e)=>setEditing({...editing,comment:e.target.value})}/></FormField>
              <FormField label="Video (optional)"><MediaUpload value={editing.video_url ?? ""} onChange={(v)=>setEditing({...editing,video_url:v})} folder="reviews" kind="video" /></FormField>
              <Toggle label="Show on site (approved)" v={editing.is_approved} onChange={(v)=>setEditing({...editing,is_approved:v})} />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={()=>setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Cancel</button>
              <button onClick={()=>save(editing)} className="rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- SETTINGS -------- */
function SettingsTab() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({ queryKey:["admin","settings"], queryFn: async()=>{const {data}=await sb.from("site_settings").select("*").order("key"); return data ?? [];}});
  const [draft, setDraft] = useState<Record<string,string>>({});
  useEffect(()=>{
    const d: Record<string,string> = {};
    rows.forEach((r: any)=>{d[r.key]=r.value ?? "";});
    setDraft(d);
  },[rows]);

  async function saveAll() {
    for (const k of Object.keys(draft)) {
      await sb.from("site_settings").update({ value: draft[k] }).eq("key", k);
    }
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey:["admin","settings"] });
    qc.invalidateQueries({ queryKey:["settings"] });
  }

  return (
    <div>
      <div className="flex justify-between mb-5">
        <h2 className="text-2xl font-black">Site Settings</h2>
        <button onClick={saveAll} className="rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white">Save All</button>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        {rows.map((r: any) => (
          <FormField key={r.key} label={r.key}>
            {r.key === "about_us" || r.key === "announcement" ? (
              <textarea rows={3} className={ic} value={draft[r.key] ?? ""} onChange={(e)=>setDraft({...draft,[r.key]:e.target.value})}/>
            ) : (
              <input className={ic} value={draft[r.key] ?? ""} onChange={(e)=>setDraft({...draft,[r.key]:e.target.value})}/>
            )}
          </FormField>
        ))}
      </div>
    </div>
  );
}

/* -------- DELIVERY AREAS -------- */
function AreasTab() {
  const qc = useQueryClient();
  const { data: areas = [] } = useQuery({
    queryKey: ["admin", "areas"],
    queryFn: async () => {
      const { data } = await sb.from("delivery_areas").select("*").order("zone").order("name");
      return data ?? [];
    },
  });
  const [editing, setEditing] = useState<any | null>(null);

  async function save(a: any) {
    if (!a.name?.trim()) return toast.error("Area name required");
    const { id, ...rest } = a;
    rest.charge = Number(rest.charge) || 0;
    const action = id ? sb.from("delivery_areas").update(rest).eq("id", id) : sb.from("delivery_areas").insert(rest);
    const { error } = await action;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "areas"] });
    qc.invalidateQueries({ queryKey: ["areas"] });
  }
  async function toggleActive(a: any) {
    const { error } = await sb.from("delivery_areas").update({ is_active: !a.is_active }).eq("id", a.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "areas"] });
    qc.invalidateQueries({ queryKey: ["areas"] });
  }
  async function del(id: string) {
    if (!confirm("Delete this delivery area?")) return;
    const { error } = await sb.from("delivery_areas").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "areas"] });
    qc.invalidateQueries({ queryKey: ["areas"] });
  }

  return (
    <div>
      <div className="flex justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black">Delivery Areas</h2>
          <p className="text-sm text-muted-foreground mt-1">Changes reflect instantly on the checkout page.</p>
        </div>
        <button onClick={() => setEditing({ name: "", zone: "A", charge: 50, est_time: "20-30 mins", is_active: true })} className="inline-flex items-center gap-1 rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add Area</button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_70px_100px_140px_90px_120px] gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
          <div>Area Name</div><div>Zone</div><div>Charge</div><div>Est. Time</div><div>Active</div><div className="text-right">Actions</div>
        </div>
        {areas.length === 0 && <div className="p-8 text-center text-muted-foreground">No delivery areas yet</div>}
        {areas.map((a: any) => (
          <div key={a.id} className="grid grid-cols-[1fr_70px_100px_140px_90px_120px] gap-2 px-5 py-3 items-center border-b border-border/60 last:border-0 text-sm">
            <div className="font-bold">{a.name}</div>
            <div><span className="inline-flex rounded-full bg-[var(--secondary-bg)] border border-border px-2 py-0.5 text-[11px] font-black">{a.zone ?? "—"}</span></div>
            <div className="font-black text-[var(--gold)]">{pkr(a.charge)}</div>
            <div className="text-xs text-muted-foreground">{a.est_time ?? "—"}</div>
            <div>
              <button onClick={() => toggleActive(a)} className={`rounded-full w-10 h-5 relative transition ${a.is_active ? "bg-[var(--success)]" : "bg-muted"}`}>
                <span className={`absolute top-0.5 ${a.is_active ? "right-0.5" : "left-0.5"} h-4 w-4 rounded-full bg-white transition`}></span>
              </button>
            </div>
            <div className="flex justify-end gap-1">
              <button onClick={() => setEditing(a)} className="rounded-lg border border-border px-2 py-1.5 text-xs font-bold hover:border-primary"><Pencil className="h-3 w-3" /></button>
              <button onClick={() => del(a.id)} className="rounded-lg border border-border px-2 py-1.5 text-xs font-bold text-destructive hover:border-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black mb-4">{editing.id ? "Edit" : "New"} Delivery Area</h3>
            <div className="space-y-3">
              <FormField label="Area Name"><input className={ic} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Civil Lines" /></FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Zone">
                  <select className={ic} value={editing.zone ?? ""} onChange={(e) => setEditing({ ...editing, zone: e.target.value })}>
                    <option value="A">Zone A</option>
                    <option value="B">Zone B</option>
                    <option value="C">Zone C</option>
                    <option value="D">Zone D</option>
                    <option value="Custom">Custom</option>
                  </select>
                </FormField>
                <FormField label="Charge (PKR)"><input type="number" className={ic} value={editing.charge} onChange={(e) => setEditing({ ...editing, charge: Number(e.target.value) })} /></FormField>
              </div>
              <FormField label="Estimated Time"><input className={ic} value={editing.est_time ?? ""} onChange={(e) => setEditing({ ...editing, est_time: e.target.value })} placeholder="e.g. 20-30 mins" /></FormField>
              <Toggle label="Active" v={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Cancel</button>
              <button onClick={() => save(editing)} className="rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- PAYMENTS -------- */
function PaymentsTab() {
  const qc = useQueryClient();
  const { data: methods = [] } = useQuery({
    queryKey: ["admin", "payment-methods"],
    queryFn: async () => {
      const { data } = await sb.from("payment_methods").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const [editing, setEditing] = useState<any | null>(null);

  async function save(m: any) {
    if (!m.code?.trim() || !m.label?.trim()) return toast.error("Code and label required");
    const { id, created_at, updated_at, ...rest } = m;
    rest.sort_order = Number(rest.sort_order) || 0;
    const action = id ? sb.from("payment_methods").update(rest).eq("id", id) : sb.from("payment_methods").insert(rest);
    const { error } = await action;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "payment-methods"] });
    qc.invalidateQueries({ queryKey: ["payment-methods"] });
  }
  async function toggleActive(m: any) {
    const { error } = await sb.from("payment_methods").update({ is_active: !m.is_active }).eq("id", m.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "payment-methods"] });
    qc.invalidateQueries({ queryKey: ["payment-methods"] });
  }
  async function del(id: string) {
    if (!confirm("Delete this payment method?")) return;
    const { error } = await sb.from("payment_methods").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "payment-methods"] });
    qc.invalidateQueries({ queryKey: ["payment-methods"] });
  }

  return (
    <div>
      <div className="flex justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black">Payment Methods</h2>
          <p className="text-sm text-muted-foreground mt-1">Add or edit payment options shown on checkout.</p>
        </div>
        <button onClick={() => setEditing({ code: "", label: "", description: "", instructions: "", account_title: "", account_number: "", icon: "💳", is_active: true, sort_order: methods.length + 1 })} className="inline-flex items-center gap-1 rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add Method</button>
      </div>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {methods.length === 0 && <div className="p-8 text-center text-muted-foreground">No payment methods yet</div>}
        {methods.map((m: any) => (
          <div key={m.id} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center px-5 py-4">
            <div className="text-2xl">{m.icon || "💳"}</div>
            <div className="min-w-0">
              <div className="font-bold flex items-center gap-2">
                {m.label}
                <span className="rounded-full bg-[var(--secondary-bg)] border border-border px-2 py-0.5 text-[10px] font-mono uppercase">{m.code}</span>
              </div>
              {m.description && <div className="text-xs text-muted-foreground truncate">{m.description}</div>}
              {m.account_number && <div className="text-[11px] font-mono text-[var(--gold)] mt-0.5">{m.account_title} · {m.account_number}</div>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(m)} className={`rounded-full w-10 h-5 relative transition ${m.is_active ? "bg-[var(--success)]" : "bg-muted"}`}>
                <span className={`absolute top-0.5 ${m.is_active ? "right-0.5" : "left-0.5"} h-4 w-4 rounded-full bg-white transition`}></span>
              </button>
              <button onClick={() => setEditing(m)} className="rounded-lg border border-border px-2 py-1.5 text-xs font-bold hover:border-primary"><Pencil className="h-3 w-3" /></button>
              <button onClick={() => del(m.id)} className="rounded-lg border border-border px-2 py-1.5 text-xs font-bold text-destructive hover:border-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black mb-4">{editing.id ? "Edit" : "New"} Payment Method</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <FormField label="Icon"><input className={ic} value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="💵" /></FormField>
                <FormField label="Label"><input className={ic} value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} placeholder="Cash on Delivery" /></FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Code (unique)"><input className={ic} value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toLowerCase().replace(/\s+/g, "_") })} placeholder="cod" /></FormField>
                <FormField label="Sort Order"><input type="number" className={ic} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></FormField>
              </div>
              <FormField label="Short Description"><input className={ic} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Pay when it arrives" /></FormField>
              <FormField label="Instructions (shown after select)"><textarea rows={2} className={ic} value={editing.instructions ?? ""} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })} placeholder="Send screenshot to WhatsApp after payment" /></FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Account Title"><input className={ic} value={editing.account_title ?? ""} onChange={(e) => setEditing({ ...editing, account_title: e.target.value })} placeholder="Kitchen 86" /></FormField>
                <FormField label="Account Number"><input className={ic} value={editing.account_number ?? ""} onChange={(e) => setEditing({ ...editing, account_number: e.target.value })} placeholder="0300-1234567" /></FormField>
              </div>
              <Toggle label="Active" v={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Cancel</button>
              <button onClick={() => save(editing)} className="rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- PAYMENT SCREENSHOT VIEW -------- */
function PaymentScreenshot({ order, onVerified }: { order: any; onVerified: () => void }) {
  const url: string = order.payment_screenshot_url ?? "";
  const [lightbox, setLightbox] = useState(false);
  const [busy, setBusy] = useState(false);

  async function verify(v: boolean) {
    setBusy(true);
    const { error } = await sb.from("orders").update({ payment_verified: v }).eq("id", order.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(v ? "Payment verified ✓" : "Marked unverified");
    onVerified();
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 flex flex-col sm:flex-row gap-3">
      {url ? (
        <button onClick={()=>setLightbox(true)} className="shrink-0">
          <img src={url} alt="Payment proof" className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg object-cover border border-border hover:border-primary transition" />
        </button>
      ) : (
        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg bg-[var(--secondary-bg)] grid place-items-center text-xs text-muted-foreground">Loading…</div>
      )}
      <div className="flex-1">
        <div className="font-bold text-sm">💳 Payment Proof</div>
        <div className="text-xs text-muted-foreground mt-0.5">Customer uploaded a screenshot. Tap image to view full size.</div>
        <div className="mt-2 flex gap-2">
          {order.payment_verified ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--success)]/15 text-[var(--success)] px-3 py-1.5 text-xs font-black"><ShieldCheck className="h-3.5 w-3.5"/> Verified</span>
              <button disabled={busy} onClick={()=>verify(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:border-destructive text-destructive">Unverify</button>
            </>
          ) : (
            <button disabled={busy} onClick={()=>verify(true)} className="inline-flex items-center gap-1 rounded-lg fire-gradient px-3 py-1.5 text-xs font-bold text-white"><Check className="h-3.5 w-3.5"/> Verify Payment</button>
          )}
        </div>
      </div>
      {lightbox && url && (
        <div className="fixed inset-0 z-[60] bg-black/90 grid place-items-center p-4" onClick={()=>setLightbox(false)}>
          <img src={url} alt="Payment proof" className="max-h-[90vh] max-w-full rounded-lg" />
          <button className="absolute top-4 right-4 grid place-items-center h-10 w-10 rounded-full bg-white/10 text-white"><X className="h-5 w-5"/></button>
        </div>
      )}
    </div>
  );
}

/* -------- CART SUGGESTIONS -------- */
function SuggestionsTab() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["admin", "menu-min"],
    queryFn: async () => { const { data } = await sb.from("menu_items").select("id,name").order("name"); return data ?? []; },
  });
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "suggestions"],
    queryFn: async () => { const { data } = await sb.from("cart_suggestions").select("*").order("display_order"); return data ?? []; },
  });
  const [editing, setEditing] = useState<any | null>(null);

  async function save(r: any) {
    if (!r.menu_item_id) return toast.error("Pick an item");
    const { id, ...rest } = r;
    const action = id ? sb.from("cart_suggestions").update(rest).eq("id", id) : sb.from("cart_suggestions").insert(rest);
    const { error } = await action;
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "suggestions"] });
    qc.invalidateQueries({ queryKey: ["cart-suggestions"] });
  }
  async function del(id: string) {
    if (!confirm("Remove this suggestion?")) return;
    await sb.from("cart_suggestions").delete().eq("id", id);
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["admin", "suggestions"] });
    qc.invalidateQueries({ queryKey: ["cart-suggestions"] });
  }

  return (
    <div>
      <div className="flex justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black">✨ Cart Suggestions</h2>
          <p className="text-sm text-muted-foreground mt-1">"Don't forget…" items shown on the cart page.</p>
        </div>
        <button onClick={()=>setEditing({ menu_item_id: items[0]?.id ?? "", label: "Don't forget!", display_order: rows.length, is_active: true })} className="inline-flex items-center gap-1 rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add</button>
      </div>
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {rows.length === 0 && <div className="p-8 text-center text-muted-foreground">No suggestions yet</div>}
        {rows.map((r: any) => {
          const item = items.find((i: any) => i.id === r.menu_item_id);
          return (
            <div key={r.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{item?.name ?? "(deleted item)"}</div>
                <div className="text-xs text-muted-foreground">{r.label} · order {r.display_order}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${r.is_active?"bg-[var(--success)]/15 text-[var(--success)]":"bg-muted text-muted-foreground"}`}>{r.is_active?"Active":"Hidden"}</span>
              <button onClick={()=>setEditing(r)} className="rounded-lg border border-border px-2 py-1.5 text-xs font-bold hover:border-primary"><Pencil className="h-3 w-3" /></button>
              <button onClick={()=>del(r.id)} className="rounded-lg border border-border px-2 py-1.5 text-xs font-bold text-destructive hover:border-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur grid place-items-center p-4" onClick={()=>setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-xl font-black mb-4">{editing.id?"Edit":"New"} Suggestion</h3>
            <div className="space-y-3">
              <FormField label="Menu Item">
                <select className={ic} value={editing.menu_item_id ?? ""} onChange={(e)=>setEditing({...editing, menu_item_id: e.target.value})}>
                  {items.map((i: any)=>(<option key={i.id} value={i.id}>{i.name}</option>))}
                </select>
              </FormField>
              <FormField label="Label"><input className={ic} value={editing.label ?? ""} onChange={(e)=>setEditing({...editing, label: e.target.value})} placeholder="Don't forget the drink!" /></FormField>
              <FormField label="Display Order"><input type="number" className={ic} value={editing.display_order ?? 0} onChange={(e)=>setEditing({...editing, display_order: Number(e.target.value)})} /></FormField>
              <Toggle label="Active" v={editing.is_active} onChange={(v)=>setEditing({...editing, is_active: v})} />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={()=>setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Cancel</button>
              <button onClick={()=>save(editing)} className="rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* helpers */
const ic = "w-full rounded-lg border border-border bg-[var(--secondary-bg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]";
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>{children}</label>;
}
function Toggle({ label, v, onChange }: { label: string; v: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={()=>onChange(!v)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold ${v?"fire-gradient text-white border-transparent":"border-border text-muted-foreground"}`}>
      {v?<Check className="h-3 w-3"/>:<X className="h-3 w-3"/>} {label}
    </button>
  );
}
