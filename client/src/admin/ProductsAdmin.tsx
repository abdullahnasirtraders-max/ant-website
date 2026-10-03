import { FormEvent, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { api, ApiError } from '../lib/api';
import { formatPKR } from '../lib/format';
import { CATEGORIES, Product, Spec } from '../lib/types';
import { Check, Field, Msg } from './ui';

const blank = { name: '', sku: '', category: 'Vehicles', shortDescription: '', description: '', price: '', imageUrl: '', publicId: '', specs: [] as Spec[], isActive: true, isFeatured: false, sortOrder: '0' };
type Form = typeof blank;
const fromProduct = (p: Product): Form => ({ name: p.name, sku: p.sku, category: p.category, shortDescription: p.shortDescription, description: p.description, price: String(p.price), imageUrl: p.image.url, publicId: p.image.publicId, specs: p.specifications, isActive: p.isActive, isFeatured: p.isFeatured, sortOrder: String(p.sortOrder) });

export default function ProductsAdmin({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const { data, reload, loading } = useAsync(() => api.get<{ products: Product[] }>('/admin/products', true), []);
  const [editing, setEditing] = useState<{ id?: string; form: Form } | null>(null);
  const [err, setErr] = useState(''); const [errs, setErrs] = useState<Record<string, string>>({}); const [info, setInfo] = useState(''); const [busy, setBusy] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setEditing((e) => e && { ...e, form: { ...e.form, [k]: v } });
  const f = editing?.form;

  const save = async (e: FormEvent) => {
    e.preventDefault(); if (!editing) return;
    setBusy(true); setErr(''); setErrs({});
    const b = editing.form;
    const body = { name: b.name, sku: b.sku, category: b.category, shortDescription: b.shortDescription, description: b.description, price: Number(b.price), image: { url: b.imageUrl, publicId: b.publicId },
      specifications: b.specs.filter((s) => s.label.trim() && s.value.trim()), isActive: b.isActive, isFeatured: b.isFeatured, sortOrder: Number(b.sortOrder) || 0 };
    try {
      if (editing.id) await api.put(`/admin/products/${editing.id}`, body, true); else await api.post('/admin/products', body, true);
      setEditing(null); setInfo(editing.id ? 'Product updated.' : 'Product created.'); reload();
    } catch (x) { const a = x as ApiError; setErr(a.message); setErrs(a.details || {}); } finally { setBusy(false); }
  };
  const toggle = async (p: Product, patch: Partial<Product>) => {
    const form = { ...fromProduct(p) };
    await api.put(`/admin/products/${p.id}`, { name: form.name, sku: form.sku, category: form.category, shortDescription: form.shortDescription, description: form.description, price: p.price, image: p.image, specifications: p.specifications, isActive: p.isActive, isFeatured: p.isFeatured, sortOrder: p.sortOrder, ...patch }, true);
    reload();
  };
  const del = async (p: Product) => { if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return; await api.del(`/admin/products/${p.id}`, true); setInfo('Product deleted.'); reload(); };
  const upload = async (file?: File) => {
    if (!file) return; setErr('');
    try { const fd = new FormData(); fd.append('image', file); const r = await api.upload<{ url: string; publicId: string }>('/admin/uploads/image', fd); set('imageUrl', r.url); set('publicId', r.publicId); }
    catch (x) { setErr((x as ApiError).message); }
  };

  return (
    <section aria-labelledby="pa">
      <div className="mb-8 flex items-center justify-between"><h1 id="pa" className="text-2xl font-semibold tracking-tight text-slate-900">Products</h1>
        <button className="btn btn-mint" onClick={() => { setErr(''); setErrs({}); setEditing({ form: blank }); }} data-testid="new-product">New product</button></div>
      {info && <div className="mb-4"><Msg tone="ok">{info}</Msg></div>}

      {editing && f && (
        <form onSubmit={save} className="mb-10 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="product-form">
          <h2 className="text-base font-semibold">{editing.id ? 'Edit product' : 'New product'}</h2>
          {err && <Msg>{err}</Msg>}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" error={errs.name}><input className="field" value={f.name} onChange={(e) => set('name', e.target.value)} required data-testid="p-name" /></Field>
            <Field label="Price (Rs.)" error={errs.price}><input className="field" type="number" min={0} value={f.price} onChange={(e) => set('price', e.target.value)} required data-testid="p-price" /></Field>
            <Field label="Category"><select className="field" value={f.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Part number / SKU"><input className="field" value={f.sku} onChange={(e) => set('sku', e.target.value)} /></Field>
          </div>
          <Field label="Short description" error={errs.shortDescription}><input className="field" maxLength={200} value={f.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} /></Field>
          <Field label="Description"><textarea className="field min-h-28" value={f.description} onChange={(e) => set('description', e.target.value)} /></Field>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field label="Image URL (https, or upload)" error={errs['image.url']}><input className="field" value={f.imageUrl} onChange={(e) => { set('imageUrl', e.target.value); set('publicId', ''); }} /></Field>
            <div><span className="label">Upload image</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={!uploadsEnabled} onChange={(e) => upload(e.target.files?.[0])} className="text-sm" />
              {!uploadsEnabled && <p className="mt-1 text-xs text-slate-500">Cloudinary is not configured.</p>}</div>
          </div>
          {f.imageUrl && <img src={f.imageUrl} alt="" className="h-28 border border-slate-200 bg-white object-contain p-1" />}
          <fieldset><legend className="label">Specifications</legend>
            {f.specs.map((s, i) => (
              <div key={i} className="mb-2 grid grid-cols-[1fr_2fr_auto] gap-2">
                <input className="field" placeholder="Label" value={s.label} onChange={(e) => set('specs', f.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input className="field" placeholder="Value" value={s.value} onChange={(e) => set('specs', f.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                <button type="button" className="btn btn-rose !px-3 !py-1.5 !text-xs" onClick={() => set('specs', f.specs.filter((_, j) => j !== i))}>Remove</button></div>))}
            <button type="button" className="btn-outline !py-2" onClick={() => set('specs', [...f.specs, { label: '', value: '' }])}>Add specification</button></fieldset>
          <div className="flex flex-wrap items-center gap-6">
            <Check label="Active (visible in shop)" checked={f.isActive} onChange={(v) => set('isActive', v)} testId="p-active" />
            <Check label="Featured (homepage)" checked={f.isFeatured} onChange={(v) => set('isFeatured', v)} />
            <label className="flex items-center gap-2 text-sm">Sort order<input className="field !w-20" type="number" min={0} value={f.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} /></label>
          </div>
          <div className="flex gap-3"><button className="btn btn-mint" disabled={busy} data-testid="p-save">{busy ? 'Saving…' : 'Save product'}</button><button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button></div>
        </form>
      )}

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"><table className="w-full min-w-[720px] text-left text-sm" data-testid="products-table">
        <thead className="border-b border-slate-100 text-slate-500"><tr><th className="px-3 py-3 font-medium">Product</th><th className="font-medium">Price</th><th className="font-medium">Active</th><th className="font-medium">Featured</th><th /></tr></thead>
        <tbody>{data?.products.map((p) => (
          <tr key={p.id} className="border-b border-slate-100" data-testid="product-row">
            <td className="px-3 py-3"><div className="flex items-center gap-3"><img src={p.image.url || '/placeholders/product-1.svg'} alt="" className="h-12 w-10 border border-slate-200 bg-white object-contain" /><div><p className="font-semibold">{p.name}</p><p className="text-xs text-slate-500">{p.category}</p></div></div></td>
            <td className="tabular-nums">{formatPKR(p.price)}</td>
            <td><input type="checkbox" checked={p.isActive} onChange={(e) => toggle(p, { isActive: e.target.checked })} aria-label={`${p.name} active`} /></td>
            <td><input type="checkbox" checked={p.isFeatured} onChange={(e) => toggle(p, { isFeatured: e.target.checked })} aria-label={`${p.name} featured`} /></td>
            <td className="space-x-3 text-right"><button className="btn btn-sky !px-3 !py-1.5 !text-xs" onClick={() => { setInfo(''); setErr(''); setErrs({}); setEditing({ id: p.id, form: fromProduct(p) }); window.scrollTo({ top: 0 }); }} data-testid="edit-product">Edit</button><button className="btn btn-rose !px-3 !py-1.5 !text-xs" onClick={() => del(p)} data-testid="delete-product">Delete</button></td>
          </tr>))}</tbody></table></div>
    </section>
  );
}
