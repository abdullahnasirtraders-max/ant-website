const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number; details?: Record<string, string>;
  constructor(message: string, status: number, details?: Record<string, string>) { super(message); this.status = status; this.details = details; }
}

async function request<T>(path: string, init: RequestInit = {}, admin = false): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (admin) headers['x-ant-csrf'] = '1';
  const res = await fetch(BASE + path, { ...init, headers, credentials: 'include' });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || 'Request failed', res.status, data?.details);
  return data as T;
}
const json = (b: unknown) => JSON.stringify(b);

export const api = {
  get: <T>(p: string, admin = false) => request<T>(p, {}, admin),
  post: <T>(p: string, b?: unknown, admin = false) => request<T>(p, { method: 'POST', body: b === undefined ? undefined : json(b) }, admin),
  put: <T>(p: string, b: unknown, admin = false) => request<T>(p, { method: 'PUT', body: json(b) }, admin),
  patch: <T>(p: string, b: unknown, admin = false) => request<T>(p, { method: 'PATCH', body: json(b) }, admin),
  del: <T>(p: string, admin = false) => request<T>(p, { method: 'DELETE' }, admin),
  upload: <T>(p: string, form: FormData) => request<T>(p, { method: 'POST', body: form }, true),
};
