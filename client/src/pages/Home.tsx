import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { Seo } from '../lib/Seo';
import type { Product } from '../lib/types';
import { Hero } from '../sections/Hero';
import { AboutBlock, Assistance, BrandsStrip, Selected, Why } from '../sections/HomeSections';

export default function Home() {
  const { data, error, loading, reload } = useAsync(() => api.get<{ products: Product[] }>('/products'), []);
  const products = data?.products ?? [];
  const selected = useMemo(() => [...products.filter((p) => p.isFeatured), ...products.filter((p) => !p.isFeatured)].slice(0, 4), [products]);
  return (
    <>
      <Seo title="ANT — Abdullah Nasir Traders | Air filters in Pakistan" description="Precision filtration for vehicles, commercial transport and industrial applications. Order online with delivery across Pakistan." path="/" />
      <Hero />
      {loading && <div className="mx-auto max-w-[1360px] px-5 py-24 text-[13px] text-steel md:px-12">Loading products…</div>}
      {error && <div className="mx-auto max-w-[1360px] px-5 py-24 text-[13px] md:px-12">We could not load products. <button onClick={reload} className="underline">Try again</button> or <Link to="/contact" className="underline">contact us</Link>.</div>}
      {!loading && !error && <><Selected products={selected} /></>}
      <Why />
      <AboutBlock />
      <BrandsStrip />
      <Assistance />
    </>
  );
}
