import type { Product } from './types';

/** Brand is read from a specification row labelled "Brand" (set it in admin). No schema change needed. */
export const brandOf = (p: Product) => p.specifications.find((s) => s.label.trim().toLowerCase() === 'brand')?.value.trim() || '';
export const brandsOf = (list: Product[]) => [...new Set(list.map(brandOf).filter(Boolean))].sort();
export const haystack = (p: Product) => [p.name, p.sku, p.shortDescription, p.description, ...p.specifications.map((s) => s.value)].join(' ').toLowerCase();
