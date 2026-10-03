import { ChevronDown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { api, ApiError } from '../lib/api';
import { formatPKR } from '../lib/format';
import { ORDER_STATUSES, Order, PAYMENT_STATUSES } from '../lib/types';
import { Card, Msg, PageTitle, StatusPill } from './ui';

export default function OrdersAdmin() {
  const [status, setStatus] = useState(''); const [page, setPage] = useState(1); const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState(''); const [info, setInfo] = useState('');
  const { data, loading, reload } = useAsync(() => api.get<{ orders: Order[]; pages: number; total: number }>(`/admin/orders?page=${page}${status ? `&status=${status}` : ''}`, true), [status, page]);

  const update = async (id: string, patch: { status?: string; paymentStatus?: string }) => {
    setErr(''); setInfo('');
    try { await api.patch(`/admin/orders/${id}`, patch, true); reload(); } catch (x) { setErr((x as ApiError).message); }
  };
  const remove = async (o: Order) => {
    if (!window.confirm(`Delete order ${o.orderNumber} permanently? This cannot be undone.`)) return;
    setErr(''); setInfo('');
    try { await api.del(`/admin/orders/${o.id}`, true); setOpen(null); setInfo(`Order ${o.orderNumber} deleted.`); reload(); } catch (x) { setErr((x as ApiError).message); }
  };
  const chip = (active: boolean) => `rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-violet-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`;

  return (
    <section aria-labelledby="oa">
      <PageTitle sub={data ? `${data.total} order${data.total === 1 ? '' : 's'}${status ? ` · ${status}` : ''}` : undefined}><span id="oa">Orders</span></PageTitle>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {['', ...ORDER_STATUSES].map((s) => <button key={s || 'all'} className={chip(status === s)} onClick={() => { setStatus(s); setPage(1); setOpen(null); }}>{s || 'All'}</button>)}
      </div>
      <div className="space-y-3">{err && <Msg>{err}</Msg>}{info && <Msg tone="ok">{info}</Msg>}</div>
      {loading && <p className="mt-4 text-sm text-slate-500">Loading…</p>}
      {data && !data.orders.length && <Card className="mt-4 text-center text-sm text-slate-500">No orders here yet.</Card>}
      <ul className="mt-4 space-y-3" data-testid="orders-list">
        {data?.orders.map((o) => (
          <li key={o.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" data-testid="order-row">
            <button className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 text-left text-sm transition-colors hover:bg-slate-50 md:grid-cols-[11rem_1fr_7rem_6.5rem_1.5rem]" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id}>
              <span className="font-semibold">{o.orderNumber}</span>
              <span className="hidden text-slate-600 md:block">{o.customer.name}<span className="ml-2 text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString('en-PK')}</span></span>
              <span className="tabular-nums font-medium md:text-right">{formatPKR(o.total)}</span>
              <span className="hidden md:block"><StatusPill value={o.status} /></span>
              <ChevronDown size={16} className={`hidden text-slate-400 transition-transform md:block ${open === o.id ? 'rotate-180' : ''}`} />
            </button>
            {open === o.id && (
              <div className="grid gap-8 border-t border-slate-100 bg-slate-50/50 px-5 py-6 text-sm md:grid-cols-3" data-testid="order-detail">
                <div><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</h3><p className="font-medium">{o.customer.name}</p><p>{o.customer.phone}</p><p>{o.customer.email}</p><p className="mt-2 text-slate-600">{o.customer.address}</p><p className="text-slate-600">{o.customer.city}, {o.customer.province} {o.customer.postalCode}</p>{o.notes && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">Note: {o.notes}</p>}</div>
                <div><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Items</h3>{o.items.map((i) => <p key={i.slug} className="flex justify-between gap-3 py-0.5"><span>{i.name} × {i.quantity}</span><span className="tabular-nums">{formatPKR(i.lineTotal)}</span></p>)}
                  <p className="mt-3 flex justify-between border-t border-slate-200 pt-2 text-slate-600"><span>Subtotal</span><span className="tabular-nums">{formatPKR(o.subtotal)}</span></p>
                  <p className="flex justify-between text-slate-600"><span>Delivery</span><span className="tabular-nums">{formatPKR(o.deliveryFee)}</span></p><p className="flex justify-between font-semibold"><span>Total</span><span className="tabular-nums">{formatPKR(o.total)}</span></p></div>
                <div className="space-y-3"><p className="text-slate-600">{o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment'} <StatusPill value={o.paymentStatus} /></p>
                  <label className="block"><span className="label">Order status</span><select className="field" value={o.status} onChange={(e) => update(o.id, { status: e.target.value })} data-testid="order-status-select">{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
                  <label className="block"><span className="label">Payment status</span><select className="field" value={o.paymentStatus} onChange={(e) => update(o.id, { paymentStatus: e.target.value })}>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
                  <button className="btn btn-rose w-full" onClick={() => remove(o)} data-testid="delete-order"><Trash2 size={15} />Delete order</button></div>
              </div>)}
          </li>))}
      </ul>
      {data && data.pages > 1 && <div className="mt-6 flex items-center gap-4 text-sm text-slate-600"><button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>Page {page} of {data.pages}<button className="btn btn-outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button></div>}
    </section>
  );
}
