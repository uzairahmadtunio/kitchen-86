import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft, Flame, Moon, Star, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchPage, fetchSettings, fetchTeam, type TeamMember } from "@/lib/site-data";

const pageQO = queryOptions({ queryKey: ["page", "about-us"], queryFn: () => fetchPage("about-us") });
const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });
const teamQO = queryOptions({ queryKey: ["team"], queryFn: fetchTeam });

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Us — Kitchen 86" },
    { name: "description", content: "Meet the team behind Kitchen 86 — Larkana's late-night flavour destination." },
    { property: "og:title", content: "About Kitchen 86" },
    { property: "og:description", content: "Always fresh. Always fire. Open till 6AM in Larkana." },
  ] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(pageQO);
    context.queryClient.ensureQueryData(settingsQO);
    context.queryClient.ensureQueryData(teamQO);
  },
  errorComponent: ({ error }) => <div className="p-10 text-center">{(error as any)?.message ?? "Error"}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Page not found</div>,
  component: AboutPage,
});

const STATS = [
  { icon: Flame, label: "Always Fresh" },
  { icon: Moon, label: "Open Till 6AM" },
  { icon: Star, label: "Larkana's Finest" },
  { icon: ShieldCheck, label: "Halal Certified" },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function AboutPage() {
  const { data: page } = useSuspenseQuery(pageQO);
  const { data: settings } = useSuspenseQuery(settingsQO);
  const { data: team } = useSuspenseQuery(teamQO);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        {/* Story section */}
        <section className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          <div className="relative grid place-items-center aspect-square rounded-3xl bg-[#141414] border border-border overflow-hidden">
            <div className="absolute inset-0 fire-gradient opacity-10" />
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(255,69,0,0.35)]" />
            <div className="relative grid h-32 w-32 place-items-center rounded-2xl fire-gradient glow-orange">
              <Flame className="h-14 w-14 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black"><span className="fire-text">{page?.title ?? "About Kitchen 86"}</span></h1>
            <div className="mt-5 space-y-4 text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line">
              {page?.content ?? settings.about_us ?? ""}
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-[#141414] px-3 py-3 text-center">
                  <s.icon className="h-5 w-5 mx-auto text-[var(--gold)]" />
                  <div className="mt-1.5 text-[11px] font-black uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team section */}
        <section className="mt-16">
          <h2 className="text-3xl sm:text-4xl font-black text-center">Meet Our Team <span className="ml-2">👨‍🍳</span></h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">The passionate people behind every delicious meal</p>

          {team.length === 0 ? (
            <div className="mt-10 text-center text-muted-foreground text-sm">Team members coming soon.</div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m: TeamMember) => (
                <div key={m.id} className="rounded-2xl border border-border bg-[#141414] p-6 text-center hover:border-primary transition">
                  <div className="mx-auto h-[120px] w-[120px] rounded-full border-2 border-[var(--primary)] overflow-hidden grid place-items-center bg-[var(--secondary-bg)]">
                    {m.image_url ? (
                      <img src={m.image_url} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full w-full grid place-items-center fire-gradient text-white text-2xl font-black">{initials(m.name)}</div>
                    )}
                  </div>
                  <div className="mt-4 text-lg font-black">{m.name}</div>
                  <div className="mt-0.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">{m.role}</div>
                  {m.bio && <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{m.bio}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
