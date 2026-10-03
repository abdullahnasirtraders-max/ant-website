import { ReactNode } from 'react';

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}{error && <span className="field-error block">{error}</span>}</label>;
}
export function Check({ label, checked, onChange, testId }: { label: string; checked: boolean; onChange: (v: boolean) => void; testId?: string }) {
  return <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} />{label}</label>;
}
export const Msg = ({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'ok' }) => (
  <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{children}</p>
);

const pills: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800', Confirmed: 'bg-sky-100 text-sky-700', Processing: 'bg-violet-100 text-violet-700',
  Shipped: 'bg-indigo-100 text-indigo-700', Delivered: 'bg-emerald-100 text-emerald-700', Cancelled: 'bg-rose-100 text-rose-700',
  Unpaid: 'bg-slate-100 text-slate-600', Paid: 'bg-emerald-100 text-emerald-700', Failed: 'bg-rose-100 text-rose-700', Refunded: 'bg-slate-100 text-slate-600',
};
export const StatusPill = ({ value }: { value: string }) => <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${pills[value] || 'bg-slate-100 text-slate-600'}`}>{value}</span>;
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
export const PageTitle = ({ children, sub, action }: { children: ReactNode; sub?: string; action?: ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div><h1 className="text-2xl font-semibold tracking-tight text-slate-900">{children}</h1>{sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}</div>{action}
  </div>
);
