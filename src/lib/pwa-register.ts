// Guarded service worker registration. Never runs in dev / Lovable preview / iframe.
// Only registers on the published production site.

const SW_URL = "/sw.js";

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (!("serviceWorker" in navigator)) return true;
  if (!import.meta.env.PROD) return true;

  try {
    if (window.self !== window.top) return true; // inside iframe (Lovable preview)
  } catch {
    return true;
  }

  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }

  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;

  return false;
}

async function unregisterMatching() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => r.active?.scriptURL?.endsWith(SW_URL) || r.installing?.scriptURL?.endsWith(SW_URL) || r.waiting?.scriptURL?.endsWith(SW_URL))
        .map((r) => r.unregister()),
    );
  } catch {
    // ignore
  }
}

export function registerPWA() {
  if (typeof window === "undefined") return;
  if (shouldSkip()) {
    void unregisterMatching();
    return;
  }
  window.addEventListener("load", () => {
    import("virtual:pwa-register")
      .then(({ registerSW }) => {
        registerSW({ immediate: true });
      })
      .catch(() => {
        // ignore — registration is best-effort
      });
  });
}
