import { Minus, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductImage } from '../components/ProductImage';
import { Eyebrow } from '../components/ui';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../lib/format';
import { Seo } from '../lib/Seo';
import { MAX_QTY } from '../lib/types';

export default function Cart() {
  const { items, quote, quoting, setQty, remove } = useCart();
  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-24 pt-12 md:px-12 md:pt-16">
      <Seo title="Cart" description="Review your ANT cart." path="/cart" />
      <Eyebrow>Your selection</Eyebrow>
      <h1 className="h-section mt-3">Cart</h1>
      {!items.length ? (
        <div className="mt-12 border-t border-line pt-10"><p className="text-[13px] text-steel">Your cart is empty.</p><Link to="/products" className="btn-primary mt-6">Browse products</Link></div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.7fr_1fr]">
          <ul className="border-t border-line" data-testid="cart-lines">
            {quote?.lines.map((l) => (
              <li key={l.productId} className="grid grid-cols-[96px_1fr_auto] gap-5 border-b border-line py-6 md:grid-cols-[130px_1fr_auto]" data-testid="cart-line">
                <Link to={`/products/${l.slug}`} className="border border-line"><ProductImage src={l.image} alt={l.name} className="aspect-[4/3]" width={300} /></Link>
                <div>
                  <Link to={`/products/${l.slug}`} className="text-[11.5px] font-semibold uppercase tracking-[0.07em] hover:text-steel">{l.name}</Link>
                  <p className="mt-1.5 text-[12px] tabular-nums text-steel">{formatPKR(l.unitPrice)}</p>
                  <div className="mt-4 inline-flex items-center border border-line">
                    <button className="p-2.5 hover:bg-ink hover:text-paper" onClick={() => setQty(l.productId, l.quantity - 1)} aria-label={`Decrease ${l.name}`} data-testid="qty-dec"><Minus size={13} /></button>
                    <span className="w-9 text-center text-[12.5px] font-medium tabular-nums" data-testid="qty-value">{l.quantity}</span>
                    <button className="p-2.5 hover:bg-ink hover:text-paper disabled:opacity-30" disabled={l.quantity >= MAX_QTY} onClick={() => setQty(l.productId, l.quantity + 1)} aria-label={`Increase ${l.name}`} data-testid="qty-inc"><Plus size={13} /></button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => remove(l.productId)} aria-label={`Remove ${l.name}`} className="p-1 text-steel hover:text-ink" data-testid="remove-line"><X size={16} strokeWidth={1.5} /></button>
                  <p className="text-[13px] font-medium tabular-nums">{formatPKR(l.lineTotal)}</p>
                </div>
              </li>
            ))}
            {!quote && <li className="py-8 text-[13px] text-steel">Loading your cart…</li>}
          </ul>
          <aside className="h-fit border border-line bg-panel/40 p-7" aria-label="Order summary">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Summary</h2>
            <dl className={`mt-6 space-y-3.5 text-[13px] ${quoting ? 'opacity-50' : ''}`}>
              <div className="flex justify-between"><dt className="text-steel">Subtotal</dt><dd className="tabular-nums" data-testid="subtotal">{quote ? formatPKR(quote.subtotal) : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-steel">Delivery</dt><dd className="tabular-nums" data-testid="delivery">{quote ? formatPKR(quote.deliveryFee) : '—'}</dd></div>
              <div className="flex justify-between border-t border-line pt-4 text-[15px] font-semibold"><dt>Total</dt><dd className="tabular-nums" data-testid="total">{quote ? formatPKR(quote.total) : '—'}</dd></div>
            </dl>
            <Link to="/checkout" className={`btn-primary mt-7 w-full ${!quote ? 'pointer-events-none opacity-40' : ''}`} data-testid="to-checkout">Checkout</Link>
            <p className="mt-4 text-[11px] leading-relaxed text-steel">Prices and delivery are confirmed by our server at checkout. Pakistan delivery only.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
