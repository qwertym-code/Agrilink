/**
 * Flat illustrated produce. Drawn inline rather than pulled from an icon pack
 * so each piece carries its own colours — the point of these is colour, which
 * a monochrome currentColor icon set can't give.
 *
 * All are 64×64 so they can be swapped freely at any size.
 */

const Wrap = ({ size = 48, title, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role={title ? 'img' : 'presentation'}
    aria-label={title}
    aria-hidden={title ? undefined : true}
    {...rest}
  >
    {title ? <title>{title}</title> : null}
    {children}
  </svg>
);

export const Tomato = (p) => (
  <Wrap {...p}>
    <circle cx="32" cy="37" r="21" fill="#e3453a" />
    <path d="M32 20c8 0 14 5 17 11-3-11-9-16-17-16s-14 5-17 16c3-6 9-11 17-11Z" fill="#f2685e" />
    <path d="M32 19c-4-4-9-5-13-4 2 3 5 5 9 6-5 0-8 2-10 4 4 1 9 0 12-2 3 2 8 3 12 2-2-2-5-4-10-4 4-1 7-3 9-6-4-1-9 0-13 4Z" fill="#3f9e50" />
    <rect x="30" y="12" width="4" height="8" rx="2" fill="#2f7d3e" />
  </Wrap>
);

export const Carrot = (p) => (
  <Wrap {...p}>
    <path d="M28 24h9l-2 26c-.4 4-6 4-6.4 0L28 24Z" fill="#e8802a" />
    <path d="M32.5 24h4.5l-2 26c-.2 2-1.6 3-3 3 1.2-9 .8-20 .5-29Z" fill="#f29a4d" />
    <path d="M32 24c-3-6-8-9-13-9 1 5 5 8 9 9-4 1-7 3-9 6 5 1 10-1 13-4 3 3 8 5 13 4-2-3-5-5-9-6 4-1 8-4 9-9-5 0-10 3-13 9Z" fill="#43a355" />
  </Wrap>
);

export const Broccoli = (p) => (
  <Wrap {...p}>
    <rect x="28" y="34" width="8" height="20" rx="4" fill="#8bc34a" />
    <circle cx="22" cy="28" r="10" fill="#2f7d3e" />
    <circle cx="42" cy="28" r="10" fill="#2f7d3e" />
    <circle cx="32" cy="21" r="12" fill="#3f9e50" />
    <circle cx="26" cy="20" r="4" fill="#57b566" opacity=".7" />
    <circle cx="38" cy="24" r="3" fill="#57b566" opacity=".7" />
  </Wrap>
);

export const Apple = (p) => (
  <Wrap {...p}>
    <path d="M32 22c-4-3-11-3-14 2-4 6-1 18 4 24 3 3 6 2 10 1 4 1 7 2 10-1 5-6 8-18 4-24-3-5-10-5-14-2Z" fill="#dc3b45" />
    <path d="M25 24c-3 1-5 4-5 9 0 5 2 10 4 13-4-6-6-16-2-21 1-1 2-1 3-1Z" fill="#ec5d63" />
    <rect x="30" y="12" width="4" height="10" rx="2" fill="#7a4a25" />
    <path d="M34 16c4-4 9-4 11-2-1 4-6 6-11 4Z" fill="#43a355" />
  </Wrap>
);

export const Grapes = (p) => (
  <Wrap {...p}>
    <rect x="30" y="10" width="4" height="10" rx="2" fill="#7a4a25" />
    <path d="M34 14c4-3 8-3 10-1-2 3-6 4-10 1Z" fill="#43a355" />
    {[[32, 24], [24, 30], [40, 30], [28, 38], [36, 38], [32, 46]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="7" fill="#8352a8" />
    ))}
    {[[30, 22], [22, 28], [26, 36]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="2.4" fill="#a878cc" opacity=".8" />
    ))}
  </Wrap>
);

export const Chilli = (p) => (
  <Wrap {...p}>
    <path d="M24 18c8-2 14 3 16 10 2 8-2 18-10 22-6 3-11-1-9-6 2-4 8-4 11-9 4-6 2-13-8-17Z" fill="#d9342c" />
    <path d="M27 22c6 2 9 7 9 13 0 5-2 9-5 12 5-5 7-12 5-18-1-4-4-6-9-7Z" fill="#eb5a50" />
    <path d="M22 20c-2-4 0-8 4-9 1 3 0 6-4 9Z" fill="#3f9e50" />
    <rect x="20" y="14" width="9" height="4" rx="2" transform="rotate(-20 20 14)" fill="#2f7d3e" />
  </Wrap>
);

export const Corn = (p) => (
  <Wrap {...p}>
    <ellipse cx="32" cy="34" rx="11" ry="20" fill="#f0b429" />
    <ellipse cx="28" cy="32" rx="5" ry="15" fill="#f7cb5c" opacity=".7" />
    {[24, 30, 36, 42].map((y, i) => (
      <ellipse key={i} cx="32" cy={y} rx="10" ry="1.6" fill="#d99b1f" opacity=".55" />
    ))}
    <path d="M21 30c-6-4-8-12-6-18 6 3 9 10 6 18Z" fill="#43a355" />
    <path d="M43 30c6-4 8-12 6-18-6 3-9 10-6 18Z" fill="#2f7d3e" />
  </Wrap>
);

