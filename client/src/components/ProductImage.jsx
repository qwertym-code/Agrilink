import { useState, useEffect } from 'react';
import { produceForCategory, categoryColor } from './Produce';

/**
 * Product photo with an illustrated fallback.
 *
 * Image URLs are typed in by retailers and point at hosts we don't control,
 * so a dead link is a normal condition rather than an exception — without
 * onError the browser draws its own broken-image glyph, which reads as the
 * app being broken. The stand-in is drawn from the product's category, so a
 * missing photo still looks deliberate.
 */
export default function ProductImage({
  src,
  alt,
  category = 'other',
  iconSize = 34,
  className = '',
  style,
  children,
}) {
  const [failed, setFailed] = useState(false);

  // A new src deserves a fresh attempt, or one bad URL poisons the slot.
  useEffect(() => { setFailed(false); }, [src]);

  const Illustration = produceForCategory[category] || produceForCategory.other;
  const tint = categoryColor[category] || categoryColor.other;

  return (
    <div className={`ag-thumb ${className}`} style={style}>
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div
          className="ag-thumb-empty"
          style={{ background: `linear-gradient(150deg, ${tint}22, ${tint}0d)` }}
        >
          <Illustration size={iconSize} />
        </div>
      )}
      {/* Badges and other overlays position against this box. */}
      {children}
    </div>
  );
}
