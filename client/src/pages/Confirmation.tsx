import { Link, useLocation, useParams } from 'react-router-dom';
import { WhatsAppIcon } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { formatPKR, waLink } from '../lib/format';
import { Seo } from '../lib/Seo';

export default function Confirmation() {
  const { orderNumber } = useParams();
  const { state } = useLocation() as { state?: { order?: { total: number; paymentMethod: string } } };
  const { settings } = useStore();
  const o = state?.order;
  return (
    <div className="mx-auto max-w-[1360px] px-5 py-24 md:px-12 md:py-32">
      <Seo title="Order received" description="Thank you for your order." path="/order-confirmation" />
      <p className="eyebrow">Thank you</p>
      <h1 className="h-section mt-3">Order received</h1>
      <p className="eyebrow mt-10">Order number</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight" data-testid="order-number">{orderNumber}</p>
      {o && <p className="mt-4 text-[13px]">Total {formatPKR(o.total)} · {o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment'}</p>}
      <p className="mt-6 max-w-md text-[13px] leading-relaxed text-ink/70">We will confirm your order by phone or email. Please keep your order number for reference.</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link to="/products" className="btn-primary">Continue shopping</Link>
        {settings.whatsapp && <a className="btn-outline" href={waLink(settings.whatsapp, `Hello, my order number is ${orderNumber}`)} target="_blank" rel="noreferrer"><WhatsAppIcon size={14} />WhatsApp us</a>}
      </div>
    </div>
  );
}
