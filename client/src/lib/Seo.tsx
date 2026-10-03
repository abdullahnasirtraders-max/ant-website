import { useEffect } from 'react';

const SITE = (import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin;
const upsert = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = content;
};

export function Seo({ title, description, image, path, jsonLd }: { title: string; description: string; image?: string; path?: string; jsonLd?: object }) {
  useEffect(() => {
    const full = title.includes('ANT') ? title : `${title} | ANT — Abdullah Nasir Traders`;
    document.title = full;
    upsert('name', 'description', description);
    upsert('property', 'og:title', full);
    upsert('property', 'og:description', description);
    upsert('property', 'og:type', 'website');
    upsert('property', 'og:url', SITE + (path ?? window.location.pathname));
    upsert('property', 'og:locale', 'en_PK');
    if (image) upsert('property', 'og:image', image.startsWith('http') ? image : SITE + image);
    upsert('name', 'twitter:card', 'summary_large_image');
    let s: HTMLScriptElement | null = null;
    if (jsonLd) { s = document.createElement('script'); s.type = 'application/ld+json'; s.text = JSON.stringify(jsonLd); document.head.appendChild(s); }
    return () => { s?.remove(); };
  }, [title, description, image, path, jsonLd]);
  return null;
}
