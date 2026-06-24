import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Flame, Phone, MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { MenuCard } from "@/components/menu-card";
import { DealCard } from "@/components/deal-card";
import { ItemDetailModal } from "@/components/item-detail-modal";
import type { MenuItem } from "@/lib/site-data";
import { fetchSettings, fetchMenu, fetchDeals, fetchCategories, fetchApprovedReviews } from "@/lib/site-data";

const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });
const menuQO = queryOptions({ queryKey: ["menu"], queryFn: fetchMenu });
const dealsQO = queryOptions({ queryKey: ["deals"], queryFn: fetchDeals });
const catsQO = queryOptions({ queryKey: ["categories"], queryFn: fetchCategories });
const reviewsQO = queryOptions({ queryKey: ["reviews-approved"], queryFn: fetchApprovedReviews });

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(settingsQO);
    context.queryClient.ensureQueryData(menuQO);
    context.queryClient.ensureQueryData(dealsQO);
    context.queryClient.ensureQueryData(catsQO);
    context.queryClient.ensureQueryData(reviewsQO);
  },
  component: Home,
});

function Home() {
  const { data: settings } = useSuspenseQuery(settingsQO);
  const { data: menu } = useSuspenseQuery(menuQO);
  const { data: deals } = useSuspenseQuery(dealsQO);
  const { data: cats } = useSuspenseQuery(catsQO);
  const { data: reviews } = useSuspenseQuery(reviewsQO);
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);

  const featured = menu.filter((m) => m.is_featured || m.is_bestseller).slice(0, 6);
  const waUrl = `https://wa.me/${(settings.whatsapp ?? "").replace(/\D/g, "")}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {settings.announcement_active === "true" && <AnnouncementBar text={settings.announcement} />}
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,69,0,0.25),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(255,165,0,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,#0A0A0A)]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-primary" /> Larkana's #1 Fast Food
            </div>
            <h1 className="mt-4 text-4xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight">
              ALWAYS <span className="fire-text">FRESH</span>.<br />
              TASTE THE <span className="fire-text">BEST</span>.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-md">{settings.hero_subtitle || settings.specialty}</p>
            <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
              <Link to="/menu" className="inline-flex justify-center items-center gap-2 rounded-xl fire-gradient px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white glow-orange transition-transform hover:scale-105">
                Order Now <ChevronRight className="h-4 w-4" />
              </Link>
              <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex justify-center items-center gap-2 rounded-xl border-2 border-border bg-card px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider hover:border-primary">
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            </div>
            <div className="mt-6 sm:mt-8 flex gap-4 sm:gap-6 text-[11px] sm:text-xs text-muted-foreground overflow-x-auto no-scrollbar">
              <span className="inline-flex items-center gap-2 whitespace-nowrap"><MapPin className="h-4 w-4 text-primary shrink-0" /> {settings.address}</span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap"><Clock className="h-4 w-4 text-primary shrink-0" /> {settings.hours}</span>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden border-2 border-border glow-orange">
              <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80" alt="Signature Zinger 86" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 rounded-2xl bg-card border border-border p-3 sm:p-4 shadow-2xl">
              <div className="text-[10px] sm:text-xs text-muted-foreground">Signature</div>
              <div className="text-sm sm:text-lg font-black">Zinger 86</div>
              <div className="text-[var(--gold)] font-black text-base sm:text-xl">PKR 399</div>
            </div>
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 rounded-2xl fire-gradient p-3 sm:p-4 text-white shadow-2xl rotate-3">
              <div className="text-xl sm:text-2xl font-black">🔥</div>
              <div className="text-[10px] sm:text-xs font-bold uppercase">Ao Lootlo</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES STRIP */}
      <section className="border-y border-border bg-[var(--secondary-bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          {cats.map((c) => (
            <a key={c.id} href="/menu" className="shrink-0 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold hover:border-primary transition-colors whitespace-nowrap">
              <span className="text-base sm:text-lg">{c.icon}</span> {c.name}
            </a>
          ))}
        </div>
      </section>

      {/* DEALS */}
      <section id="deals" className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold">🔥 Ao Lootlo</div>
            <h2 className="mt-2 text-3xl sm:text-5xl font-black">Hot <span className="fire-text">Deals</span></h2>
          </div>
          <Link to="/menu" className="hidden sm:inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground gap-1">See menu <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => <DealCard key={d.id} deal={d} />)}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="mb-6 sm:mb-8">
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Bestsellers</div>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black">Fan <span className="fire-text">Favorites</span></h2>
        </div>
        <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
          {featured.map((m) => <MenuCard key={m.id} item={m} onOpen={setOpenItem} />)}
        </div>
        <div className="mt-10 text-center">
          <Link to="/menu" className="inline-flex items-center gap-2 rounded-xl fire-gradient px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white">
            View Full Menu <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/3] rounded-3xl overflow-hidden border-2 border-border">
          <img src="https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=900&q=80" alt="Kitchen 86 vibe" className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Our Story</div>
          <h2 className="mt-2 text-4xl sm:text-5xl font-black">Born to <span className="fire-text">Spark</span> Larkana</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">{settings.about_us}</p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[["🔥","Fresh Daily"],["⚡","Fast Delivery"],["🏆","#1 Taste"]].map(([e,t]) => (
              <div key={t} className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-2xl">{e}</div>
                <div className="mt-1 text-xs font-bold">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold">Loved In Larkana</div>
          <h2 className="mt-2 text-4xl sm:text-5xl font-black">What People <span className="fire-text">Say</span></h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.slice(0, 6).map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              {r.video_url && (
                <video src={r.video_url} controls playsInline className="w-full aspect-video object-cover bg-black" />
              )}
              <div className="p-6">
                <div className="flex gap-1 text-[var(--gold)] mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                {r.comment && <p className="text-sm text-foreground leading-relaxed">"{r.comment}"</p>}
                <div className="mt-4 text-xs font-bold text-muted-foreground">— {r.customer_name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl fire-gradient p-10 sm:p-16 text-center">
          <Flame className="absolute -top-6 -left-6 h-32 w-32 text-white/10" />
          <Flame className="absolute -bottom-6 -right-6 h-32 w-32 text-white/10" />
          <h2 className="text-4xl sm:text-5xl font-black text-white">Hungry? Let's Fire Up.</h2>
          <p className="mt-3 text-white/90">Order online or message us on WhatsApp. Delivery in Larkana city.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/menu" className="rounded-xl bg-black px-6 py-3.5 text-sm font-black uppercase text-white">Order Online</Link>
            <a href={waUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-6 py-3.5 text-sm font-black uppercase text-black">WhatsApp Us</a>
          </div>
        </div>
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
