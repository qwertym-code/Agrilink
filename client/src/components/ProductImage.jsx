import { useState, useEffect } from 'react';
import { LeafIcon } from './Icons';

/**
 * Product photo with a graceful fallback. Image URLs are typed in by retailers
 * and point at hosts we don't control, so a dead link is a normal condition,
 * not an exception — without onError the browser shows its own broken-image
 * glyph, which looks like the app is broken.
 */
export default function ProductImage({ src, alt, iconSize = 24, className = '', style, children }) {
  const [failed, setFailed] = useState(false);

  // A new src deserves a fresh attempt, otherwise one bad URL poisons the slot.
  useEffect(() => { setFailed(false); }, [src]);

  return (
    <div className={`ag-thumb ${className}`} style={style}>
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div className="ag-thumb-empty"><LeafIcon size={iconSize} /></div>
      )}
      {/* Badges and other overlays position against this box. */}
      {children}
    </div>
  );
}
