import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import { MAX_QTY, Quote } from '../lib/types';

interface Item { productId: string; quantity: number }
interface CartCtx {
  items: Item[]; count: number; quote: Quote | null; quoting: boolean;
  add: (id: string, qty?: number) => void; setQty: (id: string, qty: number) => void; remove: (id: string) => void; clear: () => void;
}
const KEY = 'ant.cart.v1';
const Ctx = createContext<CartCtx>(null as unknown as CartCtx);
export const useCart = () => useContext(Ctx);

const load = (): Item[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((i) => typeof i?.productId === 'string' && Number.isInteger(i?.quantity)).map((i) => ({ productId: i.productId, quantity: Math.min(MAX_QTY, Math.max(1, i.quantity)) })) : [];
  } catch { return []; }
};
const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n) || 1));

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(load);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const seq = useRef(0);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable */ } }, [items]);

  // The server prices everything: the browser only holds ids + quantities.
  useEffect(() => {
    if (!items.length) { setQuote(null); setQuoting(false); return; }
    const n = ++seq.current;
    setQuoting(true);
    const t = setTimeout(() => {
      api.post<Quote>('/cart/quote', { items }).then((q) => {
        if (n !== seq.current) return;
        setQuote(q); setQuoting(false);
        if (q.unavailable.length) setItems((cur) => cur.filter((i) => !q.unavailable.includes(i.productId)));
      }).catch(() => n === seq.current && setQuoting(false));
    }, 200);
    return () => clearTimeout(t);
  }, [items]);

  const add = useCallback((id: string, qty = 1) => setItems((cur) => {
    const f = cur.find((i) => i.productId === id);
    return f ? cur.map((i) => (i.productId === id ? { ...i, quantity: clamp(i.quantity + qty) } : i)) : [...cur, { productId: id, quantity: clamp(qty) }];
  }), []);
  const setQty = useCallback((id: string, qty: number) => setItems((cur) => cur.map((i) => (i.productId === id ? { ...i, quantity: clamp(qty) } : i))), []);
  const remove = useCallback((id: string) => setItems((cur) => cur.filter((i) => i.productId !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, count: items.reduce((s, i) => s + i.quantity, 0), quote, quoting, add, setQty, remove, clear }), [items, quote, quoting, add, setQty, remove, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
