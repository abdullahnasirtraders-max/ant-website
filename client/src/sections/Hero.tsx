import { ArrowDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteImage, Eyebrow } from '../components/ui';
import { hero, images } from '../content/site';
import { useStore } from '../context/StoreContext';

export function Hero() {
  const { settings } = useStore();
  const phoneHref = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : '/contact';
  return (
    <section className="relative overflow-hidden" aria-label="ANT — Precision filtration">
      <SiteImage src={images.hero} alt="ANT air filter" priority className="hidden md:absolute md:inset-y-0 md:right-0 md:block md:w-[48%]" position="left center" />
      <div className="pointer-events-none absolute inset-y-0 right-[40%] hidden w-40 bg-gradient-to-r from-paper to-transparent md:block" aria-hidden />
      <div className="relative mx-auto flex max-w-[1360px] flex-col px-5 pb-10 pt-14 md:min-h-[clamp(540px,45vw,700px)] md:justify-center md:px-12 md:pb-24 md:pt-0">
        <div className="md:max-w-[52%]">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 className="mt-6">
            <span className="display block text-[clamp(2.4rem,5.6vw,4.9rem)]">{hero.strong}</span>
            <span className="mt-1 block text-[clamp(1.5rem,3.5vw,3.1rem)] font-light uppercase leading-tight tracking-tight">{hero.light}</span>
          </h1>
          <p className="mt-6 max-w-[26rem] text-[13px] leading-relaxed text-ink/75">{hero.body}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/products" className="btn-primary" data-testid="hero-explore">Explore products <ArrowRight size={13} /></Link>
            {phoneHref.startsWith('http') ? <a href={phoneHref} target="_blank" rel="noreferrer" className="btn-outline">Request an inquiry</a> : <Link to={phoneHref} className="btn-outline">Request an inquiry</Link>}
          </div>
        </div>
        <SiteImage src={images.hero} alt="ANT air filter" className="mt-10 aspect-[4/3] md:hidden" position="left center" />
        <div className="absolute inset-x-5 bottom-8 hidden items-center justify-between text-[10.5px] uppercase tracking-[0.16em] md:flex md:inset-x-12">
          <span className="flex items-center gap-4">ANT / 01 <span className="h-px w-40 bg-ink/40" /></span>
          <a href="#collection" className="flex items-center gap-2">Scroll to explore <ArrowDown size={13} /></a>
        </div>
      </div>
    </section>
  );
}
