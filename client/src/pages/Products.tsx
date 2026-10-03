import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Eyebrow } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { brandOf, brandsOf, haystack } from '../lib/brand';
import { Seo } from '../lib/Seo';
import { CATEGORIES, Product } from '../lib/types';

export default function Products() {
  const { data, loading, error, reload } = useAsync(() => api.get<{ products: Product[] }>('/products'), []);
  const [sp, setSp] = useSearchParams();
  const [sort, setSort] = useState('default');
  const search = useRef<HTMLInputElement>(null);
  const cat = sp.get('category') || '', brand = sp.get('brand') || '', model = (sp.get('model') || '').toLowerCase(), q = sp.get('q') || '';
  const setParam = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); n.delete('search'); setSp(n, { replace: true }); };
  useEffect(() => { if (sp.get('search')) search.current?.focus(); }, [sp]);

  const all = data?.products ?? [];
  const brands = useMemo(() => brandsOf(all), [all]);
  const list = useMemo(() => {
    let l = all.filter((p) => (!cat || p.category === cat) && (!brand || brandOf(p).toLowerCase() === brand.toLowerCase()) && (!q || haystack(p).includes(q.toLowerCase())) && (!model || haystack(p).includes(model)));
    if (sort === 'asc') l = [...l].sort((a, b) => a.price - b.price);
    if (sort === 'desc') l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [all, cat, brand, q, model, sort]);
  const filtered = Boolean(cat || brand || q || model);

  const tab = (active: boolean) => `border-b pb-1.5 text-[10.5px] font-medium uppercase tracking-[0.16em] transition-colors ${active ? 'border-ink' : 'border-transparent text-steel hover:text-ink'}`;
  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-24 pt-12 md:px-12 md:pt-16">
      <Seo title="Air filters" description="Browse ANT air filters for vehicles, commercial transport and industrial applications. Delivery across Pakistan." path="/products" />
      <Eyebrow>Shop</Eyebrow>
      <h1 className="h-section mt-3">All products</h1>
      <div id="categories" className="mt-10 scroll-mt-24 border-y border-line py-5">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
          <div className="flex flex-wrap gap-x-7 gap-y-3" role="group" aria-label="Filter by application">
            {['', ...CATEGORIES].map((c) => <button key={c || 'all'} onClick={() => setParam('category', c)} aria-pressed={cat === c} className={tab(cat === c)}>{c || 'All'}</button>)}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative"><span className="sr-only">Search products</span><Search size={14} strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input ref={search} className="field !w-56 !py-2.5 !pl-9" placeholder="Name or part number" value={q} onChange={(e) => setParam('q', e.target.value)} data-testid="shop-search" /></label>
            {brands.length > 0 && <label><span className="sr-only">Brand</span><select className="field !w-auto !py-2.5" value={brand} onChange={(e) => setParam('brand', e.target.value)}><option value="">All brands</option>{brands.map((b) => <option key={b}>{b}</option>)}</select></label>}
            <label><span className="sr-only">Sort</span><select className="field !w-auto !py-2.5" value={sort} onChange={(e) => setSort(e.target.value)}><option value="default">Featured</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option></select></label>
          </div>
        </div>
        {filtered && <p className="mt-4 text-[11px] text-steel">{list.length} result{list.length === 1 ? '' : 's'}{model && ` for model “${sp.get('model')}”`} · <button className="underline" onClick={() => setSp({}, { replace: true })}>Clear filters</button></p>}
      </div>
      {loading && <p className="py-20 text-[13px] text-steel">Loading products…</p>}
      {error && <p className="py-20 text-[13px]">Could not load products. <button onClick={reload} className="underline">Try again</button></p>}
      {!loading && !error && !list.length && <p className="py-20 text-[13px] text-steel">No products match. Try clearing a filter or <a href="/contact" className="underline">ask us</a>.</p>}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" data-testid="product-grid">{list.map((p) => <ProductCard key={p.id} product={p} showAdd />)}</div>
    </div>
  );
}
