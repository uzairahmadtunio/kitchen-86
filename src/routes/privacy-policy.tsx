import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchPage, fetchSettings } from "@/lib/site-data";

const pageQO = queryOptions({ queryKey: ["page", "privacy-policy"], queryFn: () => fetchPage("privacy-policy") });
const settingsQO = queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — Kitchen 86" },
    { name: "description", content: "How Kitchen 86 collects, uses, and protects your personal information." },
    { property: "og:title", content: "Privacy Policy — Kitchen 86" },
    { property: "og:description", content: "How Kitchen 86 collects, uses, and protects your personal information." },
  ] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(pageQO);
    context.queryClient.ensureQueryData(settingsQO);
  },
  errorComponent: ({ error }) => <div className="p-10 text-center">{(error as any)?.message ?? "Error"}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Page not found</div>,
  component: PrivacyPage,
});

function PrivacyPage() {
  const { data: page } = useSuspenseQuery(pageQO);
  const { data: settings } = useSuspenseQuery(settingsQO);
  const updated = page?.updated_at ? new Date(page.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
        <h1 className="text-4xl sm:text-5xl font-black"><span className="fire-text">{page?.title ?? "Privacy Policy"}</span></h1>
        {updated && <div className="mt-2 text-xs text-muted-foreground">Last updated: {updated}</div>}
        <article className="prose-page mt-8">
          {(page?.content ?? "").split(/\n\n+/).map((para, i) => {
            const t = para.trim();
            if (!t) return null;
            const isHeading = /^\d+\.\s/.test(t) && t.length < 80;
            if (isHeading) return <h2 key={i} className="mt-8 mb-2 text-xl font-black text-[var(--gold)]">{t}</h2>;
            return <p key={i} className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line mt-4">{t}</p>;
          })}
        </article>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
