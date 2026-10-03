import { img, srcSet } from '../lib/format';

/** One treatment for every product photo: flat plate, multiply blend (white photo backgrounds vanish), contained crop. */
export function ProductImage({ src, alt, className = '', priority = false, width = 800 }: { src?: string; alt: string; className?: string; priority?: boolean; width?: number }) {
  return (
    <div className={`product-plate ${className}`}>
      <img src={img(src || '/placeholders/product-1.svg', width)} srcSet={src ? srcSet(src) : undefined} sizes="(min-width:1024px) 40vw, 90vw" alt={alt}
        loading={priority ? 'eager' : 'lazy'} decoding="async" draggable={false} className="h-full w-full object-contain p-[7%] mix-blend-multiply" />
    </div>
  );
}
