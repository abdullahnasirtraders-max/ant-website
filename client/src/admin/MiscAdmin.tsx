import { FormEvent, useEffect, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { api, ApiError } from '../lib/api';
import type { Announcement, Settings } from '../lib/types';
import { Check, Field, Msg } from './ui';

const blankA = { text: '', linkUrl: '', linkLabel: '', isActive: true };

export function AnnouncementsAdmin() {
  const { data, reload } = useAsync(() => api.get<{ announcements: Announcement[] }>('/admin/announcements', true), []);
  const [form, setForm] = useState<(typeof blankA & { id?: string }) | null>(null);
  const [err, setErr] = useState('');
  const save = async (e: FormEvent) => {
    e.preventDefault(); if (!form) return; setErr('');
    const { id, ...body } = form;
    try { if (id) await api.put(`/admin/announcements/${id}`, body, true); else await api.post('/admin/announcements', body, true); setForm(null); reload(); } catch (x) { setErr((x as ApiError).message); }
  };
  return (
    <section aria-labelledby="aa">
      <div className="mb-6 flex items-center justify-between"><h1 id="aa" className="text-2xl font-semibold tracking-tight">Announcements</h1><button className="btn btn-amber" onClick={() => setForm(blankA)} data-testid="new-announcement">New announcement</button></div>
      <p className="mb-6 text-sm text-slate-500">The newest active announcement appears in the bar at the top of the site.</p>
      {form && (
        <form onSubmit={save} className="mb-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="announcement-form">
          {err && <Msg>{err}</Msg>}
          <Field label="Text"><input className="field" value={form.text} maxLength={240} onChange={(e) => setForm({ ...form, text: e.target.value })} required data-testid="a-text" /></Field>
          <div className="grid gap-4 md:grid-cols-2"><Field label="Link URL (optional)"><input className="field" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} /></Field>
            <Field label="Link label (optional)"><input className="field" value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} /></Field></div>
          <Check label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <div className="flex gap-3"><button className="btn btn-mint" data-testid="a-save">Save announcement</button><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button></div>
        </form>)}
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm" data-testid="announcements-list">
        {data?.announcements.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm" data-testid="announcement-row">
            <span className={a.isActive ? '' : 'text-slate-500 line-through'}>{a.text}</span>
            <span className="space-x-2"><button className="btn btn-amber !px-3 !py-1.5 !text-xs" onClick={async () => { await api.put(`/admin/announcements/${a.id}`, { text: a.text, linkUrl: a.linkUrl, linkLabel: a.linkLabel, isActive: !a.isActive }, true); reload(); }}>{a.isActive ? 'Deactivate' : 'Activate'}</button>
              <button className="btn btn-sky !px-3 !py-1.5 !text-xs" onClick={() => setForm({ id: a.id, text: a.text, linkUrl: a.linkUrl, linkLabel: a.linkLabel, isActive: a.isActive })}>Edit</button>
              <button className="btn btn-rose !px-3 !py-1.5 !text-xs" onClick={async () => { if (window.confirm('Delete this announcement?')) { await api.del(`/admin/announcements/${a.id}`, true); reload(); } }}>Delete</button></span>
          </li>))}
      </ul>
      {data && !data.announcements.length && <p className="mt-4 text-sm text-slate-500">No announcements yet.</p>}
    </section>
  );
}

export function SettingsAdmin() {
  const { data } = useAsync(() => api.get<{ settings: Settings }>('/admin/settings', true), []);
  const [s, setS] = useState<Settings | null>(null); const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [errs, setErrs] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setS(data.settings); }, [data]);
  if (!s) return <p className="text-sm text-slate-500">Loading…</p>;
  const text = (k: 'storeName' | 'phone' | 'whatsapp' | 'email' | 'address', label: string) => <Field label={label} error={errs[k]}><input className="field" value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></Field>;
  const soc = (k: keyof Settings['social']) => <Field label={`${k[0].toUpperCase()}${k.slice(1)} URL`} error={errs[`social.${k}`]}><input className="field" value={s.social[k]} onChange={(e) => setS({ ...s, social: { ...s.social, [k]: e.target.value } })} /></Field>;
  const save = async (e: FormEvent) => {
    e.preventDefault(); setMsg(''); setErr(''); setErrs({});
    try { const r = await api.put<{ settings: Settings }>('/admin/settings', { ...s, deliveryFee: Number(s.deliveryFee) }, true); setS(r.settings); setMsg('Settings saved.'); }
    catch (x) { const a = x as ApiError; setErr(a.message); setErrs(a.details || {}); }
  };
  return (
    <form onSubmit={save} className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="settings-form">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      {msg && <Msg tone="ok">{msg}</Msg>}{err && <Msg>{err}</Msg>}
      <Field label="Delivery fee (Rs., per order)" error={errs.deliveryFee}><input className="field" type="number" min={0} value={s.deliveryFee} onChange={(e) => setS({ ...s, deliveryFee: Number(e.target.value) })} data-testid="delivery-fee-input" /></Field>
      {text('storeName', 'Store name')}
      <div className="grid gap-4 md:grid-cols-2">{text('phone', 'Phone')}{text('whatsapp', 'WhatsApp number (with country code)')}</div>
      {text('email', 'Email')}{text('address', 'Address')}
      <div className="grid gap-4 md:grid-cols-2">{soc('facebook')}{soc('instagram')}{soc('youtube')}{soc('tiktok')}</div>
      <button className="btn btn-mint" data-testid="save-settings">Save settings</button>
    </form>
  );
}
