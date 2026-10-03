import { Link } from 'react-router-dom';
import { AboutBlock, BrandsStrip, Why } from '../sections/HomeSections';
import { WhatsAppIcon } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { aboutBlurb } from '../content/site';
import { waLink } from '../lib/format';
import { Seo } from '../lib/Seo';

export function About() {
  return (
    <>
      <Seo title="About" description="ANT — Abdullah Nasir Traders supplies automotive and industrial filtration products across Pakistan." path="/about" />
      <div className="mx-auto max-w-[1360px] px-5 pt-12 md:px-12 md:pt-16">
        <p className="eyebrow">About ANT</p>
        <h1 className="h-section mt-3 max-w-[14ch]">Abdullah Nasir Traders</h1>
        <p className="mt-8 max-w-xl text-[13px] leading-[1.9] text-ink/75">{aboutBlurb}</p>
        <p className="mt-4 max-w-xl text-[13px] leading-[1.9] text-steel">Placeholder text: replace this page with your company story, history and what customers can expect when they order from ANT.</p>
        <Link to="/products" className="btn-primary mt-8">View products</Link>
      </div>
      <div className="mt-16"><AboutBlock /></div>
      <Why />
      <BrandsStrip />
    </>
  );
}

export function Contact() {
  const { settings: s } = useStore();
  const rows: [string, string, string?][] = [['Phone', s.phone, `tel:${s.phone}`], ['WhatsApp', s.whatsapp, waLink(s.whatsapp)], ['Email', s.email, `mailto:${s.email}`], ['Address', s.address]];
  const social = Object.entries(s.social).filter(([, v]) => v);
  const has = rows.some(([, v]) => v);
  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-24 pt-12 md:px-12 md:pt-16">
      <Seo title="Contact" description="Contact ANT — Abdullah Nasir Traders by phone, WhatsApp or email." path="/contact" />
      <p className="eyebrow">We are here to help</p>
      <h1 className="h-section mt-3">Contact</h1>
      <p className="mt-4 max-w-sm text-[13px] text-ink/70">Tell us your vehicle, model or filter number and we will help you find the right product.</p>
      <dl className="mt-10 max-w-2xl border-t border-line">
        {rows.filter(([, v]) => v).map(([k, v, href]) => (
          <div key={k} className="grid grid-cols-[8rem_1fr] border-b border-line py-5 text-[13px]"><dt className="text-steel">{k}</dt>
            <dd className="font-medium">{href ? <a href={href} className="hover:text-steel" target={k === 'WhatsApp' ? '_blank' : undefined} rel="noreferrer">{v}</a> : v}</dd></div>
        ))}
        {social.map(([k, v]) => <div key={k} className="grid grid-cols-[8rem_1fr] border-b border-line py-5 text-[13px]"><dt className="capitalize text-steel">{k}</dt><dd><a href={v} className="font-medium hover:text-steel" target="_blank" rel="noreferrer">{v}</a></dd></div>)}
      </dl>
      {!has && <p className="mt-8 text-[13px] text-steel">Contact details will appear here once they are added in the admin dashboard (Settings).</p>}
      {s.whatsapp && <a href={waLink(s.whatsapp, 'Hello ANT, I would like to inquire about a filter.')} target="_blank" rel="noreferrer" className="btn-primary mt-8"><WhatsAppIcon size={14} />Inquire on WhatsApp</a>}
    </div>
  );
}

export function NotFound() {
  return <div className="mx-auto max-w-[1360px] px-5 py-28 md:px-12"><Seo title="Page not found" description="This page does not exist." /><p className="eyebrow">404</p><h1 className="h-section mt-3">Page not found</h1><Link to="/" className="btn-primary mt-8">Back to home</Link></div>;
}
