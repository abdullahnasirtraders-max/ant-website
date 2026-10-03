import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { waLink } from '../lib/format';
import { WhatsAppIcon } from './ui';

const nav = [['Home', '/'], ['Products', '/products'], ['About', '/about'], ['Contact', '/contact']] as const;
const navCls = 'text-[10.5px] font-medium uppercase tracking-[0.16em] transition-colors hover:text-steel';

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="block leading-none" aria-label="ANT — Abdullah Nasir Traders, home">
      <span className="block text-[26px] font-semibold tracking-tight">ANT</span>
      <span className={`mt-1 block text-[8px] font-medium uppercase tracking-[0.2em] ${light ? 'text-paper/70' : 'text-ink/80'}`}>Abdullah Nasir Traders</span>
    </Link>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  const { count } = useCart();
  const { settings, announcements } = useStore();
  const [open, setOpen] = useState(false);
  const ann = announcements[0];
  const inquire = settings.whatsapp ? { href: waLink(settings.whatsapp, 'Hello ANT, I would like to inquire about a filter.'), ext: true } : { href: '/contact', ext: false };

  useEffect(() => {
    setOpen(false);
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 60);
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  const inquireEl = inquire.ext
    ? <a href={inquire.href} target="_blank" rel="noreferrer" className={`${navCls} hidden items-center gap-2 md:flex`}><WhatsAppIcon />Inquire</a>
    : <Link to={inquire.href} className={`${navCls} hidden items-center gap-2 md:flex`}><WhatsAppIcon />Inquire</Link>;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Skip to content</a>
      {ann && (
        <div className="bg-dark px-4 py-2 text-center text-[11px] tracking-wide text-paper" data-testid="announcement">
          {ann.text}{' '}{ann.linkUrl && <a href={ann.linkUrl} className="font-semibold underline underline-offset-2">{ann.linkLabel || 'Learn more'}</a>}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="mx-auto grid h-[72px] max-w-[1360px] grid-cols-[auto_1fr] items-center gap-6 px-5 md:h-20 md:grid-cols-[1fr_auto_1fr] md:px-12">
          <Logo />
          <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
            {nav.map(([l, to]) => (
              <NavLink key={l} to={to} end={to === '/'} className={({ isActive }) => `${navCls} border-b pb-1 ${isActive && !to.includes('#') ? 'border-ink' : 'border-transparent'}`}>{l}</NavLink>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-5 md:gap-6">
            <Link to="/products?search=1" aria-label="Search products"><Search size={17} strokeWidth={1.5} /></Link>
            <Link to="/cart" className="relative" aria-label={`Cart, ${count} items`} data-testid="cart-link">
              <ShoppingBag size={17} strokeWidth={1.5} />
              <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-medium text-paper tabular-nums" data-testid="cart-count">{count}</span>
            </Link>
            {inquireEl}
            <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>{open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}</button>
          </div>
        </div>
      </header>
      {open && (
        <nav className="fixed inset-x-0 bottom-0 top-[72px] z-30 flex flex-col gap-1 bg-paper px-5 py-8 md:hidden" aria-label="Mobile">
          {nav.map(([l, to]) => <Link key={l} to={to} className="border-b border-line py-4 text-sm font-medium uppercase tracking-[0.16em]">{l}</Link>)}
          <Link to={inquire.href} className="btn-primary mt-6"><WhatsAppIcon />Inquire</Link>
        </nav>
      )}
      <main id="main"><Outlet /></main>
      <footer className="bg-dark text-paper">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-12">
          <Logo light />
          <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer">{nav.map(([l, to]) => <Link key={l} to={to} className="text-[11px] tracking-wide text-paper/80 hover:text-paper">{l}</Link>)}</nav>
          <div className="flex items-center gap-5 text-paper/80">
            {settings.phone && <a href={`tel:${settings.phone}`} className="text-[11px] tracking-wide hover:text-paper">{settings.phone}</a>}
            <Link to="/cart" aria-label="Cart"><ShoppingBag size={16} strokeWidth={1.5} /></Link>
            <Link to={inquire.href} className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.16em] hover:text-paper"><WhatsAppIcon size={15} />Inquire</Link>
          </div>
        </div>
        <div className="border-t border-paper/10"><div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-2 px-5 py-5 text-[12px] text-paper/50 md:flex-row md:px-12">
          <p>© {new Date().getFullYear()} Abdullah Nasir Traders. All rights reserved. <span className='text-white'> Developed by</span> <a className='underline text-white' href="https://senibytesolutions.com" target="_blank" rel="noopener noreferrer">SeniByte Solutions</a></p><p>Quality Filtration. Lasting Performance.</p></div></div>
      </footer>
    </>
  );
}
