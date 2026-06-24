import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../lib/cart-context";
import { Toaster } from "sonner";
import { WhatsAppFloat } from "../components/whatsapp-float";
import { registerPWA } from "../lib/pwa-register";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-black fire-text">404</h1>
        <h2 className="mt-4 text-xl font-bold">Looks like this dish is off the menu</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-lg fire-gradient px-5 py-2.5 text-sm font-bold text-white">Back to Kitchen 86</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head home.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-lg fire-gradient px-4 py-2 text-sm font-bold text-white">Try again</button>
          <a href="/" className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Kitchen 86 — Always Fresh, Taste The Best | Larkana" },
      { name: "description", content: "Larkana's hottest fast food spot. Signature Zinger 86, Cheezious Matka Fries & handcrafted burgers. Order online for fast delivery in Larkana." },
      { name: "theme-color", content: "#FF4500" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Kitchen 86" },
      { name: "mobile-web-app-capable", content: "yes" },
      { property: "og:title", content: "Kitchen 86 — Always Fresh, Taste The Best" },
      { property: "og:description", content: "Unique styled fried chicken, Matka Fries & burgers in Larkana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => { registerPWA(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
        <WhatsAppFloat />
        <Toaster theme="dark" position="top-center" richColors />
      </CartProvider>
    </QueryClientProvider>
  );
}
