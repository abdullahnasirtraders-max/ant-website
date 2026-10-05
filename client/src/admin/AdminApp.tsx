import { LayoutDashboard, LogOut, Megaphone, Menu, Package, Settings as Cog, ShoppingBag, SquareArrowOutUpRight, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { AnnouncementsAdmin, SettingsAdmin } from './MiscAdmin';
import OrdersAdmin from './OrdersAdmin';
import Overview from './Overview';
import ProductsAdmin from './ProductsAdmin';
import { Field, Msg } from './ui';

interface Me { user: { email: string }; uploadsEnabled: boolean }

const links = [
  ['/admin', 'Overview', LayoutDashboard, 'bg-violet-100 text-violet-600', true],
  ['/admin/orders', 'Orders', ShoppingBag, 'bg-amber-100 text-amber-600', false],
  ['/admin/products', 'Products', Package, 'bg-emerald-100 text-emerald-600', false],
  ['/admin/announcements', 'Announcements', Megaphone, 'bg-rose-100 text-rose-600', false],
  ['/admin/settings', 'Settings', Cog, 'bg-sky-100 text-sky-600', false],
] as const;

function Login({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api.post('/auth/login', { email, password }, true); onDone(); navigate('/admin', { replace: true }); } catch (x) { setErr((x as ApiError).message); } finally { setBusy(false); }
  };
  return (
    <div className="admin grid min-h-screen place-items-center bg-white px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-violet-100" data-testid="admin-login">
        <div><p className="text-4xl font-semibold tracking-tight">ANT</p><h1 className="mt-1 text-sm text-slate-500">Welcome back 👋 Sign in to your dashboard</h1></div>
        {err && <Msg>{err}</Msg>}
        <Field label="Email"><input className="field" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="admin-email" /></Field>
        <Field label="Password"><input className="field" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="admin-password" /></Field>
        <button className="btn btn-primary w-full" disabled={busy} data-testid="admin-submit">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const load = () => api.get<Me>('/auth/me', true).then(setMe).catch(() => setMe(null));
  useEffect(() => {
    document.title = 'Admin | ANT';
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.appendChild(m);
    load();
    return () => m.remove();
  }, []);

  if (me === undefined) return <p className="admin p-10 text-sm text-slate-500">Loading…</p>;
  if (!me) return <Login onDone={load} />;

  const item = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'}`;
  const signOut = async () => { await api.post('/auth/logout', undefined, true); setMe(null); };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-3 pb-6 pt-1"><span className="text-2xl font-semibold tracking-tight">ANT</span><span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">ADMIN</span></div>
      <nav className="flex flex-col gap-1" aria-label="Admin" onClick={() => setOpen(false)}>
        {links.map(([to, label, Icon, tint, end]) => (
          <NavLink key={to} to={to} end={end} className={item}><span className={`grid h-8 w-8 place-items-center rounded-lg ${tint}`}><Icon size={16} strokeWidth={2} /></span>{label}</NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-1 border-t border-slate-100 pt-4">
        <a href="/" target="_blank" rel="noreferrer" className={item({ isActive: false })}><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500"><SquareArrowOutUpRight size={15} /></span>View store</a>
        <button onClick={signOut} className={`${item({ isActive: false })} w-full`} data-testid="admin-logout"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500"><LogOut size={15} /></span>Sign out</button>
        <p className="truncate px-3 pt-2 text-xs text-slate-400">{me.user.email}</p>
      </div>
    </div>
  );

  return (
    <div className="admin min-h-screen bg-white text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-4 md:block">{sidebar}</aside>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <span className="text-xl font-semibold tracking-tight">ANT <span className="rounded-full bg-violet-100 px-2 py-0.5 align-middle text-[10px] font-semibold text-violet-700">ADMIN</span></span>
        <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden"><div className="absolute inset-0 bg-slate-900/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white p-4 shadow-xl"><button className="absolute right-4 top-4" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>{sidebar}</aside>
        </div>
      )}
      <main className="px-4 py-8 md:ml-64 md:px-10 md:py-10">
        <div className="mx-auto max-w-[1100px]">
          <Routes>
            <Route index element={<Overview email={me.user.email} />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="products" element={<ProductsAdmin uploadsEnabled={me.uploadsEnabled} />} />
            <Route path="announcements" element={<AnnouncementsAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}