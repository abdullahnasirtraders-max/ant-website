import { Minus, Plus, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { Eyebrow } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { brandOf } from '../lib/brand';
import { formatPKR } from '../lib/format';
import { Seo } from '../lib/Seo';
import { MAX_QTY, Product } from '../lib/types';

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const { settings } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { data, loading, error } = useAsync(() => api.get<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug)}`), [slug]);
  const p = data?.product;

  const jsonLd = useMemo(() => p && ({
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.shortDescription || p.description,
    sku: p.sku || undefined, image: p.image.url ? [p.image.url] : undefined, brand: { '@type': 'Brand', name: brandOf(p) || 'ANT' },
    offers: { '@type': 'Offer', priceCurrency: 'PKR', price: p.price, availability: 'https://schema.org/InStock', url: window.location.href },
  }), [p]);

  if (loading) return <p className="px-5 py-32 text-[13px] text-steel md:px-12">Loading…</p>;
  if (error || !p) return <div className="mx-auto max-w-[1360px] px-5 py-28 md:px-12"><h1 className="h-section">Product not found</h1><p className="mt-4 text-[13px] text-steel">{error || 'This product is unavailable.'}</p><Link to="/products" className="btn-primary mt-8">Back to products</Link></div>;

  const addNow = () => { add(p.id, qty); setAdded(true); setTimeout(() => setAdded(false), 1800); };
  const brand = brandOf(p);
  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-24 pt-8 md:px-12 md:pt-10">
      <Seo title={p.name} description={p.shortDescription || p.description.slice(0, 155) || `${p.name} from ANT.`} image={p.image.url} jsonLd={jsonLd || undefined} />
      <nav className="mb-8 text-[11px] text-steel" aria-label="Breadcrumb"><Link to="/products" className="hover:text-ink">Products</Link> <span className="mx-1">/</span> <span className="text-ink">{p.name}</span></nav>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="border border-line"><ProductImage src={p.image.url} alt={p.name} className="aspect-[5/4]" priority width={1200} /></div>
        <div>
          <Eyebrow>{brand ? `${brand} · ` : ''}{p.category}{p.sku && ` · ${p.sku}`}</Eyebrow>
          <h1 className="mt-3 text-[clamp(1.6rem,2.8vw,2.3rem)] font-semibold uppercase leading-[1.05] tracking-[-0.005em]" data-testid="pd-name">{p.name}</h1>
          <p className="mt-5 text-xl font-medium tabular-nums" data-testid="pd-price">{formatPKR(p.price)}</p>
          {p.description && <p className="mt-6 max-w-prose whitespace-pre-line text-[13px] leading-[1.8] text-ink/75">{p.description}</p>}
          {p.specifications.length > 0 && (
            <dl className="mt-8 border-t border-line" aria-label="Specifications">
              {p.specifications.map((s) => <div key={s.label} className="grid grid-cols-[1fr_1.6fr] gap-4 border-b border-line py-3 text-[12.5px]"><dt className="text-steel">{s.label}</dt><dd className="font-medium">{s.value}</dd></div>)}
            </dl>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-line" role="group" aria-label="Quantity">
              <button className="p-3.5 hover:bg-ink hover:text-paper" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={14} /></button>
              <span className="w-10 text-center text-[13px] font-medium tabular-nums" data-testid="pd-qty">{qty}</span>
              <button className="p-3.5 hover:bg-ink hover:text-paper" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} aria-label="Increase quantity"><Plus size={14} /></button>
            </div>
            <button className="btn-primary flex-1 sm:flex-none" onClick={addNow} data-testid="add-to-cart">{added ? 'Added to cart' : 'Add to cart'}</button>
            <button className="btn-outline flex-1 sm:flex-none" onClick={() => { add(p.id, qty); nav('/checkout'); }} data-testid="buy-now">Buy now</button>
          </div>
          <div className="mt-8 flex gap-4 border border-line p-5 text-[12.5px] leading-relaxed">
            <Truck size={18} strokeWidth={1.4} className="mt-0.5 shrink-0" />
            <p>Delivery across Pakistan. Delivery fee <strong className="font-semibold">{formatPKR(settings.deliveryFee)}</strong> per order. Cash on delivery available. We confirm every order by phone or email.</p>
          </div>
        </div>
      </div>
      {data!.related.length > 0 && (
        <section className="mt-24" aria-labelledby="rel"><Eyebrow>You may also need</Eyebrow><h2 id="rel" className="h-section mt-3">More products</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data!.related.map((r) => <ProductCard key={r.id} product={r} />)}</div></section>
      )}
    </div>
  );
}
