import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft, Flame } from "lucide-react";
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
  { icon: "🔥", label: "Always Fresh" },
  { icon: "🌙", label: "Open Till 6AM" },
  { icon: "⭐", label: "Larkana's Finest" },
  { icon: "✅", label: "Halal Certified" },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function AboutPage() {
  const { data: page } = useSuspenseQuery(pageQO);
  const { data: settings } = useSuspenseQuery(settingsQO);
  const { data: team } = useSuspenseQuery(teamQO);

  const story = page?.content || settings.about_us || "";

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-[1000px] px-6 py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-[var(--primary)] mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        {/* HERO */}
        <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] border-l-4 border-l-[#FF4500] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl fire-gradient">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white">About Kitchen 86</h1>
              <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">Our Story, Our Mission, Our Team</p>
              <span className="mt-3 inline-flex items-center rounded-full bg-[#FF4500]/15 border border-[#FF4500]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF4500]">
                Est. 2024 • Larkana, Sindh
              </span>
            </div>
          </div>
        </div>

        {/* STORY */}
        <section className="mt-6 rounded-xl bg-[#141414] border border-[#2A2A2A] border-l-[3px] border-l-[#FF4500] p-6 sm:p-8 relative">
          <header className="flex items-center gap-3 mb-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FF4500] text-white text-sm">🔥</span>
            <h2 className="text-lg font-bold text-white">Our Story</h2>
          </header>
          <div className="relative pl-6">
            <span aria-hidden className="absolute -left-1 -top-2 text-5xl leading-none text-[#FF4500]/40 font-serif">“</span>
            <div className="text-[15px] leading-[1.8] text-[#AAAAAA] whitespace-pre-line">{story}</div>
          </div>
        </section>

        {/* STATS */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 text-center hover:border-[#FF4500] transition-colors">
              <div className="text-3xl" aria-hidden>{s.icon}</div>
              <div className="mt-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TEAM */}
        <section className="mt-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Meet Our Team <span aria-hidden>👨‍🍳</span></h2>
            <p className="mt-1.5 text-sm text-muted-foreground">The people behind every delicious meal</p>
          </div>
          {team.length === 0 ? (
            <div className="mt-8 text-center text-sm text-muted-foreground">Team members coming soon.</div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m: TeamMember) => (
                <div key={m.id} className="rounded-2xl bg-[#141414] border border-[#2A2A2A] p-6 text-center hover:-translate-y-1 hover:border-[#FF4500] hover:shadow-[0_8px_30px_-10px_rgba(255,69,0,0.4)] transition-all">
                  <div className="mx-auto h-[100px] w-[100px] rounded-full overflow-hidden border-2 border-[#FF4500] grid place-items-center bg-[#1A1A1A]">
                    {m.image_url ? (
                      <img src={m.image_url} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full w-full grid place-items-center fire-gradient text-white text-xl font-black">{initials(m.name)}</div>
                    )}
                  </div>
                  <div className="mt-4 text-base font-bold text-white">{m.name}</div>
                  <div className="mt-0.5 text-[13px] text-[#FF4500] font-semibold">{m.role}</div>
                  <div className="mt-3 border-t border-[#2A2A2A]" />
                  {m.bio && <p className="mt-3 text-[13px] text-[#AAAAAA] leading-relaxed line-clamp-3">{m.bio}</p>}
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
