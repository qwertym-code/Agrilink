import { PRODUCE, Tomato, Carrot, Strawberry, Grapes, Corn, Avocado, Lemon, Chilli } from './Produce';

/**
 * Produce drifting behind the hero copy. Purely decorative, so it is
 * aria-hidden and sits under the text with pointer-events off — it must never
 * intercept a tap meant for the button.
 */
const SCATTER = [
  { C: Tomato,     size: 54, top: '6%',   left: '4%',   delay: '0s',   dur: '7s'   },
  { C: Carrot,     size: 44, top: '54%',  left: '14%',  delay: '1.2s', dur: '8.5s' },
  { C: Strawberry, size: 40, top: '12%',  left: '74%',  delay: '0.6s', dur: '6.5s' },
  { C: Grapes,     size: 50, top: '56%',  left: '82%',  delay: '1.8s', dur: '9s'   },
  { C: Lemon,      size: 38, top: '70%',  left: '46%',  delay: '2.4s', dur: '7.5s' },
  { C: Corn,       size: 42, top: '2%',   left: '44%',  delay: '0.9s', dur: '8s'   },
];

export function ProduceScatter() {
  return (
    <div className="ag-scatter" aria-hidden="true">
      {SCATTER.map(({ C, size, top, left, delay, dur }, i) => (
        <span
          key={i}
          className="ag-scatter-item"
          style={{ top, left, animationDelay: delay, animationDuration: dur }}
        >
          <C size={size} />
        </span>
      ))}
    </div>
  );
}

/**
 * Slow horizontal ribbon of produce. The track is duplicated so the loop can
 * translate a full 50% and land exactly where it started — a single copy
 * would visibly snap back.
 */
const MARQUEE = [Tomato, Carrot, Avocado, Strawberry, Corn, Grapes, Chilli, Lemon];

export function ProduceMarquee() {
  const track = [...MARQUEE, ...MARQUEE];

  return (
    <div className="ag-marquee" aria-hidden="true">
      <div className="ag-marquee-track">
        {track.map((C, i) => (
          <span key={i} className="ag-marquee-item"><C size={34} /></span>
        ))}
      </div>
    </div>
  );
}

/** Celebratory burst on the order confirmation screen. */
export function ProduceBurst() {
  const picks = PRODUCE.slice(0, 8);

  return (
    <div className="ag-burst" aria-hidden="true">
      {picks.map((C, i) => (
        <span
          key={i}
          className="ag-burst-item"
          style={{ '--i': i, animationDelay: `${i * 0.06}s` }}
        >
          <C size={26} />
        </span>
      ))}
    </div>
  );
}
