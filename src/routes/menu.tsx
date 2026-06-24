import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MenuCard } from "@/components/menu-card";
import { DealCard } from "@/components/deal-card";
import { fetchSettings, fetchMenu, fetchCategories, fetchDeals } from "@/lib/site-data";

const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });
const menuQO = queryOptions({ queryKey: ["menu"], queryFn: fetchMenu });
const catsQO = queryOptions({ queryKey: ["categories"], queryFn: fetchCategories });
const dealsQO = queryOptions({ queryKey: ["deals"], queryFn: fetchDeals });

export const Route = createFileRoute("/menu")({
  head: () => ({ meta: [
    { title: "Menu — Kitchen 86 | Larkana" },
    { name: "description", content: "Browse Kitchen 86's full menu — burgers, wraps, Matka fries, strips and drinks. Order online for fast delivery in Larkana." },
  ]}),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(settingsQO);
    context.queryClient.ensureQueryData(menuQO);
    context.queryClient.ensureQueryData(catsQO);
    context.queryClient.ensureQueryData(dealsQO);
  },
  component: MenuPage,
});

function MenuPage() {
  const { data: settings } = useSuspenseQuery(settingsQO);
  const { data: menu } = useSuspenseQuery(menuQO);
  const { data: cats } = useSuspenseQuery(catsQO);
  const { data: deals } = useSuspenseQuery(dealsQO);
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => active === "all" ? menu : menu.filter((m) => m.category_id === active), [active, menu]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-[var(--secondary-bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Full Menu</div>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black">Pick Your <span className="fire-text">Fire</span></h1>
        </div>
      </section>

      <section className="sticky top-[57px] z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <CategoryChip label="All" active={active === "all"} onClick={() => setActive("all")} />
          {cats.map((c) => (
            <CategoryChip key={c.id} label={`${c.icon ?? ""} ${c.name}`} active={active === c.id} onClick={() => setActive(c.id)} />
          ))}
          <CategoryChip label="🔥 Deals" active={active === "deals"} onClick={() => setActive("deals")} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex-1">
        {active === "deals" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((d) => <DealCard key={d.id} deal={d} />)}
          </div>
        ) : active === "all" ? (
          <div className="space-y-12">
            {cats.map((c) => {
              const items = menu.filter((m) => m.category_id === c.id);
              if (!items.length) return null;
              return (
                <div key={c.id}>
                  <h2 className="text-2xl font-black mb-5">{c.icon} {c.name}</h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((m) => <MenuCard key={m.id} item={m} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => <MenuCard key={m.id} item={m} />)}
          </div>
        )}
      </section>

      <SiteFooter settings={settings} />
    </div>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all ${active ? "fire-gradient text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}
    >{label}</button>
  );
}
