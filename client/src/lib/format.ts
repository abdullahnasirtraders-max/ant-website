export const formatPKR = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const waLink = (num: string, text = '') => `https://wa.me/${num.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** Cloudinary delivery optimisation (f_auto,q_auto,width). Other URLs pass through unchanged. */
export function img(url: string, width: number) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}
export function srcSet(url: string) {
  return url.includes('res.cloudinary.com') ? [480, 960, 1440].map((w) => `${img(url, w)} ${w}w`).join(', ') : undefined;
}
