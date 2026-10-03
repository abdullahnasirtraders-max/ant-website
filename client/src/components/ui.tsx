import { ArrowRight } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';

export const Eyebrow = ({ children, className = '' }: { children: ReactNode; className?: string }) => <p className={`eyebrow ${className}`}>{children}</p>;

export function ArrowLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return <Link to={to} className={`arrow-link ${className}`}>{children}<ArrowRight size={12} strokeWidth={1.75} aria-hidden /></Link>;
}

export function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21l1.65-4.8A8.5 8.5 0 1 1 8 19.4L3 21z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.3-1.7-.9-.8.6a3.5 3.5 0 0 1-1.7-1.7l.6-.8-.9-1.7z" />
    </svg>
  );
}

/** Site photo slot: shows a quiet labelled panel if the file is missing, never a broken image. */
export function SiteImage({ src, alt, className = '', position = 'center', priority = false }: { src: string; alt: string; className?: string; position?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-panel ${className}`}>
      {!failed && <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} className="h-full w-full object-cover" style={{ objectPosition: position }} />}
      {failed && <div className="absolute inset-0 grid place-items-center px-4 text-center text-[10px] uppercase tracking-[0.2em] text-steel">{alt}</div>}
    </div>
  );
}
