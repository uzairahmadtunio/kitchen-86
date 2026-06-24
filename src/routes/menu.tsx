import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MenuCard } from "@/components/menu-card";
import { DealCard } from "@/components/deal-card";
import { ItemDetailModal } from "@/components/item-detail-modal";
import type { MenuItem } from "@/lib/site-data";
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
  const [query, setQuery] = useState("");
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);

  const q = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!q) return [];
    return menu.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      (m.description ?? "").toLowerCase().includes(q)
    );
  }, [q, menu]);

  const filtered = useMemo(() => active === "all" ? menu : menu.filter((m) => m.category_id === active), [active, menu]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-[var(--secondary-bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Full Menu</div>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black">Pick Your <span className="fire-text">Fire</span></h1>
          {/* Search bar */}
          <div className="mt-5 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for burgers, fries..."
              className="w-full rounded-xl border-2 border-border bg-background pl-11 pr-11 py-3 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-muted hover:bg-border">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {!q && (
        <section className="sticky top-[57px] z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
            <CategoryChip label="All" active={active === "all"} onClick={() => setActive("all")} />
            {cats.map((c) => (
              <CategoryChip key={c.id} label={`${c.icon ?? ""} ${c.name}`} active={active === c.id} onClick={() => setActive(c.id)} />
            ))}
            <CategoryChip label="🔥 Deals" active={active === "deals"} onClick={() => setActive("deals")} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex-1">
        {q ? (
          searchResults.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🔎</div>
              <div className="text-lg font-bold">No results for "{query}"</div>
              <div className="text-sm text-muted-foreground mt-1">Try a different keyword</div>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">{searchResults.length} result{searchResults.length === 1 ? "" : "s"} for "{query}"</div>
              <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
                {searchResults.map((m) => <MenuCard key={m.id} item={m} onOpen={setOpenItem} />)}
              </div>
            </>
          )
        ) : active === "deals" ? (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
                    {items.map((m) => <MenuCard key={m.id} item={m} onOpen={setOpenItem} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => <MenuCard key={m.id} item={m} onOpen={setOpenItem} />)}
          </div>
        )}
      </section>

      <SiteFooter settings={settings} />

      {openItem && (
        <ItemDetailModal
          item={openItem}
          allItems={menu}
          categories={cats}
          onClose={() => setOpenItem(null)}
        />
      )}
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
