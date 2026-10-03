import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { api, ApiError } from '../lib/api';
import { formatPKR } from '../lib/format';
import { Seo } from '../lib/Seo';

const PROVINCES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Jammu & Kashmir'];
const empty = { name: '', phone: '', email: '', address: '', city: '', province: '', postalCode: '' };

export default function Checkout() {
  const { items, quote, clear } = useCart();
  const { config } = useStore();
  const nav = useNavigate();
  const [c, setC] = useState(empty);
  const [notes, setNotes] = useState('');
  const [method, setMethod] = useState<'cod' | 'online'>('cod');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);
  const onlineOk = Boolean(config?.paymentMethods.online);

  if (!items.length) return <div className="mx-auto max-w-[1360px] px-5 py-28 md:px-12"><h1 className="h-section">Checkout</h1><p className="mt-4 text-[13px] text-steel">Your cart is empty.</p><Link to="/products" className="btn-primary mt-8">Browse products</Link></div>;

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setC((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErrs({}); setFormErr('');
    try {
      const r = await api.post<{ order: { orderNumber: string; total: number; paymentMethod: string }; payment?: { redirectUrl?: string } }>('/orders', { customer: c, items, paymentMethod: method, notes });
      clear();
      if (r.payment?.redirectUrl) { window.location.href = r.payment.redirectUrl; return; }
      nav(`/order-confirmation/${r.order.orderNumber}`, { state: { order: r.order } });
    } catch (err) {
      const a = err as ApiError;
      const flat: Record<string, string> = {};
      Object.entries(a.details || {}).forEach(([k, v]) => { flat[k.replace('customer.', '')] = String(v); });
      setErrs(flat); setFormErr(a.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setBusy(false); }
  };

  // plain function (not a component) so inputs keep focus between keystrokes
  const F = ({ k, label, type = 'text', auto, req = true }: { k: keyof typeof empty; label: string; type?: string; auto?: string; req?: boolean }) => (
    <div><label className="label" htmlFor={k}>{label}{!req && ' (optional)'}</label>
      <input id={k} name={k} type={type} autoComplete={auto} className="field" value={c[k]} onChange={set(k)} aria-invalid={Boolean(errs[k])} />
      {errs[k] && <p className="field-error">{errs[k]}</p>}</div>
  );

  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-24 pt-12 md:px-12 md:pt-16">
      <Seo title="Checkout" description="Complete your ANT order. Delivery across Pakistan." path="/checkout" />
      <p className="eyebrow">Pakistan delivery</p>
      <h1 className="h-section mt-3">Checkout</h1>
      {formErr && <p role="alert" className="mt-8 border border-red-700/60 bg-red-50 px-4 py-3 text-[13px] text-red-800" data-testid="form-error">{formErr}</p>}
      <form onSubmit={submit} noValidate className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          <fieldset className="space-y-4"><legend className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em]">Delivery details</legend>
            {F({ k: 'name', label: 'Full name', auto: 'name' })}<div className="grid gap-4 sm:grid-cols-2">{F({ k: 'phone', label: 'Phone', type: 'tel', auto: 'tel' })}{F({ k: 'email', label: 'Email', type: 'email', auto: 'email' })}</div>
            {F({ k: 'address', label: 'Address', auto: 'street-address' })}
            <div className="grid gap-4 sm:grid-cols-2">{F({ k: 'city', label: 'City', auto: 'address-level2' })}
              <div><label className="label" htmlFor="province">Province</label>
                <select id="province" className="field" value={c.province} onChange={set('province')} aria-invalid={Boolean(errs.province)}><option value="">Select province</option>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select>
                {errs.province && <p className="field-error">{errs.province}</p>}</div></div>
            <div className="sm:w-1/2">{F({ k: 'postalCode', label: 'Postal code', auto: 'postal-code', req: false })}</div>
            <div><label className="label" htmlFor="notes">Order notes (optional)</label><textarea id="notes" className="field min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} /></div>
          </fieldset>
          <fieldset><legend className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em]">Payment</legend>
            <label className={`mb-3 flex cursor-pointer items-start gap-3 border p-4 text-[13px] ${method === 'cod' ? 'border-ink' : 'border-line'}`}>
              <input type="radio" name="pay" checked={method === 'cod'} onChange={() => setMethod('cod')} className="mt-1" data-testid="pay-cod" />
              <span><strong className="block font-semibold">Cash on delivery</strong><span className="text-steel">Pay in cash when your order arrives.</span></span></label>
            <label className={`flex items-start gap-3 border p-4 text-[13px] ${method === 'online' ? 'border-ink' : 'border-line'} ${onlineOk ? 'cursor-pointer' : 'opacity-50'}`}>
              <input type="radio" name="pay" disabled={!onlineOk} checked={method === 'online'} onChange={() => setMethod('online')} className="mt-1" data-testid="pay-online" />
              <span><strong className="block font-semibold">Online payment</strong><span className="text-steel">{onlineOk ? 'You will be redirected to our payment partner.' : 'Not available yet.'}</span></span></label>
          </fieldset>
        </div>
        <aside className="h-fit border border-line bg-panel/40 p-7" aria-label="Order summary">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Your order</h2>
          <ul className="mt-5 space-y-3 text-[13px]">{quote?.lines.map((l) => <li key={l.productId} className="flex justify-between gap-4"><span>{l.name} × {l.quantity}</span><span className="tabular-nums">{formatPKR(l.lineTotal)}</span></li>)}</ul>
          <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[13px]">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{quote ? formatPKR(quote.subtotal) : '—'}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd className="tabular-nums">{quote ? formatPKR(quote.deliveryFee) : '—'}</dd></div>
            <div className="flex justify-between pt-2 text-[15px] font-semibold"><dt>Total</dt><dd className="tabular-nums" data-testid="checkout-total">{quote ? formatPKR(quote.total) : '—'}</dd></div></dl>
          <button type="submit" disabled={busy || !quote} className="btn-primary mt-6 w-full" data-testid="place-order">{busy ? 'Placing order…' : method === 'cod' ? 'Place order' : 'Continue to payment'}</button>
          <p className="mt-4 text-[11px] text-steel">Pakistan delivery only.</p>
        </aside>
      </form>
    </div>
  );
}
