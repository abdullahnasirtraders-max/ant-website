import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { brandOf } from '../lib/brand';
import { formatPKR } from '../lib/format';
import type { Product } from '../lib/types';
import { ProductImage } from './ProductImage';
import { ArrowLink } from './ui';

const sub = (p: Product) => (brandOf(p) ? `Brand: ${brandOf(p)}` : p.category);
const nameCls = 'text-[11.5px] font-semibold uppercase tracking-[0.07em] leading-snug';

/** Grid card (Selected products, shop). */
export function ProductCard({ product: p, showAdd = false }: { product: Product; showAdd?: boolean }) {
  const { add } = useCart();
  return (
    <article className="flex flex-col border border-line bg-panel/40 transition-colors hover:border-ink/40" data-testid="product-card">
      <Link to={`/products/${p.slug}`} aria-label={p.name} className="block"><ProductImage src={p.image.url} alt={p.name} className="aspect-[4/3]" width={600} /></Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className={nameCls}><Link to={`/products/${p.slug}`}>{p.name}</Link></h3>
        <p className="mt-1.5 text-[11px] text-steel">{sub(p)}</p>
        <p className="mt-3 text-[13px] font-medium tabular-nums">{formatPKR(p.price)}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <ArrowLink to={`/products/${p.slug}`}>View product</ArrowLink>
          {showAdd && <button onClick={() => add(p.id)} aria-label={`Add ${p.name} to cart`} className="text-[10.5px] font-semibold uppercase tracking-[0.14em] hover:text-steel">Add +</button>}
        </div>
      </div>
    </article>
  );
}

/** Large card for the collection bento. */
export function FeatureCard({ product: p }: { product: Product }) {
  return (
    <article className="flex h-full flex-col border border-line bg-panel/40" data-testid="product-card">
      <Link to={`/products/${p.slug}`} aria-label={p.name} className="block flex-1"><ProductImage src={p.image.url} alt={p.name} className="h-full min-h-[240px]" width={1000} priority /></Link>
      <div className="p-6">
        <h3 className={nameCls}><Link to={`/products/${p.slug}`}>{p.name}</Link></h3>
        <p className="mt-1.5 text-[11px] text-steel">{sub(p)}</p>
        <p className="mt-3 text-[13px] font-medium tabular-nums">{formatPKR(p.price)}</p>
        <ArrowLink to={`/products/${p.slug}`} className="mt-5">View product</ArrowLink>
      </div>
    </article>
  );
}

/** Compact horizontal card for the collection bento. */
export function RowCard({ product: p }: { product: Product }) {
  return (
    <article className="grid grid-cols-[38%_1fr] border border-line bg-panel/40" data-testid="product-card">
      <Link to={`/products/${p.slug}`} aria-label={p.name} className="block"><ProductImage src={p.image.url} alt={p.name} className="h-full min-h-[120px]" width={500} /></Link>
      <div className="flex flex-col justify-center p-5">
        <h3 className={nameCls}><Link to={`/products/${p.slug}`}>{p.name}</Link></h3>
        <p className="mt-1.5 text-[11px] text-steel">{sub(p)}</p>
        <p className="mt-2 text-[13px] font-medium tabular-nums">{formatPKR(p.price)}</p>
        <ArrowLink to={`/products/${p.slug}`} className="mt-4 self-start">View product</ArrowLink>
      </div>
    </article>
  );
}
