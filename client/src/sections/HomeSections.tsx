import { ArrowRight } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard, FeatureCard, RowCard } from '../components/ProductCard';
import { ArrowLink, Eyebrow, SiteImage } from '../components/ui';
import { aboutBlurb, brandsStrip, images, tagline, why } from '../content/site';
import { brandsOf } from '../lib/brand';
import { CATEGORIES, Product } from '../lib/types';

const wrap = 'mx-auto max-w-[1360px] px-5 md:px-12';

export function Collection({ products }: { products: Product[] }) {
  const [big, ...rest] = products.slice(0, 4);
  if (!big) return null;
  return (
    <section id="collection" className={`${wrap} scroll-mt-20 py-16 md:py-24`} aria-labelledby="col-h">
      <Eyebrow>01 / Collection</Eyebrow>
      <h2 id="col-h" className="h-section mt-3">Our products</h2>
      <p className="mt-3 max-w-[18rem] text-[13px] leading-relaxed text-ink/70">Selected filtration products supplied for automotive and related applications.</p>
      <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <FeatureCard product={big} />
        {rest.length > 0 && <div className="grid gap-5">{rest.slice(0, 3).map((p) => <RowCard key={p.id} product={p} />)}</div>}
      </div>
    </section>
  );
}

// export function Finder({ products }: { products: Product[] }) {
//   const nav = useNavigate();
//   const brands = useMemo(() => brandsOf(products), [products]);
//   const [f, setF] = useState({ category: '', brand: '', model: '', q: '' });
//   const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
//   const submit = (e: FormEvent) => {
//     e.preventDefault();
//     const p = new URLSearchParams();
//     Object.entries(f).forEach(([k, v]) => v.trim() && p.set(k, v.trim()));
//     nav(`/products${p.toString() ? `?${p}` : ''}`);
//   };
//   const dark = 'w-full border border-paper/15 bg-white/[0.03] px-4 py-3.5 text-[13px] text-paper/90 outline-none transition-colors placeholder:text-paper/40 focus:border-paper/60 [&>option]:text-ink';
//   const lab = 'mb-2 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-paper/70';
//   return (
//     <section className="relative overflow-hidden bg-dark text-paper" aria-labelledby="find-h">
//       <SiteImage src={images.finder} alt="" className="absolute inset-y-0 right-0 hidden w-[55%] opacity-50 md:block" />
//       <div className="pointer-events-none absolute inset-y-0 right-[30%] hidden w-1/3 bg-gradient-to-r from-dark to-transparent md:block" aria-hidden />
//       <div className={`${wrap} relative py-16 md:py-20`}>
//         <Eyebrow className="!text-paper/60">02 / Find your filter</Eyebrow>
//         <h2 id="find-h" className="h-section mt-3">Find the right filter.</h2>
//         <p className="mt-3 text-[13px] text-paper/70">Search by application, brand, model or filter number.</p>
//         <form onSubmit={submit} className="mt-10 grid gap-x-5 gap-y-6 md:grid-cols-3" data-testid="finder">
//           <label><span className={lab}>Application</span>
//             <select className={dark} value={f.category} onChange={set('category')}><option value="">Select application</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
//           <label><span className={lab}>Brand</span>
//             <select className={dark} value={f.brand} onChange={set('brand')} disabled={!brands.length}><option value="">{brands.length ? 'Select brand' : 'No brands listed yet'}</option>{brands.map((b) => <option key={b}>{b}</option>)}</select></label>
//           <label><span className={lab}>Vehicle model</span><input className={dark} placeholder="Enter model" value={f.model} onChange={set('model')} /></label>
//           <label className="md:col-span-2"><span className={lab}>Part / filter number</span><input className={dark} placeholder="Enter part number" value={f.q} onChange={set('q')} data-testid="finder-q" /></label>
//           <div className="flex items-end"><button className="btn-light w-full !py-[1.05rem]" data-testid="finder-submit">Find my filter <ArrowRight size={13} /></button></div>
//         </form>
//       </div>
//     </section>
//   );
// }

export function Selected({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className={`${wrap} py-16 md:py-24`} aria-labelledby="sel-h">
      <div className="flex items-end justify-between gap-6">
        <div><Eyebrow>03 / Shop</Eyebrow><h2 id="sel-h" className="h-section mt-3">Selected products</h2></div>
        <ArrowLink to="/products" className="shrink-0" >View all products</ArrowLink>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-testid="selected-grid">{products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </section>
  );
}

export function Why() {
  return (
    <section className={`${wrap} grid gap-12 py-16 md:grid-cols-[1fr_1.55fr] md:py-24`} aria-labelledby="why-h">
      <div><Eyebrow>Why ANT</Eyebrow><h2 id="why-h" className="h-section mt-4 max-w-[12ch]">Built around reliability.</h2></div>
      <ol className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {why.map(([t, d], i) => (
          <li key={t} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-line pb-6">
            <span className="text-[11px] text-steel tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <div><h3 className="text-[11.5px] font-semibold uppercase tracking-[0.1em]">{t}</h3><p className="mt-2 text-[12.5px] leading-relaxed text-ink/70">{d}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AboutBlock() {
  return (
    <section className="bg-panel" aria-labelledby="ab-h">
      <div className="mx-auto grid max-w-[1600px] md:grid-cols-[1fr_1.05fr]">
        <SiteImage src={images.about} alt="ANT warehouse" className="min-h-[260px] md:min-h-[380px]" />
        <div className="px-5 py-14 md:px-16 md:py-20">
          <Eyebrow>About ANT</Eyebrow>
          <h2 id="ab-h" className="h-section mt-4 max-w-[10ch]">Abdullah Nasir Traders</h2>
          <p className="mt-6 max-w-md text-[13px] leading-relaxed text-ink/75">{aboutBlurb}</p>
          <ArrowLink to="/about" className="mt-8">About company</ArrowLink>
        </div>
      </div>
    </section>
  );
}

export function BrandsStrip() {
  return (
    <section className={`${wrap} flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between`} aria-label="Brands and applications">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-14">
        <p className="eyebrow max-w-[9rem] !leading-relaxed">Trusted brands &amp; applications</p>
        <ul className="flex flex-wrap items-center gap-x-12 gap-y-4">{brandsStrip.map((b) => <li key={b} className="text-xl font-bold uppercase tracking-[0.04em] text-steel/80">{b}</li>)}</ul>
      </div>
      <p className="eyebrow max-w-[11rem] !leading-relaxed md:border-l md:border-line md:pl-10">{tagline}</p>
    </section>
  );
}

export function Assistance() {
  return (
    <section className="relative overflow-hidden bg-dark text-paper" aria-labelledby="as-h">
      <div className="pointer-events-none absolute inset-y-0 right-[35%] hidden w-1/4 bg-gradient-to-r from-dark to-transparent md:block" aria-hidden />
      <div className={`${wrap} relative py-16 md:py-20`}>
        <h2 id="as-h" className="text-xl font-semibold uppercase tracking-[0.04em] md:text-2xl">Need assistance?</h2>
        <p className="mt-3 max-w-sm text-[13px] text-paper/70">Our team is here to help you find the right filtration solution.</p>
        <Link to="/contact" className="btn-light mt-7">Contact us <ArrowRight size={13} /></Link>
      </div>
    </section>
  );
}
