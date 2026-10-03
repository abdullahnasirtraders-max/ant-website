import { Megaphone, Package, Settings as Cog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { formatPKR } from '../lib/format';
import type { Order, Product, Settings } from '../lib/types';
import { Card, PageTitle, StatusPill } from './ui';

export default function Overview({ email }: { email: string }) {
  const { data, loading, error } = useAsync(async () => {
    const [recent, pending, products, settings] = await Promise.all([
      api.get<{ orders: Order[]; total: number }>('/admin/orders?page=1', true),
      api.get<{ total: number }>('/admin/orders?status=Pending', true),
      api.get<{ products: Product[] }>('/admin/products', true),
      api.get<{ settings: Settings }>('/admin/settings', true),
    ]);
    return { recent: recent.orders.slice(0, 5), total: recent.total, pending: pending.total, products: products.products, fee: settings.settings.deliveryFee };
  }, []);

  const stats = data ? [
    ['Total orders', String(data.total), 'bg-violet-50 text-violet-700', '/admin/orders'],
    ['Pending orders', String(data.pending), 'bg-amber-50 text-amber-700', '/admin/orders'],
    ['Active products', `${data.products.filter((p) => p.isActive).length} / ${data.products.length}`, 'bg-emerald-50 text-emerald-700', '/admin/products'],
    ['Delivery fee', formatPKR(data.fee), 'bg-sky-50 text-sky-700', '/admin/settings'],
  ] as const : [];

  return (
    <section data-testid="admin-overview">
      <PageTitle sub="Here is what is happening in your store today.">Hi, {email.split('@')[0]} 👋</PageTitle>
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label, value, tint, to]) => (
              <Link key={label} to={to} className={`rounded-2xl p-5 transition-transform hover:-translate-y-0.5 ${tint}`}><p className="text-xs font-medium opacity-80">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p></Link>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card>
              <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Recent orders</h2><Link to="/admin/orders" className="btn btn-sky !px-3 !py-1.5 !text-xs">View all</Link></div>
              {!data.recent.length && <p className="py-6 text-sm text-slate-500">No orders yet. They will show up here.</p>}
              <ul className="divide-y divide-slate-100">
                {data.recent.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div><p className="font-medium">{o.orderNumber}</p><p className="text-xs text-slate-500">{o.customer.name} · {new Date(o.createdAt).toLocaleDateString('en-PK')}</p></div>
                    <div className="flex items-center gap-3"><span className="tabular-nums">{formatPKR(o.total)}</span><StatusPill value={o.status} /></div>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Quick actions</h2>
              <div className="flex flex-col gap-3">
                <Link to="/admin/products" className="btn btn-mint justify-start"><Package size={16} />Add a product</Link>
                <Link to="/admin/announcements" className="btn btn-amber justify-start"><Megaphone size={16} />Post an announcement</Link>
                <Link to="/admin/settings" className="btn btn-sky justify-start"><Cog size={16} />Delivery &amp; contact settings</Link>
              </div>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
