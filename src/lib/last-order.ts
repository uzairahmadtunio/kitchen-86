import { useEffect, useState } from "react";

export type LastOrder = { order_number: string; phone: string; placed_at: number };

const KEY = "k86_last_order_v1";

export function saveLastOrder(o: LastOrder) {
  try { localStorage.setItem(KEY, JSON.stringify(o)); } catch {}
  window.dispatchEvent(new Event("k86:last-order"));
}
export function clearLastOrder() {
  try { localStorage.removeItem(KEY); } catch {}
  window.dispatchEvent(new Event("k86:last-order"));
}
export function getLastOrder(): LastOrder | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as LastOrder;
    // expire after 3 days
    if (Date.now() - o.placed_at > 1000 * 60 * 60 * 72) { localStorage.removeItem(KEY); return null; }
    return o;
  } catch { return null; }
}

export function useLastOrder() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  useEffect(() => {
    const sync = () => setOrder(getLastOrder());
    sync();
    window.addEventListener("k86:last-order", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("k86:last-order", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return order;
}
