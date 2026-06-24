import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string; // composite key (menu item id + variant signature)
  itemId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  notes?: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number; id?: string }) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

const STORAGE_KEY = "k86_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  const value = useMemo<CartCtx>(() => ({
    items,
    add: (item) => {
      const id = item.id ?? `${item.itemId}`;
      setItems((prev) => {
        const existing = prev.find((p) => p.id === id);
        if (existing) {
          return prev.map((p) => p.id === id ? { ...p, quantity: p.quantity + (item.quantity ?? 1) } : p);
        }
        return [...prev, { ...item, id, quantity: item.quantity ?? 1 }];
      });
    },
    remove: (id) => setItems((p) => p.filter((i) => i.id !== id)),
    update: (id, qty) => setItems((p) => qty <= 0 ? p.filter((i) => i.id !== id) : p.map((i) => i.id === id ? { ...i, quantity: qty } : i)),
    clear: () => setItems([]),
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
    count: items.reduce((s, i) => s + i.quantity, 0),
  }), [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