export const Avocado = (p) => (
  <Wrap {...p}>
    <path d="M32 8c9 0 16 9 16 20 0 14-7 28-16 28s-16-14-16-28c0-11 7-20 16-20Z" fill="#4e8b32" />
    <path d="M32 16c6 0 11 6 11 14 0 10-5 20-11 20s-11-10-11-20c0-8 5-14 11-14Z" fill="#9ccc65" />
    <ellipse cx="32" cy="34" rx="7" ry="8" fill="#8d5b2b" />
  </Wrap>
);

export const Strawberry = (p) => (
  <Wrap {...p}>
    <path d="M32 22c10 0 17 5 17 12 0 10-9 22-17 22s-17-12-17-22c0-7 7-12 17-12Z" fill="#e03a48" />
    <path d="M24 26c-3 2-5 5-5 9 0 7 4 15 8 19-6-4-10-14-10-21 0-3 2-6 7-7Z" fill="#ee6069" />
    {[[27, 32], [37, 32], [32, 39], [24, 40], [40, 40], [32, 47]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="1.7" fill="#ffe08a" />
    ))}
    <path d="M32 22c-5 0-9-1-12-3 3-3 8-4 12-1 4-3 9-2 12 1-3 2-7 3-12 3Z" fill="#3f9e50" />
    <rect x="30" y="10" width="4" height="8" rx="2" fill="#2f7d3e" />
  </Wrap>
);

export const Orange = (p) => (
  <Wrap {...p}>
    <circle cx="32" cy="35" r="21" fill="#ef8420" />
    <circle cx="25" cy="28" r="7" fill="#f8a44f" opacity=".65" />
    <rect x="30" y="12" width="4" height="6" rx="2" fill="#7a4a25" />
    <path d="M34 15c4-4 9-4 11-2-2 4-7 5-11 2Z" fill="#43a355" />
  </Wrap>
);

export const Eggplant = (p) => (
  <Wrap {...p}>
    <path d="M40 22c8 4 10 14 5 22-5 9-16 13-23 8-7-4-7-14 0-21 5-5 12-11 18-9Z" fill="#7a4a9e" />
    <path d="M30 28c-5 4-8 10-7 15 1 4 4 6 7 6-6-1-9-6-8-12 .6-4 3-7 8-9Z" fill="#9b6cc0" />
    <path d="M38 20c-1-5 2-8 7-8 0 5-2 8-7 8Z" fill="#3f9e50" />
    <rect x="36" y="15" width="10" height="4" rx="2" transform="rotate(-35 36 15)" fill="#2f7d3e" />
  </Wrap>
);

export const MilkBottle = (p) => (
  <Wrap {...p}>
    <path d="M26 12h12v7l5 8v27a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3V27l5-8v-7Z" fill="#eef3f7" />
    <path d="M21 34h22v20a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3V34Z" fill="#cfe3f2" />
    <rect x="25" y="9" width="14" height="5" rx="2" fill="#3b82c4" />
    <circle cx="32" cy="43" r="6" fill="#fff" opacity=".75" />
  </Wrap>
);

export const BreadLoaf = (p) => (
  <Wrap {...p}>
    <path d="M14 34c0-8 8-14 18-14s18 6 18 14v12a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V34Z" fill="#c98b45" />
    <path d="M14 36h36v10a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V36Z" fill="#e0a961" />
    <path d="M22 28c2-3 5-4 8-4M34 25c3 0 6 1 8 4" stroke="#a06b30" strokeWidth="2.6" strokeLinecap="round" fill="none" />
  </Wrap>
);

export const Lemon = (p) => (
  <Wrap {...p}>
    <ellipse cx="32" cy="34" rx="20" ry="15" transform="rotate(-20 32 34)" fill="#f2cb2b" />
    <ellipse cx="25" cy="29" rx="6" ry="4" transform="rotate(-20 25 29)" fill="#f8de6d" opacity=".8" />
    <path d="M48 22c3-2 6-2 7 0-2 2-5 3-7 0Z" fill="#43a355" />
  </Wrap>
);

/** Every illustration, for the decorative scatter and marquee. */
export const PRODUCE = [
  Tomato, Carrot, Broccoli, Apple, Grapes, Chilli,
  Corn, Avocado, Strawberry, Orange, Eggplant, Lemon,
  MilkBottle, BreadLoaf,
];

/** Category → the illustration that stands in when a listing has no photo. */
export const produceForCategory = {
  vegetables: Broccoli,
  fruits: Apple,
  dairy: MilkBottle,
  bakery: BreadLoaf,
  other: Carrot,
};

/** Category → its colour, used on tiles, chips and empty thumbnails. */
export const categoryColor = {
  vegetables: '#159a58',
  fruits: '#e0473f',
  dairy: '#3b82c4',
  bakery: '#c07a2e',
  other: '#7a4a9e',
};
